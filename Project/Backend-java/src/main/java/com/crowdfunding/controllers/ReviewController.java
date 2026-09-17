package com.crowdfunding.controllers;

import com.crowdfunding.models.Review;
import com.crowdfunding.models.User;
import com.crowdfunding.repositories.ReviewRepository;
import com.crowdfunding.repositories.UserRepository;
import com.crowdfunding.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/company/{companyId}")
    public ResponseEntity<?> getCompanyReviews(@PathVariable Long companyId) {
        try {
            List<Review> reviews = reviewRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping
    public ResponseEntity<?> addReview(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> payload
    ) {
        try {
            Long companyId = Long.parseLong(payload.get("company").toString());
            int rating = Integer.parseInt(payload.get("rating").toString());
            String comment = (String) payload.get("comment");
            String appreciation = (String) payload.get("appreciation");
            String feedback = (String) payload.get("feedback");

            User author = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("Author not found"));

            User companyUser = userRepository.findById(companyId)
                    .orElseThrow(() -> new RuntimeException("Target company/user not found"));

            Review review = Review.builder()
                    .author(author)
                    .company(companyUser)
                    .rating(rating)
                    .comment(comment)
                    .appreciation(appreciation)
                    .feedback(feedback)
                    .build();

            review = reviewRepository.save(review);

            // Update user/company stars and reviewsCount
            List<Review> allReviews = reviewRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
            double totalStars = 0;
            for (Review r : allReviews) {
                totalStars += r.getRating();
            }
            double averageStars = allReviews.isEmpty() ? 0.0 : totalStars / allReviews.size();
            
            companyUser.setStars(averageStars);
            companyUser.setReviewsCount(allReviews.size());
            userRepository.save(companyUser);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("review", review);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
