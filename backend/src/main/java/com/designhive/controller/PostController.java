package com.designhive.controller;

import com.designhive.entity.Post;
import com.designhive.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:5173") // Update to frontend origin
public class PostController {

    @Autowired
    private PostService postService;

    // Get all posts
    @GetMapping
    public ResponseEntity<?> getPosts() {
        try {
            return ResponseEntity.ok(postService.getAllPosts());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching posts");
        }
    }

    // Like a post
    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(@PathVariable String id) {
        try {
            long updatedLikes = postService.likePost(id);
            return ResponseEntity.ok(Map.of("likes", updatedLikes));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error liking post");
        }
    }

    // Add a comment to a post
    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            postService.addComment(id, body.get("text"));
            return ResponseEntity.ok("Comment added");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error adding comment");
        }
    }

    // Get comments for a post
    @GetMapping("/{id}/comments")
    public ResponseEntity<?> getComments(@PathVariable String id) {
        try {
            return ResponseEntity.ok(postService.getComments(id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching comments");
        }
    }

    // Edit a comment
    @PutMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<?> editComment(@PathVariable String postId, @PathVariable String commentId, @RequestBody Map<String, String> body) {
        try {
            postService.editComment(postId, commentId, body.get("text"));
            return ResponseEntity.ok("Comment edited");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error editing comment");
        }
    }

    // Delete a comment
    @DeleteMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable String postId, @PathVariable String commentId) {
        try {
            postService.deleteComment(postId, commentId);
            return ResponseEntity.ok("Comment deleted");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting comment");
        }
    }

    // ✅ Create a new post with full Post object (including media, tags, etc.)
    // ✅ Create a new post with full Post object (including media, tags, etc.)
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
}
