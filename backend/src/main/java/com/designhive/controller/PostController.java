package com.designhive.controller;

import com.designhive.entity.Post;
import com.designhive.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:5173") // Update to match frontend URL
public class PostController {

    @Autowired
    private PostService postService;

    // ✅ Get all posts
    @GetMapping
    public ResponseEntity<?> getPosts() {
        try {
            return ResponseEntity.ok(postService.getAllPosts());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching posts");
        }
    }

    // ✅ Get posts by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPostsByUser(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(postService.getPostsByUser(userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching user's posts");
        }
    }

    // ✅ Like a post
    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(@PathVariable String id) {
        try {
            long updatedLikes = postService.likePost(id);
            return ResponseEntity.ok(Map.of("likes", updatedLikes));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error liking post");
        }
    }

    // ✅ Add a comment
    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            postService.addComment(id, body.get("text"));
            return ResponseEntity.ok("Comment added");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error adding comment");
        }
    }

    // ✅ Get comments for a post
    @GetMapping("/{id}/comments")
    public ResponseEntity<?> getComments(@PathVariable String id) {
        try {
            return ResponseEntity.ok(postService.getComments(id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching comments");
        }
    }

    // ✅ Edit comment
    @PutMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<?> editComment(@PathVariable String postId, @PathVariable String commentId,
            @RequestBody Map<String, String> body) {
        try {
            postService.editComment(postId, commentId, body.get("text"));
            return ResponseEntity.ok("Comment edited");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error editing comment");
        }
    }

    // ✅ Delete comment
    @DeleteMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable String postId, @PathVariable String commentId) {
        try {
            postService.deleteComment(postId, commentId);
            return ResponseEntity.ok("Comment deleted");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting comment");
        }
    }

    // ✅ Create a post
    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody Post post) {
        try {
            Post savedPost = postService.createPost(post);
            return ResponseEntity.ok(savedPost);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error creating post");
        }
    }

    // ✅ Update a post (content, tags, etc.)
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        try {
            postService.updatePost(id, updates);
            return ResponseEntity.ok("Post updated");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating post");
        }
    }

    // ✅ Delete a post
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable String id) {
        try {
            postService.deletePost(id);
            return ResponseEntity.ok("Post deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting post");
        }
    }

    // ✅ Search posts by keyword (basic)
    @GetMapping("/search")
    public ResponseEntity<?> searchPosts(@RequestParam("q") String keyword) {
        try {
            return ResponseEntity.ok(postService.searchPostsByKeyword(keyword));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error searching posts");
        }
    }
}
