package com.hrproject.employeedb.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.hrproject.employeedb.model.Employee;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmail(String email);

    @Query("SELECT e FROM Employee e WHERE " +
           "(LOWER(e.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(e.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(e.email) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:department IS NULL OR e.department = :department) AND " +
           "(:status IS NULL OR e.status = :status)")
    Page<Employee> searchEmployees(@Param("query") String query, 
                                   @Param("department") String department, 
                                   @Param("status") String status, 
                                   Pageable pageable);
}
