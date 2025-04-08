package com.designhive.service;

import com.designhive.entity.MessageRequest;
import com.designhive.entity.StartChatRequest;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class ChatService {

    private final Firestore db = FirestoreClient.getFirestore();

    // 🔸 1. Start Chat
    public String startChat(StartChatRequest request) {
        List<String> users = Arrays.asList(request.getUser1(), request.getUser2());
        Collections.sort(users); // to ensure consistent chatId
        String chatId = users.get(0) + "_" + users.get(1);

        Map<String, Object> chatData = new HashMap<>();
        chatData.put("users", users);

        db.collection("chats").document(chatId).set(chatData);
        return chatId;
    }

    // 🔸 2. Send Message
    public String sendMessage(String chatId, MessageRequest message) throws ExecutionException, InterruptedException {
        CollectionReference messagesRef = db.collection("chats").document(chatId).collection("messages");

        Map<String, Object> messageData = new HashMap<>();
        messageData.put("sender", message.getSender());
        messageData.put("text", message.getText());
        messageData.put("timestamp", FieldValue.serverTimestamp());

        ApiFuture<DocumentReference> result = messagesRef.add(messageData);
        return result.get().getId();
    }

    // 🔸 3. Get All Messages
    public List<Map<String, Object>> getMessages(String chatId) throws ExecutionException, InterruptedException {
        CollectionReference messagesRef = db.collection("chats").document(chatId).collection("messages");
        ApiFuture<QuerySnapshot> future = messagesRef.orderBy("timestamp").get();

        List<Map<String, Object>> messages = new ArrayList<>();
        for (DocumentSnapshot doc : future.get().getDocuments()) {
            Map<String, Object> data = doc.getData();
            data.put("messageId", doc.getId());
            messages.add(data);
        }

        return messages;
    }

    public void updateMessage(String chatId, String messageId, String newText)
            throws ExecutionException, InterruptedException {
        db.collection("chats")
                .document(chatId)
                .collection("messages")
                .document(messageId)
                .update("text", newText)
                .get();
    }

    public void deleteMessage(String chatId, String messageId) throws ExecutionException, InterruptedException {
        db.collection("chats")
                .document(chatId)
                .collection("messages")
                .document(messageId)
                .delete()
                .get();
    }


    public List<String> getUserChats(String userEmail) throws ExecutionException, InterruptedException {
        List<String> chatIds = new ArrayList<>();
        ApiFuture<QuerySnapshot> future = db.collection("chats").get();
        for (DocumentSnapshot doc : future.get().getDocuments()) {
            String id = doc.getId();
            if (id.contains(userEmail)) {
                chatIds.add(id);
            }
        }
        return chatIds;
    }

    public List<Map<String, Object>> getChatsStartedByUser(String email) throws ExecutionException, InterruptedException {
        CollectionReference chatsRef = db.collection("chats");
    
        // Firestore doesn't have a 'starter' field yet, so we filter using `users` array
        ApiFuture<QuerySnapshot> future = chatsRef
                .whereArrayContains("users", email)
                .get();
    
        List<Map<String, Object>> chatList = new ArrayList<>();
        for (DocumentSnapshot doc : future.get().getDocuments()) {
            Map<String, Object> data = doc.getData();
            data.put("chatId", doc.getId()); // include chatId for frontend
            chatList.add(data);
        }
    
        return chatList;
    }
    
    public String getDisplayNameByEmail(String email) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = db.collection("users").whereEqualTo("email", email).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        if (!documents.isEmpty()) {
            Map<String, Object> userData = documents.get(0).getData();
            return (String) userData.getOrDefault("username", email); // fallback to email
        }
        return email;
    }
    

}
