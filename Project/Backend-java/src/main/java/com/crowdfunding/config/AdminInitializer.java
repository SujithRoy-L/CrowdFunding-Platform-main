package com.crowdfunding.config;

import com.crowdfunding.models.User;
import com.crowdfunding.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AdminInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAIL:admin@crowdfunding.com}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:Sujith@2005}")
    private String adminPassword;

    @Value("${ADMIN_NAME:Administrator}")
    private String adminName;

    @Override
    public void run(String... args) throws Exception {
        try {
            String normalizedEmail = (adminEmail == null) ? "admin@crowdfunding.com" : adminEmail.trim().toLowerCase();
            String normalizedPassword = (adminPassword == null || adminPassword.isBlank()) ? "Sujith@2005" : adminPassword;

            Optional<User> existingUserOpt = userRepository.findByEmail(normalizedEmail);

            if (existingUserOpt.isPresent()) {
                User existingUser = existingUserOpt.get();
                boolean needsPasswordReset = existingUser.getPassword() == null
                        || !passwordEncoder.matches(normalizedPassword, existingUser.getPassword());
                boolean needsRoleFix = !"admin".equalsIgnoreCase(existingUser.getRole());
                boolean needsVerificationFix = !existingUser.isVerified();

                if (needsRoleFix || needsVerificationFix || needsPasswordReset) {
                    existingUser.setRole("admin");
                    existingUser.setVerified(true);
                    existingUser.setEmail(normalizedEmail);
                    if (needsPasswordReset) {
                        existingUser.setPassword(passwordEncoder.encode(normalizedPassword));
                    }
                    userRepository.save(existingUser);
                    System.out.println("✅ Admin account repaired for: " + normalizedEmail);
                } else {
                    System.out.println("✅ Admin user exists: " + normalizedEmail);
                }
            } else {
                User admin = User.builder()
                        .name(adminName)
                        .email(normalizedEmail)
                        .password(passwordEncoder.encode(normalizedPassword))
                        .role("admin")
                        .isVerified(true)
                        .build();
                userRepository.save(admin);
                System.out.println("✅ Admin user created: " + normalizedEmail);
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to ensure admin user: " + e.getMessage());
        }
    }
}
