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
@Table(name = "complaints")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Builder.Default
    private String type = "bug"; // bug, fraud, unpaid, other

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    private String screenshot;

    @Builder.Default
    private String status = "pending"; // pending, in-progress, resolved, dismissed

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "target_company_id")
    private User targetCompany; // startup/user being complained about

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // Compatibility for React frontend
    @JsonProperty("_id")
    public String getMongodbId() {
        return id != null ? id.toString() : null;
    }
}
