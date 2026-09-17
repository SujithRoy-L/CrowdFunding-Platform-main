package com.crowdfunding.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String projectName;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String documentType;

    @Column(nullable = false)
    private String filePath;

    @Column(nullable = false)
    private String userType; // investor, creator

    @Builder.Default
    private String status = "pending"; // pending, verified, rejected

    private LocalDateTime verifiedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "verified_by_id")
    private User verifiedBy;

    private String rejectionReason;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // Compatibility for React frontend
    @JsonProperty("_id")
    public String getMongodbId() {
        return id != null ? id.toString() : null;
    }
}
