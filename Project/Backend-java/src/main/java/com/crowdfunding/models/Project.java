package com.crowdfunding.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private double equity;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Column(nullable = false)
    private String category; // Education, Healthcare, Environment, Technology, Social, Other

    @Column(nullable = false)
    private double targetAmount;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Column(nullable = false)
    private String image;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "project_campaign_images", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> campaignImages = new ArrayList<>();

    @Builder.Default
    private String status = "pending"; // pending, approved, rejected

    @Builder.Default
    private double currentAmount = 0.0;

    @JsonProperty("isLocked")
    @Builder.Default
    private boolean isLocked = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Compatibility for React frontend
    @JsonProperty("_id")
    public String getMongodbId() {
        return id != null ? id.toString() : null;
    }
}
