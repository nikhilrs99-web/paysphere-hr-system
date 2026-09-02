package com.hrproject.employeedb.repository;

import com.hrproject.employeedb.model.OnboardingStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OnboardingStepRepository extends JpaRepository<OnboardingStep, Long> {
    List<OnboardingStep> findByWorkflowId(Long workflowId);
}
