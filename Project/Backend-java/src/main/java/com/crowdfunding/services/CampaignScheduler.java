package com.crowdfunding.services;

import com.crowdfunding.models.Project;
import com.crowdfunding.repositories.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.crowdfunding.models.Investment;
import com.crowdfunding.repositories.InvestmentRepository;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class CampaignScheduler {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private InvestmentRepository investmentRepository;

    // Run every hour at the top of the hour: 0 0 * * * *
    @Scheduled(cron = "0 0 * * * *")
    public void lockExpiredProjects() {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<Project> expiredProjects = projectRepository.findByEndDateBeforeAndIsLocked(now, false);

            if (!expiredProjects.isEmpty()) {
                for (Project project : expiredProjects) {
                    project.setLocked(true);
                    
                    // Process investments across all users for this campaign
                    List<Investment> investments = investmentRepository.findByProjectIdOrderByCreatedAtDesc(project.getId());
                    boolean isSuccessful = project.getCurrentAmount() >= project.getTargetAmount();
                    
                    for (Investment inv : investments) {
                        inv.setStatus(isSuccessful ? "completed" : "failed");
                        if (isSuccessful && inv.getCompletedAt() == null) {
                            inv.setCompletedAt(LocalDateTime.now());
                        }
                    }
                    investmentRepository.saveAll(investments);
                }
                projectRepository.saveAll(expiredProjects);
                System.out.println("✅ Locked and processed investments for " + expiredProjects.size() + " expired projects.");
            }
        } catch (Exception e) {
            System.err.println("❌ Error locking expired projects: " + e.getMessage());
        }
    }
}
