package com.crowdfunding.controllers;

import com.crowdfunding.models.Project;
import com.crowdfunding.models.User;
import com.crowdfunding.repositories.ProjectRepository;
import com.crowdfunding.repositories.UserRepository;
import com.crowdfunding.security.CustomUserDetails;
import com.crowdfunding.services.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    private LocalDateTime parseIsoDate(String dateStr) {
        try {
            if (dateStr == null || dateStr.isBlank()) {
                return null;
            }
            if (dateStr.length() == 10) {
                return java.time.LocalDate.parse(dateStr).atStartOfDay();
            }
            try {
                return Instant.parse(dateStr).atZone(ZoneId.systemDefault()).toLocalDateTime();
            } catch (Exception e) {
                try {
                    return java.time.ZonedDateTime.parse(dateStr).toLocalDateTime();
                } catch (Exception e2) {
                    return LocalDateTime.parse(dateStr.substring(0, Math.min(dateStr.length(), 19)));
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse date '" + dateStr + "': " + e.getMessage());
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createProject(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("equity") double equity,
            @RequestParam(value = "category", defaultValue = "Other") String category,
            @RequestParam("targetAmount") double targetAmount,
            @RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            User creator = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String imageUrl = "";
            if (image != null && !image.isEmpty()) {
                imageUrl = fileStorageService.storeFile(image, "projects");
            }

            Project project = Project.builder()
                    .title(title)
                    .description(description)
                    .equity(equity)
                    .category(category)
                    .targetAmount(targetAmount)
                    .startDate(parseIsoDate(startDate))
                    .endDate(parseIsoDate(endDate))
                    .image(imageUrl)
                    .creator(creator)
                    .status("pending")
                    .build();

            project = projectRepository.save(project);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("project", project);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllProjects() {
        try {
            List<Project> projects = projectRepository.findByStatusOrderByCreatedAtDesc("approved");
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/user/projects")
    public ResponseEntity<?> getUserProjects(@AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            List<Project> projects = projectRepository.findByCreatorIdOrderByCreatedAtDesc(userDetails.getId());
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectById(@PathVariable Long id) {
        try {
            Project project = projectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            return ResponseEntity.ok(project);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Project not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProject(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "equity", required = false) Double equity,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "targetAmount", required = false) Double targetAmount,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            Project project = projectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            if (project.isLocked()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "This campaign is locked and cannot be updated");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            if (!project.getCreator().getId().equals(userDetails.getId())
                    && !"admin".equalsIgnoreCase(userDetails.getUser().getRole())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Not authorized to update this project");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            if (title != null)
                project.setTitle(title);
            if (description != null)
                project.setDescription(description);
            if (equity != null)
                project.setEquity(equity);
            if (category != null)
                project.setCategory(category);
            if (targetAmount != null)
                project.setTargetAmount(targetAmount);
            if (startDate != null)
                project.setStartDate(parseIsoDate(startDate));
            if (endDate != null)
                project.setEndDate(parseIsoDate(endDate));

            if (image != null && !image.isEmpty()) {
                String imageUrl = fileStorageService.storeFile(image, "projects");
                project.setImage(imageUrl);
            }

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

    @PostMapping("/{id}/campaign-images")
    public ResponseEntity<?> uploadCampaignImages(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(value = "campaignImages", required = false) MultipartFile[] files) {
        try {
            Project project = projectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            if (!project.getCreator().getId().equals(userDetails.getId())
                    && !"admin".equalsIgnoreCase(userDetails.getUser().getRole())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Not authorized to upload images to this project");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            if (files == null || files.length == 0) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "No campaign images provided");
                response.put("campaignImages", project.getCampaignImages());
                response.put("project", project);
                return ResponseEntity.ok(response);
            }

            List<String> imageUrls = new ArrayList<>();
            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    imageUrls.add(fileStorageService.storeFile(file, "projects"));
                }
            }

            if (!imageUrls.isEmpty()) {
                project.getCampaignImages().addAll(imageUrls);
                project = projectRepository.save(project);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Campaign images uploaded successfully");
            response.put("campaignImages", project.getCampaignImages());
            response.put("project", project);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}/campaign-images")
    public ResponseEntity<?> deleteCampaignImage(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> payload) {
        try {
            Project project = projectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            if (!project.getCreator().getId().equals(userDetails.getId())
                    && !"admin".equalsIgnoreCase(userDetails.getUser().getRole())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Not authorized to delete images from this project");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            String imageUrl = payload.get("imageUrl");
            if (imageUrl == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Image URL required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            project.getCampaignImages().remove(imageUrl);
            project = projectRepository.save(project);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Campaign image deleted successfully");
            response.put("campaignImages", project.getCampaignImages());
            response.put("project", project);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            Project project = projectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            if (!project.getCreator().getId().equals(userDetails.getId())
                    && !"admin".equalsIgnoreCase(userDetails.getUser().getRole())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Not authorized to delete this project");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

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
}
