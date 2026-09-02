package com.hrproject.employeedb.repository;

import com.hrproject.employeedb.model.OnboardingWorkflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OnboardingWorkflowRepository extends JpaRepository<OnboardingWorkflow, Long> {
    Optional<OnboardingWorkflow> findByEmployeeId(Long employeeId);
}
