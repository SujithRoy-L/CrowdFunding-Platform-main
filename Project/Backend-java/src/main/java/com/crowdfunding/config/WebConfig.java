package com.crowdfunding.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Resolve absolute path to the uploads folder located in the parent directory
        Path uploadDir = Paths.get("..", "uploads").toAbsolutePath().normalize();
        String uploadPath = uploadDir.toUri().toString();

        // Map "/uploads/**" requests to the absolute file system path of the uploads folder
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath);

        System.out.println("✅ Static uploads resource handler registered at: " + uploadPath);
    }
}
