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
@Table(name = "companies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String name;

    private String logo;
    private String website;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String location;
    private String foundedDate;
    private String teamSize;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "company_industry", joinColumns = @JoinColumn(name = "company_id"))
    @Column(name = "industry_name")
    @Builder.Default
    private List<String> industry = new ArrayList<>();

    @Embedded
    @Builder.Default
    private Branding branding = new Branding();

    @Embedded
    @Builder.Default
    private VisibilitySettings visibilitySettings = new VisibilitySettings();

    @Embedded
    @Builder.Default
    private SocialLinks socialLinks = new SocialLinks();

    @ElementCollection
    @CollectionTable(name = "company_portfolio", joinColumns = @JoinColumn(name = "company_id"))
    @Builder.Default
    private List<PortfolioItem> portfolio = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "company_partners", joinColumns = @JoinColumn(name = "company_id"))
    @Builder.Default
    private List<PartnerHistoryItem> partnerHistory = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "company_activity_log", joinColumns = @JoinColumn(name = "company_id"))
    @Builder.Default
    private List<ActivityLogItem> activityLog = new ArrayList<>();

    @JsonProperty("isVerified")
    @Builder.Default
    private boolean isVerified = false;

    @Embedded
    @Builder.Default
    private Ratings ratings = new Ratings();

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

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Branding {
        private String brandingLogo;
        @Builder.Default
        private String primaryColor = "#0077b6";
        private String slogan;
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VisibilitySettings {
        @Builder.Default
        private boolean showPortfolio = true;
        @Builder.Default
        private boolean showMetrics = true;
        @Builder.Default
        private boolean showJourney = true;
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SocialLinks {
        private String linkedin;
        private String twitter;
        private String github;
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
        private String clientName;
        private String date;
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PartnerHistoryItem {
        private String name;
        private String logo;
        private Long profileId;
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActivityLogItem {
        private String milestone;
        @Builder.Default
        private String type = "manual"; // automatic, manual
        @Builder.Default
        private String date = LocalDateTime.now().toString();
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Ratings {
        @Builder.Default
        private double average = 0.0;
        @Builder.Default
        private int count = 0;
    }
}
