package com.designhive.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.designhive.config.JwtUtil;
import com.designhive.entity.User;
import com.designhive.repository.UserRepository;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public String register(String username, String email, String password, MultipartFile profileImage) throws Exception {
        User existing = userRepository.getUserByEmail(email);
        if (existing != null) return "Email already exists";
    
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password)); // 👈 Hashed password
    
        // 🧠 Save image if provided
        if (profileImage != null && !profileImage.isEmpty()) {
            String filename = UUID.randomUUID() + "_" + profileImage.getOriginalFilename();
            Path filePath = Paths.get("E:\\DesignHive\\DesignHive\\backend\\src\\main\\resources\\static\\uploads", filename);
            Files.copy(profileImage.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            user.setProfileImagePath("/uploads/" + filename);
        } else {
            // Optional: Set default image or leave null
            user.setProfileImagePath("/uploads/default.png");
        }
    
        userRepository.saveUser(user);
        return jwtUtil.generateToken(email);
    }
    

    public String login(String email, String password) throws Exception {
        User user = userRepository.getUserByEmail(email);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) { // 👈 Check hashed password
            return "Invalid credentials";
        }
        return jwtUtil.generateToken(user.getEmail());
    }
}
