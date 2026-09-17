package com.crowdfunding.services;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    // Target upload root directory relative to the parent project directory
    private final Path uploadRootDir = Paths.get("..", "uploads").toAbsolutePath().normalize();

    public FileStorageService() {
        try {
            Files.createDirectories(this.uploadRootDir);
            Files.createDirectories(this.uploadRootDir.resolve("projects"));
            Files.createDirectories(this.uploadRootDir.resolve("profiles"));
            Files.createDirectories(this.uploadRootDir.resolve("documents"));
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage folder!", e);
        }
    }

    public String storeFile(MultipartFile file, String subFolder) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file.");
            }

            // Clean path
            String originalFileName = file.getOriginalFilename();
            String extension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }

            // Generate unique name
            String fileName = UUID.randomUUID().toString() + extension;

            // Target path
            Path targetLocation = this.uploadRootDir.resolve(subFolder).resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Return relative path for web access
            return "/uploads/" + subFolder + "/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file. Please try again!", ex);
        }
    }
}
