package com.designhive.service;

import com.designhive.entity.Post;
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

    // ✅ Get all posts (sorted by createdAt DESC)
    public List<Map<String, Object>> getAllPosts() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> query = firestore.collection("posts").get();
        List<QueryDocumentSnapshot> documents = query.get().getDocuments();
        List<Map<String, Object>> posts = new ArrayList<>();

        // Step 1: Collect all unique authorIds
        Set<String> uniqueAuthorIds = documents.stream()
                .map(doc -> (String) doc.getString("authorId"))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Step 2: Fetch all users in one batch query
        Map<String, DocumentSnapshot> userDocsById = new HashMap<>();
        for (String authorId : uniqueAuthorIds) {
            List<QueryDocumentSnapshot> userQuery = firestore
                    .collection("users")
                    .whereEqualTo("id", authorId)
                    .limit(1)
                    .get()
                    .get()
                    .getDocuments();
            if (!userQuery.isEmpty()) {
                userDocsById.put(authorId, userQuery.get(0));
            }
        }

        for (QueryDocumentSnapshot doc : documents) {
            Map<String, Object> post = doc.getData();
            post.put("id", doc.getId());

            String authorEmail = (String) post.get("authorEmail");
            String authorId = (String) post.get("authorId");
            String authorUsername = (String) post.get("authorUsername");

            // Inject user info
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("name", authorUsername != null ? authorUsername : authorEmail);
            userMap.put("email", authorEmail);

            DocumentSnapshot userDoc = userDocsById.get(authorId);
            if (userDoc != null && userDoc.exists() && userDoc.contains("profileImagePath")) {
                userMap.put("avatar", userDoc.getString("profileImagePath"));
            }

            post.put("user", userMap);
            posts.add(post);
        }

        posts.sort((a, b) -> {
            Timestamp t1 = (Timestamp) a.get("createdAt");
            Timestamp t2 = (Timestamp) b.get("createdAt");
            return t2.compareTo(t1);
        });

        return posts;
    }

    public long likePost(String postId) throws ExecutionException, InterruptedException {
        DocumentReference postRef = firestore.collection("posts").document(postId);
        return firestore.runTransaction(transaction -> {
            DocumentSnapshot snapshot = transaction.get(postRef).get();
            long currentLikes = snapshot.contains("likes") ? snapshot.getLong("likes") : 0;
            long updatedLikes = currentLikes + 1;
            transaction.update(postRef, "likes", updatedLikes);
            return updatedLikes;
        }).get();
    }

    public void addComment(String postId, String comment) throws ExecutionException, InterruptedException {
        firestore.collection("posts")
                .document(postId)
                .collection("comments")
                .add(Map.of(
                        "text", comment,
                        "createdAt", Timestamp.now()));
    }

    public List<Map<String, Object>> getComments(String postId) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> query = firestore.collection("posts")
                .document(postId)
                .collection("comments")
                .orderBy("createdAt")
                .get();

        List<QueryDocumentSnapshot> documents = query.get().getDocuments();
        return documents.stream()
                .map(doc -> {
                    Map<String, Object> data = doc.getData();
                    data.put("id", doc.getId());
                    return data;
                }).collect(Collectors.toList());
    }

    public void editComment(String postId, String commentId, String updatedText)
            throws ExecutionException, InterruptedException {
        DocumentReference commentRef = firestore.collection("posts")
                .document(postId)
                .collection("comments")
                .document(commentId);

        Map<String, Object> updateData = new HashMap<>();
        updateData.put("text", updatedText);
        updateData.put("editedAt", Timestamp.now());

        commentRef.update(updateData).get();
    }

    public void deleteComment(String postId, String commentId) throws ExecutionException, InterruptedException {
        DocumentReference commentRef = firestore.collection("posts")
                .document(postId)
                .collection("comments")
                .document(commentId);

        commentRef.delete().get();
    }

    public Post createPost(Post post) throws ExecutionException, InterruptedException {
        post.setLikes(0);
        post.setCreatedAt(new Date());

        Map<String, Object> postMap = new HashMap<>();
        postMap.put("content", post.getContent());
        postMap.put("likes", post.getLikes());
        postMap.put("authorEmail", post.getAuthorEmail());
        postMap.put("authorUsername", post.getAuthorUsername());
        postMap.put("authorId", post.getAuthorId());
        postMap.put("mediaUrls", post.getMediaUrls());
        postMap.put("designDisciplines", post.getDesignDisciplines());
        postMap.put("designProcess", post.getDesignProcess());
        postMap.put("tools", post.getTools());
        postMap.put("learningGoals", post.getLearningGoals());
        postMap.put("skillLevel", post.getSkillLevel());
        postMap.put("competitionInvolvement", post.getCompetitionInvolvement());
        postMap.put("createdAt", Timestamp.now());

        DocumentReference docRef = firestore.collection("posts").document();
        docRef.set(postMap).get();

        post.setId(docRef.getId());
        return post;
    }
}
