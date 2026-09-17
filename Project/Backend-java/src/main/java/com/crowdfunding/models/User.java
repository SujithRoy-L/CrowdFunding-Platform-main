package com.crowdfunding.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // startup, investor, mnc, employee, admin

    private String companyName;
    private String companyWebsite;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String profileImage;

    @JsonProperty("isVerified")
    @Builder.Default
    private boolean isVerified = false;

    @Builder.Default
    private double stars = 0.0;

    @Builder.Default
    private int reviewsCount = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_services", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "service")
    @Builder.Default
    private List<String> services = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "user_portfolio", joinColumns = @JoinColumn(name = "user_id"))
    @Builder.Default
    private List<PortfolioItem> personalPortfolio = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "user_partners", joinColumns = @JoinColumn(name = "user_id"))
    @Builder.Default
    private List<PartnerHistoryItem> partnerHistory = new ArrayList<>();

    // Custom helper to provide MongoDB _id compatibility for React frontend
    @JsonProperty("_id")
    public String getMongodbId() {
        return id != null ? id.toString() : null;
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PortfolioItem {
        private String title;
        @Column(columnDefinition = "TEXT")
        private String description;
        private String link;
        private String image;
        @Column(name = "item_date")
        private String date;
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PartnerHistoryItem {
        @Column(name = "partner_name")
        private String name;
        private String logo;
        private Long profileId; // Ref to User ID
    }
}
