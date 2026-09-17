package com.crowdfunding.controllers;

import com.crowdfunding.models.Company;
import com.crowdfunding.models.Investment;
import com.crowdfunding.models.Project;
import com.crowdfunding.models.User;
import com.crowdfunding.repositories.CompanyRepository;
import com.crowdfunding.repositories.InvestmentRepository;
import com.crowdfunding.repositories.ProjectRepository;
import com.crowdfunding.repositories.UserRepository;
import com.crowdfunding.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
public class InvestmentController {

    @Autowired
    private InvestmentRepository investmentRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    // ─── Payment Order Endpoints
    // ──────────────────────────────────────────────────

    @PostMapping({ "/api/payment/order", "/api/payment/create-order" })
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> payload) {
        try {
            Object amtObj = payload.get("amount");
            Object projIdObj = payload.get("projectId");
            String paymentMethod = (String) payload.get("paymentMethod");

            if (amtObj == null || projIdObj == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Amount and project ID are required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            double amount = Double.parseDouble(amtObj.toString());
            Long projectId = Long.parseLong(projIdObj.toString());

            Optional<Project> projectOpt = projectRepository.findById(projectId);
            if (projectOpt.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Project not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            Project project = projectOpt.get();
            if ("completed".equalsIgnoreCase(project.getStatus())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "This campaign has already reached its funding goal and is finished.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            if (project.getEndDate().isBefore(LocalDateTime.now())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "This campaign's funding period has ended.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // Generate a mock order
            Map<String, Object> mockOrder = new HashMap<>();
            mockOrder.put("id",
                    "order_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 9));
            mockOrder.put("amount", amount * 100); // Razorpay amount is in paise
            mockOrder.put("currency", "INR");
            mockOrder.put("receipt", "project_" + projectId + "_" + System.currentTimeMillis());
            mockOrder.put("status", "created");
            mockOrder.put("projectId", projectId);
            mockOrder.put("paymentMethod", paymentMethod);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("order", mockOrder);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/api/payment/verify")
    public ResponseEntity<?> verifyPayment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> payload) {
        try {
            String razorpayOrderId = (String) payload.get("razorpayOrderId");
            String razorpayPaymentId = (String) payload.get("razorpayPaymentId");
            Object projIdObj = payload.get("projectId");
            Object amtObj = payload.get("amount");

            if (razorpayOrderId == null || razorpayPaymentId == null || projIdObj == null || amtObj == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Missing required payment details");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            Long projectId = Long.parseLong(projIdObj.toString());
            double amount = Double.parseDouble(amtObj.toString());

            if (!razorpayOrderId.startsWith("order_")) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Invalid order reference");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // Check if this specific payment was already processed
            List<Investment> existing = investmentRepository.findByInvestorIdOrderByCreatedAtDesc(userDetails.getId());
            Optional<Investment> duplicate = existing.stream()
                    .filter(i -> razorpayPaymentId.equals(i.getPaymentId()))
                    .findFirst();

            if (duplicate.isPresent()) {
                Project project = projectRepository.findById(projectId).orElse(null);
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Payment already processed");
                response.put("investment", duplicate.get());
                response.put("project", project);
                return ResponseEntity.ok(response);
            }

            User investor = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("Investor not found"));

            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            if ("completed".equalsIgnoreCase(project.getStatus()) || project.getEndDate().isBefore(LocalDateTime.now())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Campaign is finished and cannot accept new investments");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // Create completed investment
            Investment investment = Investment.builder()
                    .project(project)
                    .investor(investor)
                    .amount(amount)
                    .status("completed")
                    .paymentId(razorpayPaymentId)
                    .completedAt(LocalDateTime.now())
                    .build();

            investment = investmentRepository.save(investment);

            // Increment currentAmount
            project.setCurrentAmount(project.getCurrentAmount() + amount);
            if (project.getCurrentAmount() >= project.getTargetAmount()) {
                project.setStatus("completed");
            }
            project = projectRepository.save(project);

            // Generate automatic milestones
            generateAutomaticMilestones(project, amount);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment verified and investment recorded successfully");
            response.put("investment", investment);
            response.put("project", project);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ─── Direct Investment Endpoints
    // ──────────────────────────────────────────────

    @PostMapping("/api/investments")
    public ResponseEntity<?> createInvestment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> payload) {
        try {
            Object projIdObj = payload.get("projectId");
            Object amtObj = payload.get("amount");

            if (projIdObj == null || amtObj == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Project ID and amount are required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            Long projectId = Long.parseLong(projIdObj.toString());
            double amount = Double.parseDouble(amtObj.toString());

            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            if ("completed".equalsIgnoreCase(project.getStatus())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "This campaign has already reached its funding goal and is finished.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            if (project.getEndDate().isBefore(LocalDateTime.now())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "This campaign's funding period has ended.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            User investor = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Users can invest multiple times, so no duplicate check needed here

            Investment investment = Investment.builder()
                    .project(project)
                    .investor(investor)
                    .amount(amount)
                    .status("pending")
                    .build();

            investment = investmentRepository.save(investment);

            // Increment currentAmount
            project.setCurrentAmount(project.getCurrentAmount() + amount);
            if (project.getCurrentAmount() >= project.getTargetAmount()) {
                project.setStatus("completed");
            }
            project = projectRepository.save(project);

            // Generate automatic milestones
            generateAutomaticMilestones(project, amount);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("investment", investment);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/api/investments/user")
    public ResponseEntity<?> getUserInvestments(@AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            List<Investment> investments = investmentRepository
                    .findByInvestorIdOrderByCreatedAtDesc(userDetails.getId());

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

    @GetMapping("/api/investments/received")
    public ResponseEntity<?> getReceivedInvestments(@AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            List<Investment> investments = investmentRepository
                    .findByProjectCreatorIdOrderByCreatedAtDesc(userDetails.getId());

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

    @GetMapping("/api/investments/project/{projectId}")
    public ResponseEntity<?> getProjectInvestments(@PathVariable Long projectId) {
        try {
            List<Investment> investments = investmentRepository.findByProjectIdOrderByCreatedAtDesc(projectId);

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

    // Helper: Milestones logic
    private void generateAutomaticMilestones(Project project, double amount) {
        try {
            Optional<Company> companyOpt = companyRepository.findByUserId(project.getCreator().getId());
            if (companyOpt.isPresent()) {
                Company company = companyOpt.get();
                List<Company.ActivityLogItem> newMilestones = new ArrayList<>();

                // Check for first investment
                List<Investment> allProjectInvestments = investmentRepository
                        .findByProjectIdOrderByCreatedAtDesc(project.getId());
                long approvedCount = allProjectInvestments.stream()
                        .filter(i -> "completed".equalsIgnoreCase(i.getStatus())
                                || "approved".equalsIgnoreCase(i.getStatus()))
                        .count();

                if (approvedCount == 1) {
                    newMilestones.add(Company.ActivityLogItem.builder()
                            .milestone("Received first platform collaboration for \"" + project.getTitle() + "\"")
                            .type("automatic")
                            .date(LocalDateTime.now().toString())
                            .build());
                }

                // Check funding percentage
                double current = project.getCurrentAmount();
                double target = project.getTargetAmount();
                double prevAmount = current - amount;

                double currentPercent = (current / target) * 100;
                double prevPercent = (prevAmount / target) * 100;

                if (currentPercent >= 100 && prevPercent < 100) {
                    newMilestones.add(Company.ActivityLogItem.builder()
                            .milestone("Successfully reached 100% funding goal for \"" + project.getTitle() + "\"")
                            .type("automatic")
                            .date(LocalDateTime.now().toString())
                            .build());
                } else if (currentPercent >= 50 && prevPercent < 50) {
                    newMilestones.add(Company.ActivityLogItem.builder()
                            .milestone("Reached 50% funding milestone for \"" + project.getTitle() + "\"")
                            .type("automatic")
                            .date(LocalDateTime.now().toString())
                            .build());
                }

                if (!newMilestones.isEmpty()) {
                    company.getActivityLog().addAll(newMilestones);
                    companyRepository.save(company);
                }
            }
        } catch (Exception e) {
            System.err.println("Error generating automatic milestones: " + e.getMessage());
        }
    }
}
