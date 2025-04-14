package com.designhive.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.designhive.entity.FollowRequest;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Repository
public class FollowRepository {

    private static final String COLLECTION_NAME = "followRequests";

    public void sendFollowRequest(String senderEmail, String receiverEmail) throws Exception {
        FollowRequest request = new FollowRequest();
        request.setId(UUID.randomUUID().toString());
        request.setSenderEmail(senderEmail);
        request.setReceiverEmail(receiverEmail);
        request.setStatus("pending");

        Firestore db = FirestoreClient.getFirestore();
        db.collection(COLLECTION_NAME).document(request.getId()).set(request).get();
    }

    public void acceptFollowRequest(String requestId) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        DocumentReference ref = db.collection(COLLECTION_NAME).document(requestId);
        ref.update("status", "accepted").get();
    }

    public List<FollowRequest> getPendingRequests(String receiverEmail)
            throws InterruptedException, ExecutionException {
        Firestore db = FirestoreClient.getFirestore();
        Query query = db.collection(COLLECTION_NAME)
                .whereEqualTo("receiverEmail", receiverEmail)
                .whereEqualTo("status", "pending");
        ApiFuture<QuerySnapshot> querySnapshot = query.get();

        List<FollowRequest> requests = new ArrayList<>();
        for (DocumentSnapshot doc : querySnapshot.get().getDocuments()) {
            requests.add(doc.toObject(FollowRequest.class));
        }
        return requests;
    }

    public List<FollowRequest> getFollowers(String userEmail) throws InterruptedException, ExecutionException {
        Firestore db = FirestoreClient.getFirestore();
        Query query = db.collection(COLLECTION_NAME)
                .whereEqualTo("receiverEmail", userEmail)
                .whereEqualTo("status", "accepted");
        ApiFuture<QuerySnapshot> querySnapshot = query.get();

        List<FollowRequest> requests = new ArrayList<>();
        for (DocumentSnapshot doc : querySnapshot.get().getDocuments()) {
            requests.add(doc.toObject(FollowRequest.class));
        }
        return requests;
    }

    public List<FollowRequest> getFollowing(String userEmail) throws InterruptedException, ExecutionException {
        Firestore db = FirestoreClient.getFirestore();
        Query query = db.collection(COLLECTION_NAME)
                .whereEqualTo("senderEmail", userEmail)
                .whereEqualTo("status", "accepted");
        ApiFuture<QuerySnapshot> querySnapshot = query.get();

        List<FollowRequest> requests = new ArrayList<>();
        for (DocumentSnapshot doc : querySnapshot.get().getDocuments()) {
            requests.add(doc.toObject(FollowRequest.class));
        }
        return requests;
    }
    // ✅ Get follow status map for a sender

    public Map<String, String> getFollowStatuses(String senderEmail) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        CollectionReference collection = db.collection(COLLECTION_NAME);
        ApiFuture<QuerySnapshot> future = collection
                .whereEqualTo("senderEmail", senderEmail)
                .get();

        List<QueryDocumentSnapshot> docs = future.get().getDocuments();
        Map<String, String> statusMap = new HashMap<>();
        for (DocumentSnapshot doc : docs) {
            FollowRequest request = doc.toObject(FollowRequest.class);
            statusMap.put(request.getReceiverEmail(), request.getStatus());
        }

        return statusMap;
    }

    // ✅ Unfollow: delete accepted follow entry
    public void unfollow(String senderEmail, String receiverEmail) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        Query query = db.collection(COLLECTION_NAME)
                .whereEqualTo("senderEmail", senderEmail)
                .whereEqualTo("receiverEmail", receiverEmail)
                .whereEqualTo("status", "accepted");

        ApiFuture<QuerySnapshot> future = query.get();
        List<QueryDocumentSnapshot> docs = future.get().getDocuments();
        for (DocumentSnapshot doc : docs) {
            doc.getReference().delete();
        }
    }

    // Cancel a pending follow request (can be done by sender or receiver)
    public void cancelPendingRequest(String senderEmail, String receiverEmail) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        Query query = db.collection(COLLECTION_NAME)
                .whereEqualTo("senderEmail", senderEmail)
                .whereEqualTo("receiverEmail", receiverEmail)
                .whereEqualTo("status", "pending");

        ApiFuture<QuerySnapshot> future = query.get();
        List<QueryDocumentSnapshot> docs = future.get().getDocuments();

        for (DocumentSnapshot doc : docs) {
            doc.getReference().delete(); // delete the pending request
        }
    }

    public List<FollowRequest> getPendingSentRequests(String senderEmail) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        Query query = db.collection(COLLECTION_NAME)
                .whereEqualTo("senderEmail", senderEmail)
                .whereEqualTo("status", "pending");
    
        ApiFuture<QuerySnapshot> querySnapshot = query.get();
    
        List<FollowRequest> requests = new ArrayList<>();
        for (DocumentSnapshot doc : querySnapshot.get().getDocuments()) {
            requests.add(doc.toObject(FollowRequest.class));
        }
        return requests;
    }
    

}
