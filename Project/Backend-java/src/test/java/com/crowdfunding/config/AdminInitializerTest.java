package com.crowdfunding.config;

import com.crowdfunding.models.User;
import com.crowdfunding.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminInitializerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminInitializer adminInitializer;

    @Test
    void shouldResetExistingAdminPasswordToDefault() throws Exception {
        ReflectionTestUtils.setField(adminInitializer, "adminEmail", "admin@crowdfunding.com");
        ReflectionTestUtils.setField(adminInitializer, "adminPassword", "Sujith@2005");
        ReflectionTestUtils.setField(adminInitializer, "adminName", "Administrator");

        User existingAdmin = User.builder()
                .id(1L)
                .name("Administrator")
                .email("admin@crowdfunding.com")
                .password("old-hash")
                .role("admin")
                .isVerified(false)
                .build();

        when(userRepository.findByEmail("admin@crowdfunding.com")).thenReturn(Optional.of(existingAdmin));
        when(passwordEncoder.matches("Sujith@2005", "old-hash")).thenReturn(false);
        when(passwordEncoder.encode("Sujith@2005")).thenReturn("fixed-hash");

        adminInitializer.run();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertEquals("fixed-hash", userCaptor.getValue().getPassword());
        assertEquals("admin", userCaptor.getValue().getRole());
        assertEquals(true, userCaptor.getValue().isVerified());
    }
}
