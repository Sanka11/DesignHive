package com.designhive.entity;

public class Task {
    private String id;           // Add id field
    private String title;
    private String description;
    private boolean completed;

    public Task() {}

    public Task(String id, String title, String description, boolean completed) {
        this.id = id;             // Add id to constructor
        this.title = title;
        this.description = description;
        this.completed = completed;
    }

    // Getter and setter for id
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }  // Add setter for id

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
}
