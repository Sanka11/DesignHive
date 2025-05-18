package com.designhive.controller;

import com.designhive.entity.Post;
import com.designhive.service.PostService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController //handles HTTP requests and returns JSON/text
@RequestMapping("/api/posts")//All endpoints here will start with /api/posts
@CrossOrigin(origins = "http://localhost:5173")//Allow requests only from React frontend running at port 5173
public class PostController {

    @Autowired //Automatically injects Spring beans (objects)
    private PostService postService;

    private static final Logger logger = LoggerFactory.getLogger(PostController.class);

    // Get all posts
    @GetMapping
    public ResponseEntity<?> getPosts() {
        try {
            return ResponseEntity.ok(postService.getAllPosts());
        } catch (Exception e) {
            logger.error("Error fetching posts", e);
            return ResponseEntity.status(500).body("Error fetching posts");
        }
    }

    // Get posts by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPostsByUser(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(postService.getPostsByUser(userId));
        } catch (Exception e) {
            logger.error("Error fetching user's posts", e);
            return ResponseEntity.status(500).body("Error fetching user's posts");
        }
    }

    // Like a post
    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String username = body.get("username");
    
            if (email == null || username == null) {
                return ResponseEntity.badRequest().body("Missing liker info");
            }
    
            long updatedLikes = postService.likePost(id, email, username);
            return ResponseEntity.ok(Map.of("likes", updatedLikes));
        } catch (Exception e) {
            logger.error("Error liking post", e);
            return ResponseEntity.status(500).body("Error liking post");
        }
    }
    
    @PostMapping("/{id}/unlike")
public ResponseEntity<?> unlikePost(@PathVariable String id, @RequestBody Map<String, String> body) {
    try {
        String email = body.get("email");

        if (email == null) {
            return ResponseEntity.badRequest().body("Missing unliker email");
        }

        long updatedLikes = postService.unlikePost(id, email);
        return ResponseEntity.ok(Map.of("likes", updatedLikes));
    } catch (Exception e) {
        logger.error("Error unliking post", e);
        return ResponseEntity.status(500).body("Error unliking post");
    }
}




    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            String username = body.get("username");
            String email = body.get("email");
            String text = body.get("text");
    
            if (username == null || email == null || text == null) {
                return ResponseEntity.badRequest().body("Missing required comment fields");
            }
    
            postService.addComment(id, email, username, text);
            return ResponseEntity.ok("Comment added");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error adding comment: " + e.getMessage());
        }
    }
    


    // Get comments for a post
    @GetMapping("/{id}/comments")
    public ResponseEntity<?> getComments(@PathVariable String id) {
        try {
            return ResponseEntity.ok(postService.getComments(id));
        } catch (Exception e) {
            logger.error("Error fetching comments", e);
            return ResponseEntity.status(500).body("Error fetching comments");
        }
    }

    // Edit comment
    @PutMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<?> editComment(@PathVariable String postId, @PathVariable String commentId, @RequestBody Map<String, String> body) {
        try {
            postService.editComment(postId, commentId, body.get("text"));
            return ResponseEntity.ok("Comment edited");
        } catch (Exception e) {
            logger.error("Error editing comment", e);
            return ResponseEntity.status(500).body("Error editing comment");
        }
    }

    // Delete comment
    @DeleteMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable String postId, @PathVariable String commentId) {
        try {
            postService.deleteComment(postId, commentId);
            return ResponseEntity.ok("Comment deleted");
        } catch (Exception e) {
            logger.error("Error deleting comment", e);
            return ResponseEntity.status(500).body("Error deleting comment");
        }
    }

    // Create a post
    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody Post post) {
        try {
            Post savedPost = postService.createPost(post);
            return ResponseEntity.ok(savedPost);
        } catch (Exception e) {
            logger.error("Error creating post", e);
            return ResponseEntity.status(500).body("Error creating post");
        }
    }

    // Update a post (content, tags, etc.)
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        try {
            postService.updatePost(id, updates);
            return ResponseEntity.ok("Post updated");
        } catch (Exception e) {
            logger.error("Error updating post", e);
            return ResponseEntity.status(500).body("Error updating post");
        }
    }

    // Delete a post
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable String id) {
        try {
            postService.deletePost(id);
            return ResponseEntity.ok("Post deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting post", e);
            return ResponseEntity.status(500).body("Error deleting post");
        }
    }

    // Search posts by keyword
    @GetMapping("/search")
    public ResponseEntity<?> searchPosts(@RequestParam("q") String keyword) {
        try {
            return ResponseEntity.ok(postService.searchPostsByKeyword(keyword));
        } catch (Exception e) {
            logger.error("Error searching posts", e);
            return ResponseEntity.status(500).body("Error searching posts");
        }
    }

    // Get recommended posts
    @GetMapping("/recommended")
    public ResponseEntity<?> getRecommendedPosts(@RequestParam String userId) {
        try {
            List<Map<String, Object>> posts = postService.getRecommendedPosts(userId);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            logger.error("Error fetching recommended posts", e);
            return ResponseEntity.status(500).body("Error fetching recommended posts");
        }
    }
}
