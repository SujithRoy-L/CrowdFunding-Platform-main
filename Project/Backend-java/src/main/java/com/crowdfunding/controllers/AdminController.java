package com.crowdfunding.controllers;

import com.crowdfunding.models.*;
import com.crowdfunding.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private InvestmentRepository investmentRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private MessageRepository messageRepository;

    @GetMapping({ "/stats", "/dashboard" })
    public ResponseEntity<?> getDashboardStats() {
        try {
            long totalUsers = userRepository.count();
            long totalProjects = projectRepository.count();
            long approvedProjects = projectRepository.findAll().stream()
                    .filter(p -> "approved".equalsIgnoreCase(p.getStatus()))
                    .count();
            long pendingProjects = projectRepository.findAll().stream()
                    .filter(p -> "pending".equalsIgnoreCase(p.getStatus()))
                    .count();
            long pendingDocuments = documentRepository.findAll().stream()
                    .filter(d -> "pending".equalsIgnoreCase(d.getStatus()))
                    .count();
            long totalInvestments = investmentRepository.count();

            double totalInvestedAmount = investmentRepository.findAll().stream()
                    .mapToDouble(Investment::getAmount)
                    .sum();

            // Calculate Platform Revenue (e.g., 5% fee on completed investments)
            double platformRevenue = investmentRepository.findAll().stream()
                    .filter(i -> "completed".equalsIgnoreCase(i.getStatus())
                            || "approved".equalsIgnoreCase(i.getStatus()))
                    .mapToDouble(i -> i.getAmount() * 0.05)
                    .sum();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("totalProjects", totalProjects);
            stats.put("approvedProjects", approvedProjects);
            stats.put("pendingProjects", pendingProjects);
            stats.put("pendingDocuments", pendingDocuments);
            stats.put("totalInvestments", totalInvestments);
            stats.put("totalInvestedAmount", totalInvestedAmount);
            stats.put("platformRevenue", platformRevenue);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("stats", stats);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll().stream()
                    .sorted((u1, u2) -> u2.getCreatedAt().compareTo(u1.getCreatedAt()))
                    .collect(java.util.stream.Collectors.toList());

            // Remove password from returning data
            for (User u : users) {
                u.setPassword(null);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("users", users);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/projects")
    public ResponseEntity<?> getAllProjects() {
        try {
            List<Project> projects = projectRepository.findAll().stream()
                    .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                    .collect(java.util.stream.Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("projects", projects);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping({ "/projects/{id}/status", "/projects/{id}" })
    public ResponseEntity<?> updateProjectStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String status = payload.get("status");

            if (status == null || !Arrays.asList("pending", "approved", "rejected").contains(status)) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Invalid status");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            Project project = projectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            project.setStatus(status);
            project = projectRepository.save(project);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("project", project);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        try {
            Project project = projectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            projectRepository.delete(project);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Project deleted successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> payload) {
        try {
            Boolean isVerified = payload.get("isVerified");
            if (isVerified == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Missing isVerified parameter");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if ("admin".equalsIgnoreCase(user.getRole())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Cannot modify admin status");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            user.setVerified(isVerified);
            user = userRepository.save(user);

            if (isVerified) {
                Optional<Company> companyOpt = companyRepository.findByUserId(user.getId());
                if (companyOpt.isPresent()) {
                    Company company = companyOpt.get();
                    company.setVerified(true);

                    Company.ActivityLogItem log = Company.ActivityLogItem.builder()
                            .milestone("Earned Official Platform Verification Badge")
                            .type("automatic")
                            .date(LocalDateTime.now().toString())
                            .build();
                    company.getActivityLog().add(log);
                    companyRepository.save(company);
                }
            }

            user.setPassword(null); // Clear password from response

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", user);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/complaints")
    public ResponseEntity<?> getComplaints() {
        try {
            List<Complaint> complaints = complaintRepository.findAll().stream()
                    .sorted((c1, c2) -> c2.getCreatedAt().compareTo(c1.getCreatedAt()))
                    .collect(java.util.stream.Collectors.toList());

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

    @GetMapping("/investments")
    public ResponseEntity<?> getAllInvestments() {
        try {
            List<Investment> investments = investmentRepository.findAll().stream()
                    .sorted((i1, i2) -> i2.getCreatedAt().compareTo(i1.getCreatedAt()))
                    .collect(java.util.stream.Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("investments", investments);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/complaints/{id}/resolve")
    public ResponseEntity<?> resolveComplaint(@PathVariable Long id) {
        try {
            Complaint complaint = complaintRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Complaint not found"));

            complaint.setStatus("resolved");
            complaint = complaintRepository.save(complaint);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("complaint", complaint);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String role = payload.get("role");

            if (role == null || !Arrays.asList("startup", "investor", "mnc", "employee", "admin").contains(role)) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Invalid role");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if ("admin".equalsIgnoreCase(user.getRole())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Cannot modify admin roles");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            user.setRole(role);
            user = userRepository.save(user);
            user.setPassword(null);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", user);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if ("admin".equalsIgnoreCase(user.getRole())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Cannot delete admin accounts");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            // 1. Delete associated complaints (author or targeted user company)
            complaintRepository.findAll().stream()
                    .filter(c -> (c.getAuthor() != null && c.getAuthor().getId().equals(id)) ||
                            (c.getTargetCompany() != null && c.getTargetCompany().getId().equals(id)))
                    .forEach(c -> complaintRepository.delete(c));

            // 2. Delete reviews (author or targeted user company)
            reviewRepository.findAll().stream()
                    .filter(r -> (r.getAuthor() != null && r.getAuthor().getId().equals(id)) ||
                            (r.getCompany() != null && r.getCompany().getId().equals(id)))
                    .forEach(r -> reviewRepository.delete(r));

            // 3. Delete messages (sent or received by the user)
            messageRepository.findAll().stream()
                    .filter(m -> (m.getSender() != null && m.getSender().getId().equals(id)) ||
                            (m.getReceiver() != null && m.getReceiver().getId().equals(id)))
                    .forEach(m -> messageRepository.delete(m));

            // 4. Delete investments (made by the user, or made in projects created by the
            // user)
            investmentRepository.findAll().stream()
                    .filter(i -> (i.getInvestor() != null && i.getInvestor().getId().equals(id)) ||
                            (i.getProject() != null && i.getProject().getCreator() != null
                                    && i.getProject().getCreator().getId().equals(id)))
                    .forEach(i -> investmentRepository.delete(i));

            // 5. Delete documents (owned or verified by this user)
            documentRepository.findAll().stream()
                    .filter(d -> (d.getUser() != null && d.getUser().getId().equals(id)) ||
                            (d.getVerifiedBy() != null && d.getVerifiedBy().getId().equals(id)))
                    .forEach(d -> documentRepository.delete(d));

            // 6. Delete projects (created by the user)
            projectRepository.findAll().stream()
                    .filter(p -> p.getCreator() != null && p.getCreator().getId().equals(id))
                    .forEach(p -> projectRepository.delete(p));

            // 7. Clean up associated company
            Optional<Company> companyOpt = companyRepository.findByUserId(id);
            companyOpt.ifPresent(company -> companyRepository.delete(company));

            // 8. Finally, delete the user record
            userRepository.delete(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User deleted successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
