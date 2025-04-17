package com.designhive.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.designhive.entity.User;
import com.designhive.service.AuthService;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // ✅ Register
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public String registerUser(
            @RequestParam("username") String username,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam(value = "profileImage", required = false) MultipartFile profileImage) throws Exception {
    
        return authService.register(username, email, password, profileImage);
    }
    

    // ✅ Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            String token = authService.login(user.getEmail(), user.getPassword());
            return ResponseEntity.ok(token); // ✅ Return JWT token on success
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Login failed: " + e.getMessage());
        }
    }
    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestParam String email,
            @RequestParam String currentPassword,
            @RequestParam String newPassword) {
        try {
            authService.changePassword(email, currentPassword, newPassword);
            return ResponseEntity.ok("Password updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/reset-password")
public ResponseEntity<?> resetPassword(
        @RequestParam String email,
        @RequestParam String username,
        @RequestParam String newPassword) {
    try {
        String result = authService.resetPasswordWithUsername(email, username, newPassword);
        return ResponseEntity.ok(result);
    } catch (Exception e) {
        return ResponseEntity.status(400).body("Reset failed: " + e.getMessage());
    }
}


}
