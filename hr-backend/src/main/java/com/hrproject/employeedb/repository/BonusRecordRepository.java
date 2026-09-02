package com.hrproject.employeedb.repository;

import com.hrproject.employeedb.model.BonusRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BonusRecordRepository extends JpaRepository<BonusRecord, Long> {
    List<BonusRecord> findByEmployeeId(Long employeeId);
    List<BonusRecord> findByStatus(String status);
}
