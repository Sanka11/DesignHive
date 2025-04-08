package com.designhive.controller;

import com.designhive.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:5173") // Allow frontend requests
public class PostController {

    @Autowired
    private PostService postService;

    @GetMapping
    public ResponseEntity<?> getPosts() {
        try {
            return ResponseEntity.ok(postService.getAllPosts());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching posts");
        }
    }

    // Like a post endpoint
    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(@PathVariable String id) {
        try {
            long updatedLikes = postService.likePost(id);
            return ResponseEntity.ok(Map.of("likes", updatedLikes));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error liking post");
        }
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            postService.addComment(id, body.get("text"));
            return ResponseEntity.ok("Comment added");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error adding comment");
        }
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<?> getComments(@PathVariable String id) {
        try {
            return ResponseEntity.ok(postService.getComments(id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching comments");
        }
    }

    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody Map<String, String> body) {
        try {
            String content = body.get("content");
            Map<String, Object> newPost = postService.createPost(content);
            return ResponseEntity.ok(newPost);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error creating post");
        }
    }
}


