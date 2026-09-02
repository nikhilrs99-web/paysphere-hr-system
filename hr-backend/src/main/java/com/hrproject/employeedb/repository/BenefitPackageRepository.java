package com.hrproject.employeedb.repository;

import com.hrproject.employeedb.model.BenefitPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BenefitPackageRepository extends JpaRepository<BenefitPackage, Long> {
    List<BenefitPackage> findByRegionAndContractType(String region, String contractType);
    List<BenefitPackage> findByRegion(String region);
}
