package com.hrproject.employeedb.repository;

import com.hrproject.employeedb.model.SuccessionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SuccessionPlanRepository extends JpaRepository<SuccessionPlan, Long> {
    Optional<SuccessionPlan> findByEmployeeId(Long employeeId);
}
