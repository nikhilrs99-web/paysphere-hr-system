package com.hrproject.employeedb.repository;

import com.hrproject.employeedb.model.TaxConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TaxConfigRepository extends JpaRepository<TaxConfig, Long> {
    Optional<TaxConfig> findByCountryCode(String countryCode);
}
