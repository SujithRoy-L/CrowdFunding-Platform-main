package com.crowdfunding.controllers;

import com.crowdfunding.models.Complaint;
import com.crowdfunding.models.User;
import com.crowdfunding.repositories.ComplaintRepository;
import com.crowdfunding.repositories.UserRepository;
import com.crowdfunding.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createComplaint(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> payload) {
        try {
            String type = (String) payload.get("type");
            String subject = (String) payload.get("subject");
            String description = (String) payload.get("description");
            String screenshot = (String) payload.get("screenshot");
            Object targetCompanyIdObj = payload.get("targetCompanyId");

            User author = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("Author not found"));

            User targetCompany = null;
            if (targetCompanyIdObj != null && !targetCompanyIdObj.toString().isEmpty()) {
                Long targetCompanyId = Long.parseLong(targetCompanyIdObj.toString());
                targetCompany = userRepository.findById(targetCompanyId).orElse(null);
            }

            Complaint complaint = Complaint.builder()
                    .author(author)
                    .type(type != null ? type : "bug")
                    .subject(subject)
                    .description(description)
                    .screenshot(screenshot)
                    .targetCompany(targetCompany)
                    .status("pending")
                    .build();

            complaint = complaintRepository.save(complaint);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("complaint", complaint);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserComplaints(@AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            List<Complaint> complaints = complaintRepository.findAll().stream()
                    .filter(c -> c.getAuthor().getId().equals(userDetails.getId()))
                    .sorted((c1, c2) -> c2.getCreatedAt().compareTo(c1.getCreatedAt()))
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("complaints", complaints);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllComplaints() {
        try {
            List<Complaint> complaints = complaintRepository.findAll().stream()
                    .sorted((c1, c2) -> c2.getCreatedAt().compareTo(c1.getCreatedAt()))
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("complaints", complaints);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
