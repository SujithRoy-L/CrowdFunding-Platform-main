package com.crowdfunding.controllers;

import com.crowdfunding.models.Company;
import com.crowdfunding.models.User;
import com.crowdfunding.repositories.CompanyRepository;
import com.crowdfunding.repositories.UserRepository;
import com.crowdfunding.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllCompanies() {
        try {
            List<Company> companies = companyRepository.findAll();
            return ResponseEntity.ok(companies);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCompanyById(@PathVariable Long id) {
        try {
            Company company = companyRepository.findById(id)
                    .or(() -> companyRepository.findByUserId(id))
                    .orElseThrow(() -> new RuntimeException("Company not found"));
            return ResponseEntity.ok(company);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Company not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCompany(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> payload) {
        try {
            Company company = companyRepository.findById(id)
                    .or(() -> companyRepository.findByUserId(id))
                    .or(() -> companyRepository.findByUserId(userDetails.getId()))
                    .orElseGet(() -> {
                        User user = userRepository.findById(userDetails.getId())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                        return Company.builder()
                                .user(user)
                                .name(user.getCompanyName() != null && !user.getCompanyName().isBlank()
                                        ? user.getCompanyName()
                                        : user.getName() + "'s Company")
                                .website(user.getCompanyWebsite())
                                .build();
                    });

            // Allow the company owner or admin to update
            if (company.getUser() != null && !company.getUser().getId().equals(userDetails.getId())
                    && !"admin".equalsIgnoreCase(userDetails.getUser().getRole())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Not authorized to update this company profile");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            if (payload.containsKey("name"))
                company.setName((String) payload.get("name"));
            if (payload.containsKey("logo"))
                company.setLogo((String) payload.get("logo"));
            if (payload.containsKey("website"))
                company.setWebsite((String) payload.get("website"));
            if (payload.containsKey("bio"))
                company.setBio((String) payload.get("bio"));
            if (payload.containsKey("location"))
                company.setLocation((String) payload.get("location"));
            if (payload.containsKey("foundedDate"))
                company.setFoundedDate((String) payload.get("foundedDate"));
            if (payload.containsKey("teamSize"))
                company.setTeamSize((String) payload.get("teamSize"));

            if (payload.containsKey("industry")) {
                Object rawIndustry = payload.get("industry");
                if (rawIndustry instanceof java.util.Collection<?>) {
                    List<String> industryList = new ArrayList<>();
                    for (Object obj : (java.util.Collection<?>) rawIndustry) {
                        if (obj instanceof String) {
                            industryList.add((String) obj);
                        }
                    }
                    company.setIndustry(industryList);
                }
            }

            if (payload.containsKey("branding")) {
                Object rawBranding = payload.get("branding");
                if (rawBranding instanceof Map<?, ?>) {
                    Map<?, ?> brandingMap = (Map<?, ?>) rawBranding;
                    Company.Branding branding = company.getBranding();
                    if (branding == null)
                        branding = new Company.Branding();
                    if (brandingMap.containsKey("logo"))
                        branding.setBrandingLogo((String) brandingMap.get("logo"));
                    if (brandingMap.containsKey("primaryColor"))
                        branding.setPrimaryColor((String) brandingMap.get("primaryColor"));
                    if (brandingMap.containsKey("slogan"))
                        branding.setSlogan((String) brandingMap.get("slogan"));
                    company.setBranding(branding);
                }
            }

            if (payload.containsKey("visibilitySettings")) {
                Object rawVS = payload.get("visibilitySettings");
                if (rawVS instanceof Map<?, ?>) {
                    Map<?, ?> vsMap = (Map<?, ?>) rawVS;
                    Company.VisibilitySettings vs = company.getVisibilitySettings();
                    if (vs == null)
                        vs = new Company.VisibilitySettings();
                    if (vsMap.containsKey("showPortfolio"))
                        vs.setShowPortfolio((Boolean) vsMap.get("showPortfolio"));
                    if (vsMap.containsKey("showMetrics"))
                        vs.setShowMetrics((Boolean) vsMap.get("showMetrics"));
                    if (vsMap.containsKey("showJourney"))
                        vs.setShowJourney((Boolean) vsMap.get("showJourney"));
                    company.setVisibilitySettings(vs);
                }
            }

            if (payload.containsKey("socialLinks")) {
                Object rawSL = payload.get("socialLinks");
                if (rawSL instanceof Map<?, ?>) {
                    Map<?, ?> slMap = (Map<?, ?>) rawSL;
                    Company.SocialLinks sl = company.getSocialLinks();
                    if (sl == null)
                        sl = new Company.SocialLinks();
                    if (slMap.containsKey("linkedin"))
                        sl.setLinkedin((String) slMap.get("linkedin"));
                    if (slMap.containsKey("twitter"))
                        sl.setTwitter((String) slMap.get("twitter"));
                    if (slMap.containsKey("github"))
                        sl.setGithub((String) slMap.get("github"));
                    company.setSocialLinks(sl);
                }
            }

            if (payload.containsKey("portfolio")) {
                Object rawPortfolio = payload.get("portfolio");
                if (rawPortfolio instanceof java.util.Collection<?>) {
                    List<Company.PortfolioItem> items = new ArrayList<>();
                    for (Object obj : (java.util.Collection<?>) rawPortfolio) {
                        if (obj instanceof Map<?, ?>) {
                            Map<?, ?> p = (Map<?, ?>) obj;
                            items.add(Company.PortfolioItem.builder()
                                    .title((String) p.get("title"))
                                    .description((String) p.get("description"))
                                    .link((String) p.get("link"))
                                    .image((String) p.get("image"))
                                    .clientName((String) p.get("clientName"))
                                    .date((String) p.get("date"))
                                    .build());
                        }
                    }
                    company.setPortfolio(items);
                }
            }

            if (payload.containsKey("partnerHistory")) {
                Object rawPartners = payload.get("partnerHistory");
                if (rawPartners instanceof java.util.Collection<?>) {
                    List<Company.PartnerHistoryItem> items = new ArrayList<>();
                    for (Object obj : (java.util.Collection<?>) rawPartners) {
                        if (obj instanceof Map<?, ?>) {
                            Map<?, ?> p = (Map<?, ?>) obj;
                            Long profileId = p.get("profileId") != null ? Long.parseLong(p.get("profileId").toString())
                                    : null;
                            items.add(Company.PartnerHistoryItem.builder()
                                    .name((String) p.get("name"))
                                    .logo((String) p.get("logo"))
                                    .profileId(profileId)
                                    .build());
                        }
                    }
                    company.setPartnerHistory(items);
                }
            }

            if (payload.containsKey("activityLog")) {
                Object rawLog = payload.get("activityLog");
                if (rawLog instanceof java.util.Collection<?>) {
                    List<Company.ActivityLogItem> items = new ArrayList<>();
                    for (Object obj : (java.util.Collection<?>) rawLog) {
                        if (obj instanceof Map<?, ?>) {
                            Map<?, ?> p = (Map<?, ?>) obj;
                            items.add(Company.ActivityLogItem.builder()
                                    .milestone((String) p.get("milestone"))
                                    .type((String) p.get("type"))
                                    .date((String) p.get("date"))
                                    .build());
                        }
                    }
                    company.setActivityLog(items);
                }
            }

            company = companyRepository.save(company);

            // Also check if company exists in user database or create relationship
            Optional<Company> existingComp = companyRepository.findByUserId(company.getUser().getId());
            if (existingComp.isEmpty()) {
                companyRepository.save(company);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("company", company);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
