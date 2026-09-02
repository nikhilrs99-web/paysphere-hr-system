package com.hrproject.employeedb.repository;

import com.hrproject.employeedb.model.CompensationStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CompensationStructureRepository extends JpaRepository<CompensationStructure, Long> {
    Optional<CompensationStructure> findByRoleAndRegion(String role, String region);
    List<CompensationStructure> findByRegion(String region);
}
