package com.designhive.controller;

import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class userController {
    
    @GetMapping
    public Map<String, Object> getUser(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return Map.of("error", "Not authenticated");
        }

        // Debug all available attributes
        System.out.println("All attributes: " + principal.getAttributes());

        // Handle GitHub user (check for GitHub-specific attributes first)
        if (principal.getAttribute("avatar_url") != null) {
            return Map.of(
                "name", principal.getAttribute("login"),
                "email", principal.getAttribute("email") != null ? 
                        principal.getAttribute("email") : 
                        principal.getAttribute("login") + "@users.noreply.github.com",
                "avatar_url", principal.getAttribute("avatar_url")
            );
        }
        // Handle Google user
        else {
            return Map.of(
                "name", principal.getAttribute("name") != null ? 
                       principal.getAttribute("name") : 
                       principal.getAttribute("email"),
                "email", principal.getAttribute("email"),
                "picture", principal.getAttribute("picture")
            );
        }
        
    }
}