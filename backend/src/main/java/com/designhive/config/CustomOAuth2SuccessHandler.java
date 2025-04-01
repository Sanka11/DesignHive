package com.designhive.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException {

        String referer = request.getHeader("Referer");

        String frontendUrl = "http://localhost:5174/dashboard";
        if (referer != null && referer.startsWith("http://localhost")) {
            String origin = referer.split("/")[0] + "//" + referer.split("/")[2]; // e.g., http://localhost:5174
            frontendUrl = origin + "/dashboard";
        }

        response.sendRedirect(frontendUrl);
    }
}
