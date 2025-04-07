package com.designhive.service;


import java.net.URI;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.designhive.entity.User;
import com.designhive.repository.UserRepository;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
    OAuth2User oAuth2User = super.loadUser(request);

    String registrationId = request.getClientRegistration().getRegistrationId(); // "google" or "github"
    String email = oAuth2User.getAttribute("email");
    String name = oAuth2User.getAttribute("name");
    String picture = oAuth2User.getAttribute("picture"); // Google profile

    // 🔄 GitHub email fallback
    if (email == null && registrationId.equals("github")) {
        email = fetchGithubPrimaryEmail(request.getAccessToken());
    }

    if (email == null || email.isBlank()) {
        throw new OAuth2AuthenticationException("GitHub email not returned. Please make sure you granted email permission.");
    }

    // ✅ Save user to Firestore
    try {
        User existing = userRepository.getUserByEmail(email);
        if (existing == null) {
            User newUser = new User();
            newUser.setId(UUID.randomUUID().toString());
            newUser.setEmail(email);
            newUser.setUsername(name != null ? name : email);
            newUser.setProfileImagePath(picture);
            userRepository.saveUser(newUser);
        }
    } catch (Exception e) {
        e.printStackTrace();
        throw new OAuth2AuthenticationException("Error saving user: " + e.getMessage());
    }

    // ✅ Inject the email into a new OAuth2User object
    Map<String, Object> attributes = new HashMap<>(oAuth2User.getAttributes());
    attributes.put("email", email); // inject if missing

    return new DefaultOAuth2User(
        Collections.singleton(new SimpleGrantedAuthority("USER")),
        attributes,
        "email" // use email as the key for principal name
    );
}

    private String fetchGithubPrimaryEmail(OAuth2AccessToken accessToken) {
        try {
            RequestEntity<Void> request = RequestEntity
                    .get(URI.create("https://api.github.com/user/emails"))
                    .header("Authorization", "token " + accessToken.getTokenValue())
                    .build();

            ResponseEntity<List<Map<String, Object>>> response = new RestTemplate()
                    .exchange(request, new ParameterizedTypeReference<>() {});

            for (Map<String, Object> emailData : response.getBody()) {
                if (Boolean.TRUE.equals(emailData.get("primary"))) {
                    return (String) emailData.get("email");
                }
            }
        } catch (Exception e) {
            System.err.println("⚠️ Failed to fetch GitHub email: " + e.getMessage());
        }

        return null;
    }
}
