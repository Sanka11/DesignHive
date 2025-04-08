package com.designhive.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final Firestore firestore = FirestoreClient.getFirestore();

    public List<Map<String, Object>> getAllPosts() throws Exception {
        ApiFuture<QuerySnapshot> query = firestore.collection("posts").get();
        List<QueryDocumentSnapshot> documents = query.get().getDocuments();
        List<Map<String, Object>> posts = new ArrayList<>();

        for (QueryDocumentSnapshot doc : documents) {
            Map<String, Object> post = doc.getData();
            post.put("id", doc.getId());
            posts.add(post);
        }
        return posts;
    }

    public long likePost(String postId) throws Exception {
        DocumentReference postRef = firestore.collection("posts").document(postId);
        return firestore.runTransaction(transaction -> {
            DocumentSnapshot snapshot = transaction.get(postRef).get();
            long currentLikes = snapshot.contains("likes") ? snapshot.getLong("likes") : 0;
            long updatedLikes = currentLikes + 1;
            transaction.update(postRef, "likes", updatedLikes);
            return updatedLikes;
        }).get();
    }

    public void addComment(String postId, String comment) throws Exception {
        firestore.collection("posts").document(postId)
                .collection("comments").add(Map.of(
                        "text", comment,
                        "createdAt", Timestamp.now()));
    }

    public List<Map<String, Object>> getComments(String postId) throws Exception {
        ApiFuture<QuerySnapshot> query = firestore.collection("posts")
                .document(postId).collection("comments")
                .orderBy("createdAt").get();

        List<QueryDocumentSnapshot> documents = query.get().getDocuments();
        return documents.stream()
                .map(doc -> {
                    Map<String, Object> data = doc.getData();
                    data.put("id", doc.getId());
                    return data;
                }).collect(Collectors.toList());
    }

    // ✅ Updated to include authorEmail, authorUsername, authorId
    public Map<String, Object> createPost(String content, String authorEmail, String authorUsername, String authorId)
            throws Exception {
        Map<String, Object> post = new HashMap<>();
        post.put("content", content);
        post.put("likes", 0);
        post.put("createdAt", Timestamp.now());
        post.put("authorEmail", authorEmail);
        post.put("authorUsername", authorUsername);
        post.put("authorId", authorId);

        DocumentReference docRef = firestore.collection("posts").document();
        docRef.set(post).get();
        post.put("id", docRef.getId());

        return post;
    }
}
