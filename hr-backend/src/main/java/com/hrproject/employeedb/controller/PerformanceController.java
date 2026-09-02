package com.hrproject.employeedb.controller;

import com.hrproject.employeedb.model.Feedback360;
import com.hrproject.employeedb.model.Goal;
import com.hrproject.employeedb.model.PerformanceReview;
import com.hrproject.employeedb.service.PerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/performance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PerformanceController {
    private final PerformanceService performanceService;

    @PostMapping("/reviews")
    public PerformanceReview createReview(@RequestBody PerformanceReview review) {
        return performanceService.createReview(review);
    }

    @GetMapping("/reviews/employee/{empId}")
    public List<PerformanceReview> getReviews(@PathVariable Long empId) {
        return performanceService.getEmployeeReviews(empId);
    }

    @PostMapping("/goals")
    public Goal createGoal(@RequestBody Goal goal) {
        return performanceService.createGoal(goal);
    }

    @GetMapping("/goals/employee/{empId}")
    public List<Goal> getGoals(@PathVariable Long empId) {
        return performanceService.getEmployeeGoals(empId);
    }

    @PatchMapping("/goals/{id}/progress")
    public Goal updateGoalProgress(@PathVariable Long id, @RequestParam Integer percentage, @RequestParam Goal.GoalStatus status) {
        return performanceService.updateGoalProgress(id, percentage, status);
    }

    @PostMapping("/feedback")
    public Feedback360 submitFeedback(@RequestBody Feedback360 feedback) {
        return performanceService.submitFeedback(feedback);
    }

    @GetMapping("/feedback/employee/{empId}")
    public List<Feedback360> getFeedback(@PathVariable Long empId) {
        return performanceService.getEmployeeFeedback(empId);
    }
}
