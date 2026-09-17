package com.crowdfunding.controllers;

import com.crowdfunding.models.User;
import com.crowdfunding.repositories.UserRepository;
import com.crowdfunding.security.CustomUserDetails;
import com.crowdfunding.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    // ── Validation helpers ────────────────────────────────────────────────────
    private static final java.util.regex.Pattern EMAIL_PATTERN =
            java.util.regex.Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private static final java.util.regex.Pattern PASSWORD_PATTERN =
            java.util.regex.Pattern.compile(
                    "^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':,.<>?]).{8,}$");

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        if (email == null || email.isBlank()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Email is required");
            return ResponseEntity.badRequest().body(error);
        }
        boolean exists = userRepository.existsByEmail(email.trim().toLowerCase());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> payload) {
        try {
            String name     = (String) payload.get("name");
            String email    = (String) payload.get("email");
            String password = (String) payload.get("password");
            String role     = (String) payload.get("role");
            String companyName    = (String) payload.get("companyName");
            String companyWebsite = (String) payload.get("companyWebsite");

            // ── Required field check ──────────────────────────────────────────
            if (name == null || name.isBlank()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("field", "name");
                error.put("message", "Full name is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            if (email == null || email.isBlank()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("field", "email");
                error.put("message", "Email address is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            if (!EMAIL_PATTERN.matcher(email.trim()).matches()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("field", "email");
                error.put("message", "Please enter a valid email address");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            if (password == null || password.isBlank()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("field", "password");
                error.put("message", "Password is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            if (!PASSWORD_PATTERN.matcher(password).matches()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("field", "password");
                error.put("message", "Password must be at least 8 characters and include an uppercase letter, a number, and a special character (!@#$%^&*)");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            if (userRepository.existsByEmail(email.trim().toLowerCase())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("field", "email");
                error.put("message", "An account with this email already exists");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            User user = User.builder()
                    .name(name.trim())
                    .email(email.trim().toLowerCase())
                    .password(passwordEncoder.encode(password))
                    .role(role != null ? role : "startup")
                    .companyName(companyName)
                    .companyWebsite(companyWebsite)
                    .build();

            user = userRepository.save(user);

            String token = jwtUtils.generateToken(user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", token);

            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("_id", user.getId().toString());
            userMap.put("name", user.getName());
            userMap.put("email", user.getEmail());
            userMap.put("role", user.getRole());
            response.put("user", userMap);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        try {
            String email    = payload.get("email");
            String password = payload.get("password");

            // ── Strict field validation ───────────────────────────────────────
            if (email == null || email.isBlank()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("field", "email");
                error.put("message", "Email address is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            if (!EMAIL_PATTERN.matcher(email.trim()).matches()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("field", "email");
                error.put("message", "Please enter a valid email address");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            if (password == null || password.isBlank()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("field", "password");
                error.put("message", "Password is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // ── Check email exists ────────────────────────────────────────────
            Optional<User> userOpt = userRepository.findByEmail(email.trim().toLowerCase());
            if (userOpt.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("field", "email");
                error.put("message", "No account found with this email address");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            // ── Check password ────────────────────────────────────────────────
            User user = userOpt.get();
            if (!passwordEncoder.matches(password, user.getPassword())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("field", "password");
                error.put("message", "Incorrect password. Please try again");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            // Perform Spring authentication
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String token = jwtUtils.generateToken(user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", token);

            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("_id", user.getId().toString());
            userMap.put("name", user.getName());
            userMap.put("email", user.getEmail());
            userMap.put("role", user.getRole());
            response.put("user", userMap);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

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

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal CustomUserDetails userDetails,
                                           @RequestBody Map<String, Object> payload) {
        try {
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (payload.containsKey("name")) user.setName((String) payload.get("name"));
            if (payload.containsKey("bio")) user.setBio((String) payload.get("bio"));
            if (payload.containsKey("profileImage")) user.setProfileImage((String) payload.get("profileImage"));
            if (payload.containsKey("companyName")) user.setCompanyName((String) payload.get("companyName"));
            if (payload.containsKey("companyWebsite")) user.setCompanyWebsite((String) payload.get("companyWebsite"));

            if (payload.containsKey("services")) {
                Object rawServices = payload.get("services");
                if (rawServices instanceof java.util.Collection<?>) {
                    java.util.List<String> servicesList = new java.util.ArrayList<>();
                    for (Object obj : (java.util.Collection<?>) rawServices) {
                        if (obj instanceof String) {
                            servicesList.add((String) obj);
                        }
                    }
                    user.setServices(servicesList);
                }
            }

            if (payload.containsKey("personalPortfolio")) {
                Object rawPortfolio = payload.get("personalPortfolio");
                if (rawPortfolio instanceof java.util.Collection<?>) {
                    java.util.List<User.PortfolioItem> items = new java.util.ArrayList<>();
                    for (Object obj : (java.util.Collection<?>) rawPortfolio) {
                        if (obj instanceof Map<?, ?>) {
                            Map<?, ?> p = (Map<?, ?>) obj;
                            items.add(User.PortfolioItem.builder()
                                    .title((String) p.get("title"))
                                    .description((String) p.get("description"))
                                    .link((String) p.get("link"))
                                    .image((String) p.get("image"))
                                    .date((String) p.get("date"))
                                    .build());
                        }
                    }
                    user.setPersonalPortfolio(items);
                }
            }

            if (payload.containsKey("partnerHistory")) {
                Object rawPartners = payload.get("partnerHistory");
                if (rawPartners instanceof java.util.Collection<?>) {
                    java.util.List<User.PartnerHistoryItem> items = new java.util.ArrayList<>();
                    for (Object obj : (java.util.Collection<?>) rawPartners) {
                        if (obj instanceof Map<?, ?>) {
                            Map<?, ?> p = (Map<?, ?>) obj;
                            Long profileId = p.get("profileId") != null ? Long.parseLong(p.get("profileId").toString()) : null;
                            items.add(User.PartnerHistoryItem.builder()
                                    .name((String) p.get("name"))
                                    .logo((String) p.get("logo"))
                                    .profileId(profileId)
                                    .build());
                        }
                    }
                    user.setPartnerHistory(items);
                }
            }

            user = userRepository.save(user);

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
}
