package com.designhive.entity;

import java.util.Date;

public class Comment {

    private String commentId;
    private String commentEmail; // newly added
    private String userName;
    private String text;
    private Date createdAt;

    public Comment() {
        this.createdAt = new Date();
    }

    public Comment(String commentId, String commentEmail, String userName, String text) {
        this.commentId = commentId;
        this.commentEmail = commentEmail;
        this.userName = userName;
        this.text = text;
        this.createdAt = new Date();
    }

    // Getters and Setters
    public String getCommentId() {
        return commentId;
    }

    public void setCommentId(String commentId) {
        this.commentId = commentId;
    }

    public String getCommentEmail() {
        return commentEmail;
    }

    public void setCommentEmail(String commentEmail) {
        this.commentEmail = commentEmail;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "Comment{" +
                "commentId='" + commentId + '\'' +
                ", commentEmail='" + commentEmail + '\'' +
                ", userName='" + userName + '\'' +
                ", text='" + text + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
