package com.crowdfunding.repositories;

import com.crowdfunding.models.Investment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvestmentRepository extends JpaRepository<Investment, Long> {
    List<Investment> findByInvestorIdOrderByCreatedAtDesc(Long investorId);
    List<Investment> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    List<Investment> findByProjectCreatorIdOrderByCreatedAtDesc(Long creatorId);
}
