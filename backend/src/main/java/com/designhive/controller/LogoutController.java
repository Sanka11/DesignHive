package com.designhive.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class LogoutController {

    private final SecurityContextLogoutHandler logoutHandler;

    public LogoutController() {
        this.logoutHandler = new SecurityContextLogoutHandler();
    }

    @PostMapping("/logout")
    public void performLogout(Authentication authentication, 
                            HttpServletRequest request,
                            HttpServletResponse response) {
        this.logoutHandler.logout(request, response, authentication);
    }
}