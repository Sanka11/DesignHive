package com.designhive.entity;

import lombok.Data;

@Data
public class FollowRequest {
    private String id;
    private String senderEmail;
    private String receiverEmail;
    private String status; // "pending", "accepted"
}