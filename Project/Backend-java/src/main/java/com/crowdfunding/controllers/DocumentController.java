package com.crowdfunding.controllers;

import com.crowdfunding.models.Document;
import com.crowdfunding.models.User;
import com.crowdfunding.repositories.DocumentRepository;
import com.crowdfunding.repositories.UserRepository;
import com.crowdfunding.security.CustomUserDetails;
import com.crowdfunding.services.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadDocument(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("projectName") String projectName,
            @RequestParam("location") String location,
            @RequestParam("documentType") String documentType,
            @RequestParam("file") MultipartFile file) {
        try {
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (file.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "No file uploaded");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // Determine userType
            String role = user.getRole();
            String userType = ("individual".equalsIgnoreCase(role) || "institutional".equalsIgnoreCase(role)
                    || "angel".equalsIgnoreCase(role))
                            ? "investor"
                            : "creator";

            // Store file
            String filePath = fileStorageService.storeFile(file, "documents");

            Document document = Document.builder()
                    .user(user)
                    .projectName(projectName)
                    .location(location)
                    .documentType(documentType)
                    .filePath(filePath)
                    .userType(userType)
                    .status("pending")
                    .build();

            document = documentRepository.save(document);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("document", document);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserDocuments(@AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            List<Document> documents = documentRepository.findByUserIdOrderByCreatedAtDesc(userDetails.getId());
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<?> getDocumentsByOwner(@PathVariable Long ownerId) {
        try {
            List<Document> documents = documentRepository.findByUserIdOrderByCreatedAtDesc(ownerId);
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllDocuments() {
        try {
            List<Document> documents = documentRepository.findAll().stream()
                    .sorted((d1, d2) -> d2.getCreatedAt().compareTo(d1.getCreatedAt()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> verifyDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> payload) {
        try {
            Document document = documentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            String status = (String) payload.get("status");
            String rejectionReason = (String) payload.get("rejectionReason");

            User adminUser = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("Admin user not found"));

            document.setStatus(status);
            document.setRejectionReason(rejectionReason);
            if ("verified".equalsIgnoreCase(status)) {
                document.setVerifiedAt(LocalDateTime.now());
                document.setVerifiedBy(adminUser);
            }

            document = documentRepository.save(document);

            return ResponseEntity.ok(document);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            Document document = documentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            if (!document.getUser().getId().equals(userDetails.getId())
                    && !"admin".equalsIgnoreCase(userDetails.getUser().getRole())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Not authorized");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            documentRepository.delete(document);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Document removed");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
