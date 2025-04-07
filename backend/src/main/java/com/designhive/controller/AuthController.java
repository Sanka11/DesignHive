package com.designhive.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.designhive.entity.User;
import com.designhive.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public String register(@RequestParam("username") String username,
                           @RequestParam("email") String email,
                           @RequestParam("password") String password,
                           @RequestParam(value = "profileImage", required = false) MultipartFile profileImage) throws Exception {
        return authService.register(username, email, password, profileImage);
    }

    @PostMapping("/login")
    public String login(@RequestBody User user) {
        try {
            return authService.login(user.getEmail(), user.getPassword());
        } catch (Exception e) {
            e.printStackTrace();
            return "Server error: " + e.getMessage();
        }
    }
}
