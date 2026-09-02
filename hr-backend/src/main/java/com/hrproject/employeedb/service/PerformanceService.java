package com.hrproject.employeedb.service;

import com.hrproject.employeedb.model.Feedback360;
import com.hrproject.employeedb.model.Goal;
import com.hrproject.employeedb.model.PerformanceReview;
import com.hrproject.employeedb.repository.Feedback360Repository;
import com.hrproject.employeedb.repository.GoalRepository;
import com.hrproject.employeedb.repository.PerformanceReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PerformanceService {
    private final PerformanceReviewRepository reviewRepository;
    private final GoalRepository goalRepository;
    private final Feedback360Repository feedbackRepository;

    public PerformanceReview createReview(PerformanceReview review) {
        review.setReviewDate(LocalDate.now());
        return reviewRepository.save(review);
    }

    public List<PerformanceReview> getEmployeeReviews(Long employeeId) {
        return reviewRepository.findByEmployeeId(employeeId);
    }

    public Goal createGoal(Goal goal) {
        return goalRepository.save(goal);
    }

    public List<Goal> getEmployeeGoals(Long employeeId) {
        return goalRepository.findByEmployeeId(employeeId);
    }

    public Goal updateGoalProgress(Long goalId, Integer percentage, Goal.GoalStatus status) {
        Goal goal = goalRepository.findById(goalId).orElseThrow();
        goal.setCompletionPercentage(percentage);
        goal.setStatus(status);
        return goalRepository.save(goal);
    }

    public Feedback360 submitFeedback(Feedback360 feedback) {
        feedback.setDateProvided(LocalDate.now());
        return feedbackRepository.save(feedback);
    }

    public List<Feedback360> getEmployeeFeedback(Long employeeId) {
        return feedbackRepository.findBySubjectId(employeeId);
    }
}
