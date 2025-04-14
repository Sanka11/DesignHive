package com.designhive.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import com.designhive.entity.User;
import com.designhive.repository.UserRepository;
import com.designhive.service.FirebaseStorageService;

@RestController
@RequestMapping("/api/user")
public class userController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FirebaseStorageService firebaseStorageService;

    @GetMapping("/email/{email}")
    public User getUserByEmailPath(@PathVariable String email) throws Exception {
        System.out.println("🔍 Looking up user by email (path): " + email);
        User user = userRepository.getUserByEmail(email);
        if (user == null) throw new Exception("User not found");
        return user;
    }

    @GetMapping("/profile")
    public User getUserByEmailQuery(@RequestParam String email) throws Exception {
        System.out.println("🔍 Looking up user by email (query): " + email);
        User user = userRepository.getUserByEmail(email);
        if (user == null) throw new Exception("User not found");
        return user;
    }

    @PutMapping("/update")
    public String updateUser(@RequestBody User updatedUser) throws Exception {
        User existing = userRepository.getUserByEmail(updatedUser.getEmail());
        if (existing == null) throw new Exception("User not found");

        updatedUser.setId(existing.getId());
        updatedUser.setPassword(existing.getPassword());
        updatedUser.setProfileImagePath(existing.getProfileImagePath());

        userRepository.saveUser(updatedUser);
        return "Profile updated successfully";
    }

    @PutMapping(value = "/update", consumes = "multipart/form-data")
    public String updateUser(
            @RequestParam("email") String email,
            @RequestParam("username") String username,
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "age", required = false) Integer age,
            @RequestParam(value = "birthday", required = false) String birthday,
            @RequestParam(value = "interests", required = false) String interests,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "contactNo", required = false) String contactNo,
            @RequestParam(value = "preferences", required = false) List<String> preferences,
            @RequestParam(value = "skills", required = false) List<String> skills,
            @RequestParam(value = "openToSkillShare", required = false) Boolean openToSkillShare,
            @RequestParam(value = "platforms", required = false) List<String> platforms,
            @RequestParam(value = "profileImage", required = false) MultipartFile profileImage
    ) throws Exception {

        User user = userRepository.getUserByEmail(email);
        if (user == null) throw new Exception("User not found");

        user.setUsername(username);
        if (fullName != null) user.setFullName(fullName);
        if (bio != null) user.setBio(bio);
        if (age != null) user.setAge(age);
        if (birthday != null) user.setBirthday(birthday);
        if (interests != null) user.setInterests(interests);
        if (gender != null) user.setGender(gender);
        if (location != null) user.setLocation(location);
        if (contactNo != null) user.setContactNo(contactNo);
        if (preferences != null) user.setPreferences(preferences);
        if (skills != null) user.setSkills(skills);
        if (openToSkillShare != null) user.setOpenToSkillShare(openToSkillShare);
        if (platforms != null) user.setPlatforms(platforms);

        // ✅ Upload to Firebase Storage instead of saving locally
        if (profileImage != null && !profileImage.isEmpty()) {
            String imageUrl = firebaseStorageService.uploadFile(profileImage);
            user.setProfileImagePath(imageUrl);
        }

        userRepository.saveUser(user);
        return "Profile updated successfully";
    }

    @DeleteMapping("/delete")
    public String deleteUser(@RequestParam String email) throws Exception {
        User user = userRepository.getUserByEmail(email);
        if (user == null) throw new Exception("User not found");
        Firestore db = FirestoreClient.getFirestore();
        db.collection("users").document(email).delete().get();
        return "Account deleted successfully";
    }

    @GetMapping("/me")
    public User getCurrentUser(Authentication authentication) throws Exception {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new Exception("Not logged in");
        }

        String email = null;
        Object principal = authentication.getPrincipal();

        if (principal instanceof OAuth2User oauthUser) {
            email = oauthUser.getAttribute("email");
            if (email == null && oauthUser.getAttribute("login") != null) {
                String githubUsername = oauthUser.getAttribute("login");
                System.out.println("⚠️ GitHub email was null. Trying login: " + githubUsername);
                throw new Exception("GitHub email not returned. Please make sure you granted email permission.");
            }
        } else if (principal instanceof UserDetails userDetails) {
            email = userDetails.getUsername();
        }

        if (email == null) {
            throw new Exception("Unable to extract email");
        }

        User user = userRepository.getUserByEmail(email);
        if (user == null) throw new Exception("User not found");

        return user;
    }

    @GetMapping("/all")
    public List<User> getAllUsers() throws Exception {
        return userRepository.getAllUsers();
    }
}
