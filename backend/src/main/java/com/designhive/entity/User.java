package com.designhive.entity;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class User {
    private String id;
    private String username;
    private String email;
    private String password;
    private String profileImagePath;

    // Existing additional fields
    private String fullName;
    private String bio;
    private int age;
    private String birthday;
    private String interests;

    // New fields
    private String gender;
    private String location;
    private String contactNo;

    // For multiple social links (platform -> url)
    private Map<String, String> socialLinks;

    // Preferences stored as an array
    private List<String> preferences;

    // New UI/UX & skill sharing related fields
    private List<String> skills;         // e.g., ["UI Design", "Wireframing", "Figma"]
    private boolean openToSkillShare;    // true if open to sharing skills
    private List<String> platforms;      // e.g., ["Behance", "Dribbble", "LinkedIn"]
}
