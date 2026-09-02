package com.hrproject.employeedb.repository;

import com.hrproject.employeedb.model.EmployeeBenefit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmployeeBenefitRepository extends JpaRepository<EmployeeBenefit, Long> {
    List<EmployeeBenefit> findByEmployeeId(Long employeeId);
    List<EmployeeBenefit> findByStatus(String status);
}
