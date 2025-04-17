package com.designhive.entity;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class Post {

    private String id;

    private String content;
    private int likes;
    private List<Comment> comments;

    private String authorEmail;
    private String authorUsername;
    private String authorId;

    private List<String> mediaUrls;

    private List<String> designDisciplines;
    private List<String> designProcess;
    private List<String> tools;
    private List<String> learningGoals;
    private String skillLevel;
    private List<String> competitionInvolvement;
    private String profileImagePath;

    private Date createdAt;

    public Post() {
        this.likes = 0;
        this.comments = new ArrayList<>();
        this.mediaUrls = new ArrayList<>();
        this.designDisciplines = new ArrayList<>();
        this.designProcess = new ArrayList<>();
        this.tools = new ArrayList<>();
        this.learningGoals = new ArrayList<>();
        this.competitionInvolvement = new ArrayList<>();
        this.createdAt = new Date();
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public int getLikes() {
        return likes;
    }

    public void setLikes(int likes) {
        this.likes = likes;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    public String getAuthorEmail() {
        return authorEmail;
    }

    public void setAuthorEmail(String authorEmail) {
        this.authorEmail = authorEmail;
    }

    public String getAuthorUsername() {
        return authorUsername;
    }

    public void setAuthorUsername(String authorUsername) {
        this.authorUsername = authorUsername;
    }

    public String getAuthorId() {
        return authorId;
    }

    public void setAuthorId(String authorId) {
        this.authorId = authorId;
    }

    public List<String> getMediaUrls() {
        return mediaUrls;
    }

    public void setMediaUrls(List<String> mediaUrls) {
        this.mediaUrls = mediaUrls;
    }

    public List<String> getDesignDisciplines() {
        return designDisciplines;
    }

    public void setDesignDisciplines(List<String> designDisciplines) {
        this.designDisciplines = designDisciplines;
    }

    public List<String> getDesignProcess() {
        return designProcess;
    }

    public void setDesignProcess(List<String> designProcess) {
        this.designProcess = designProcess;
    }

    public List<String> getTools() {
        return tools;
    }

    public void setTools(List<String> tools) {
        this.tools = tools;
    }

    public List<String> getLearningGoals() {
        return learningGoals;
    }

    public void setLearningGoals(List<String> learningGoals) {
        this.learningGoals = learningGoals;
    }

    public String getSkillLevel() {
        return skillLevel;
    }

    public void setSkillLevel(String skillLevel) {
        this.skillLevel = skillLevel;
    }

    public List<String> getCompetitionInvolvement() {
        return competitionInvolvement;
    }

    public void setCompetitionInvolvement(List<String> competitionInvolvement) {
        this.competitionInvolvement = competitionInvolvement;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public String getProfileImagePath() {
        return profileImagePath;
    }

    public void setProfileImagePath(String profileImagePath) {
        this.profileImagePath = profileImagePath;
    }

}
