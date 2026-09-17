package com.crowdfunding.controllers;

import com.crowdfunding.models.Message;
import com.crowdfunding.models.User;
import com.crowdfunding.repositories.MessageRepository;
import com.crowdfunding.repositories.UserRepository;
import com.crowdfunding.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{receiverId}")
    public ResponseEntity<?> getMessageHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long receiverId
    ) {
        try {
            Long senderId = userDetails.getId();
            List<Message> history = messageRepository
                    .findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByCreatedAtAsc(
                            senderId, receiverId, receiverId, senderId
                    );
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> payload
    ) {
        try {
            Long senderId = userDetails.getId();
            Long receiverId = Long.parseLong(payload.get("receiverId").toString());
            String text = (String) payload.get("text");

            User sender = userRepository.findById(senderId)
                    .orElseThrow(() -> new RuntimeException("Sender not found"));

            User receiver = userRepository.findById(receiverId)
                    .orElseThrow(() -> new RuntimeException("Receiver not found"));

            List<Message.Attachment> attachments = new ArrayList<>();
            if (payload.containsKey("attachments")) {
                Object rawAttachments = payload.get("attachments");
                if (rawAttachments instanceof java.util.Collection<?>) {
                    for (Object obj : (java.util.Collection<?>) rawAttachments) {
                        if (obj instanceof Map<?, ?>) {
                            Map<?, ?> att = (Map<?, ?>) obj;
                            attachments.add(Message.Attachment.builder()
                                    .url((String) att.get("url"))
                                    .name((String) att.get("name"))
                                    .type((String) att.get("type"))
                                    .build());
                        }
                    }
                }
            }

            Message message = Message.builder()
                    .sender(sender)
                    .receiver(receiver)
                    .text(text)
                    .attachments(attachments)
                    .build();

            message = messageRepository.save(message);

            return ResponseEntity.status(HttpStatus.CREATED).body(message);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
