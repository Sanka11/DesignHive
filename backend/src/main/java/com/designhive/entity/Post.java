package com.designhive.entity;

import java.util.ArrayList;
import java.util.List;

public class Post {
    private String id;
    private String content;
    private int likes;
    private List<String> comments;

    public Post() {
        this.likes = 0;
        this.comments = new ArrayList<>();
    }

    public Post(String id, String content) {
        this.id = id;
        this.content = content;
        this.likes = 0;
        this.comments = new ArrayList<>();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public int getLikes() { return likes; }
    public void setLikes(int likes) { this.likes = likes; }

    public List<String> getComments() { return comments; }
    public void setComments(List<String> comments) { this.comments = comments; }
}

