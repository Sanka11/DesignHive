package com.designhive.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.designhive.service.CustomOAuth2UserService;

@Configuration
public class SecurityConfig {

    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;
    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/uploads/**").permitAll()
                .requestMatchers("/api/user/me", "/api/user/profile").authenticated()
                .anyRequest().permitAll()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(info -> info.userService(customOAuth2UserService))
                .defaultSuccessUrl("http://localhost:5173/home", true) // 👈 Redirect to Home
                )
                .logout(logout -> logout
                .logoutSuccessUrl("http://localhost:5173/login") // ✅ Redirect to React login
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                );

        return http.build();
    }
}
