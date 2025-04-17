package com.designhive.service;

import com.designhive.entity.Post;
import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final Firestore firestore = FirestoreClient.getFirestore();
   @Autowired
private EmailService emailService;
    // ✅ Get all posts (optimized, sorted)
    public List<Map<String, Object>> getAllPosts() throws ExecutionException, InterruptedException {
        List<QueryDocumentSnapshot> documents = firestore.collection("posts")
                .orderBy("createdAt", Query.Direction.DESCENDING).get().get().getDocuments();
        Set<String> uniqueAuthorIds = documents.stream()
                .map(doc -> (String) doc.get("authorId"))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, DocumentSnapshot> userDocsById = new HashMap<>();
        for (String authorId : uniqueAuthorIds) {
            List<QueryDocumentSnapshot> userQuery = firestore.collection("users")
                    .whereEqualTo("id", authorId).limit(1).get().get().getDocuments();
            if (!userQuery.isEmpty()) {
                userDocsById.put(authorId, userQuery.get(0));
            }
        }

        List<Map<String, Object>> posts = new ArrayList<>();
        for (QueryDocumentSnapshot doc : documents) {
            Map<String, Object> post = doc.getData();
            post.put("id", doc.getId());

            String authorId = (String) post.get("authorId");
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("name", post.get("authorUsername"));
            userMap.put("email", post.get("authorEmail"));
            if (userDocsById.containsKey(authorId)) {
                DocumentSnapshot userDoc = userDocsById.get(authorId);
                if (userDoc.contains("profileImagePath")) {
                    userMap.put("avatar", userDoc.getString("profileImagePath"));
                }
            }

            post.put("user", userMap);
            posts.add(post);
        }

        return posts;
    }

    // ✅ Like post
    public long likePost(String postId, String likerEmail, String likerUsername) throws ExecutionException, InterruptedException {
        DocumentReference postRef = firestore.collection("posts").document(postId);
    
        return firestore.runTransaction(transaction -> {
            DocumentSnapshot snapshot = transaction.get(postRef).get();
    
            if (!snapshot.exists()) {
                throw new IllegalArgumentException("Post not found");
            }
    
            long currentLikes = snapshot.contains("likes") ? snapshot.getLong("likes") : 0;
            long updatedLikes = currentLikes + 1;
            transaction.update(postRef, "likes", updatedLikes);
    
            // Send email to the post author
            String authorEmail = snapshot.getString("authorEmail");
            if (authorEmail != null) {
                emailService.sendEmail(
                    authorEmail,
                    likerUsername + " liked your post!",
                    "\"" + likerUsername + "\" liked your post.\n\nCome back and see the engagement!"
                );
            }
    
            return updatedLikes;
        }).get();
    }

    // ✅ Add comment
    public void addComment(String postId, String commentEmail, String commentUser, String commentText)
        throws ExecutionException, InterruptedException {

    if (commentEmail == null || commentUser == null || commentText == null) {
        throw new IllegalArgumentException("Required comment fields must not be null.");
    }

    // 🔍 Look up user by email
    CollectionReference usersRef = firestore.collection("users");
    Query query = usersRef.whereEqualTo("email", commentEmail);
    ApiFuture<QuerySnapshot> querySnapshot = query.get();
    List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();

    if (documents.isEmpty()) {
        throw new IllegalArgumentException("User with email " + commentEmail + " not found.");
    }

    DocumentReference commentRef = firestore.collection("posts")
            .document(postId)
            .collection("comments")
            .document();

    String commentId = commentRef.getId();

    Map<String, Object> commentData = new HashMap<>();
    commentData.put("commentId", commentId);
    commentData.put("commentEmail", commentEmail);
    commentData.put("commentUser", commentUser);
    commentData.put("text", commentText);
    commentData.put("createdAt", Timestamp.now());

    commentRef.set(commentData).get(); // Throws ExecutionException/InterruptedException
}


    // ✅ Get comments
    public List<Map<String, Object>> getComments(String postId) throws ExecutionException, InterruptedException {
        List<QueryDocumentSnapshot> docs = firestore.collection("posts")
                .document(postId).collection("comments")
                .orderBy("createdAt").get().get().getDocuments();
    
        Set<String> commentEmails = docs.stream()
                .map(doc -> (String) doc.get("commentEmail"))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    
        Map<String, DocumentSnapshot> userDocs = new HashMap<>();
        for (String email : commentEmails) {
            List<QueryDocumentSnapshot> users = firestore.collection("users")
                    .whereEqualTo("email", email).limit(1).get().get().getDocuments();
            if (!users.isEmpty()) {
                userDocs.put(email, users.get(0));
            }
        }
    
        return docs.stream().map(doc -> {
            Map<String, Object> data = doc.getData();
            data.put("id", doc.getId());
            String email = (String) data.get("commentEmail");
            if (userDocs.containsKey(email)) {
                DocumentSnapshot userDoc = userDocs.get(email);
                data.put("avatar", userDoc.getString("profileImagePath"));
            }
            return data;
        }).collect(Collectors.toList());
    }

    // ✅ Edit comment
    public void editComment(String postId, String commentId, String updatedText)
        throws ExecutionException, InterruptedException {
        DocumentReference commentRef = firestore.collection("posts")
                .document(postId)
                .collection("comments")
                .document(commentId);

        Map<String, Object> updates = new HashMap<>();
        updates.put("text", updatedText);
        updates.put("editedAt", Timestamp.now());

        commentRef.update(updates).get();
    }

    // ✅ Delete comment
    public void deleteComment(String postId, String commentId) throws ExecutionException, InterruptedException {
        DocumentReference commentRef = firestore.collection("posts")
                .document(postId)
                .collection("comments")
                .document(commentId);
    
        commentRef.delete().get();
    }
    
    // ✅ Create post
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

    // ✅ Get posts by author
    public List<Map<String, Object>> getPostsByUser(String userId) throws ExecutionException, InterruptedException {
        List<QueryDocumentSnapshot> documents = firestore.collection("posts")
                .whereEqualTo("authorId", userId)
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .get().get().getDocuments();

        String avatar = getProfileImageByAuthorId(userId);
        List<Map<String, Object>> posts = new ArrayList<>();

        for (QueryDocumentSnapshot doc : documents) {
            Map<String, Object> post = doc.getData();
            post.put("id", doc.getId());

            Map<String, Object> userMap = new HashMap<>();
            userMap.put("name", post.get("authorUsername"));
            userMap.put("email", post.get("authorEmail"));
            userMap.put("avatar", avatar);

            post.put("user", userMap);
            posts.add(post);
        }

        return posts;
    }

    // ✅ Delete post
    public void deletePost(String postId) throws ExecutionException, InterruptedException {
        firestore.collection("posts").document(postId).delete().get();
    }

    // ✅ Update post content/tags
     public void updatePost(String postId, Map<String, Object> updates) throws ExecutionException, InterruptedException {
        updates.put("updatedAt", Timestamp.now());
        firestore.collection("posts").document(postId).update(updates).get();
    }

    // ✅ Search by content (basic filter match)
    public List<Map<String, Object>> searchPostsByKeyword(String keyword)
            throws ExecutionException, InterruptedException {
        List<Map<String, Object>> allPosts = getAllPosts();
        return allPosts.stream()
                .filter(post -> {
                    Object content = post.get("content");
                    return content != null && content.toString().toLowerCase().contains(keyword.toLowerCase());
                })
                .collect(Collectors.toList());
    }

    // ✅ Get profile image by ID
    private String getProfileImageByAuthorId(String authorId) throws ExecutionException, InterruptedException {
        List<QueryDocumentSnapshot> docs = firestore.collection("users")
                .whereEqualTo("id", authorId).limit(1).get().get().getDocuments();
        return docs.isEmpty() ? null : docs.get(0).getString("profileImagePath");
    }

    // ✅ Get recommended posts by matching user preferences
    private List<String> safeList(Object obj) {
        if (obj instanceof List<?>) {
            return ((List<?>) obj).stream()
                    .filter(Objects::nonNull)
                    .map(Object::toString)
                    .collect(Collectors.toList());
        }
        return new ArrayList<>();
    }

    public List<Map<String, Object>> getRecommendedPosts(String userId)
            throws ExecutionException, InterruptedException {

        System.out.println("Fetching recommended posts for userId: " + userId);

        List<QueryDocumentSnapshot> userDocs = firestore.collection("users")
                .whereEqualTo("id", userId).limit(1).get().get().getDocuments();

        if (userDocs.isEmpty()) {
            System.out.println("❌ User not found in Firestore (by field id).");
            return Collections.emptyList();
        }

        DocumentSnapshot userDoc = userDocs.get(0);

        List<String> preferences = safeList(userDoc.get("preferences"));
        System.out.println("✅ Preferences loaded: " + preferences);

        if (preferences.isEmpty()) {
            System.out.println("❌ Preferences list is empty.");
            return Collections.emptyList();
        }

        Set<String> lowerPrefs = preferences.stream()
                .filter(Objects::nonNull)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        List<QueryDocumentSnapshot> allPosts = firestore.collection("posts").get().get().getDocuments();
        System.out.println("📦 Fetched posts: " + allPosts.size());

        List<Map<String, Object>> recommendedPosts = new ArrayList<>();
        Set<String> authorIds = new HashSet<>();

        for (QueryDocumentSnapshot doc : allPosts) {
            List<String> combinedTags = new ArrayList<>();
            combinedTags.addAll(safeList(doc.get("designDisciplines")));
            combinedTags.addAll(safeList(doc.get("designProcess")));
            combinedTags.addAll(safeList(doc.get("tools")));
            combinedTags.addAll(safeList(doc.get("learningGoals")));
            combinedTags.addAll(safeList(doc.get("competitionInvolvement")));

            String skillLevel = doc.getString("skillLevel");
            if (skillLevel != null) {
                combinedTags.add(skillLevel);
            }

            Set<String> lowerTags = combinedTags.stream()
                    .filter(Objects::nonNull)
                    .map(String::toLowerCase)
                    .collect(Collectors.toSet());

            boolean matches = lowerTags.stream().anyMatch(lowerPrefs::contains);

            System.out.println("🔍 Post: " + doc.getId());
            System.out.println("    Tags: " + lowerTags);
            System.out.println("    Matches: " + matches);

            if (matches) {
                authorIds.add(doc.getString("authorId"));
                Map<String, Object> postData = doc.getData();
                postData.put("id", doc.getId());
                recommendedPosts.add(postData);
                System.out.println("✅ Added recommended post: " + doc.getId());
            }
        }

        System.out.println("✅ Total recommended posts: " + recommendedPosts.size());

        // Fetch author avatars
        Map<String, DocumentSnapshot> userDocsById = new HashMap<>();
        for (String authorId : authorIds) {
            List<QueryDocumentSnapshot> userQuery = firestore.collection("users")
                    .whereEqualTo("id", authorId).limit(1).get().get().getDocuments();
            if (!userQuery.isEmpty()) {
                userDocsById.put(authorId, userQuery.get(0));
            }
        }

        // Add user info to post
        for (Map<String, Object> post : recommendedPosts) {
            String authorId = (String) post.get("authorId");
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("name", post.get("authorUsername"));
            userMap.put("email", post.get("authorEmail"));
            if (userDocsById.containsKey(authorId)) {
                DocumentSnapshot userDocSnap = userDocsById.get(authorId);
                userMap.put("avatar", userDocSnap.getString("profileImagePath"));
            }
            post.put("user", userMap);
        }

        return recommendedPosts;
    }

}
