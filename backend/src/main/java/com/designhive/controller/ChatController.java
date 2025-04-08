package com.designhive.controller;

import com.designhive.entity.StartChatRequest;
import com.designhive.entity.MessageRequest;
import com.designhive.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    // 🔸 POST /api/chats/start
    @PostMapping("/start")
    public ResponseEntity<Map<String, String>> startChat(@RequestBody StartChatRequest request) {
        String chatId = chatService.startChat(request);
        return ResponseEntity.ok(Map.of("chatId", chatId));
    }

    // 🔸 POST /api/chats/{chatId}/messages
    @PostMapping("/{chatId}/messages")
    public ResponseEntity<Map<String, String>> sendMessage(
            @PathVariable String chatId,
            @RequestBody MessageRequest message) throws ExecutionException, InterruptedException {

        String messageId = chatService.sendMessage(chatId, message);
        return ResponseEntity.ok(Map.of("messageId", messageId));
    }

    // 🔸 GET /api/chats/{chatId}/messages
    @GetMapping("/{chatId}/messages")
    public ResponseEntity<List<Map<String, Object>>> getMessages(@PathVariable String chatId)
            throws ExecutionException, InterruptedException {

        List<Map<String, Object>> messages = chatService.getMessages(chatId);
        return ResponseEntity.ok(messages);
    }

    // 🔄 PUT /api/chats/{chatId}/messages/{messageId}
    @PutMapping("/{chatId}/messages/{messageId}")
    public ResponseEntity<?> updateMessage(
            @PathVariable String chatId,
            @PathVariable String messageId,
            @RequestBody Map<String, String> body) throws ExecutionException, InterruptedException {

        String newText = body.get("newText");
        chatService.updateMessage(chatId, messageId, newText);
        return ResponseEntity.ok("Message updated");
    }

    // ❌ DELETE /api/chats/{chatId}/messages/{messageId}
    @DeleteMapping("/{chatId}/messages/{messageId}")
    public ResponseEntity<?> deleteMessage(
            @PathVariable String chatId,
            @PathVariable String messageId) throws ExecutionException, InterruptedException {

        chatService.deleteMessage(chatId, messageId);
        return ResponseEntity.ok("Message deleted");
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<List<String>> getUserChats(@PathVariable String email)
            throws ExecutionException, InterruptedException {
        List<String> chatIds = chatService.getUserChats(email);
        return ResponseEntity.ok(chatIds);
    }

    @GetMapping("/started/{email}")
    public ResponseEntity<List<Map<String, Object>>> getStartedChats(@PathVariable String email)
            throws ExecutionException, InterruptedException {

        List<Map<String, Object>> chats = chatService.getChatsStartedByUser(email);
        return ResponseEntity.ok(chats);
    }

    @GetMapping("/username-by-email")
    public ResponseEntity<Map<String, String>> getUsername(@RequestParam String email)
            throws ExecutionException, InterruptedException {
        String username = chatService.getDisplayNameByEmail(email);
        return ResponseEntity.ok(Map.of("username", username));
    }

}
