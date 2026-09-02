package com.hrproject.employeedb.repository;

import com.hrproject.employeedb.model.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByEmployeeId(Long employeeId);
    Optional<AttendanceRecord> findTopByEmployeeIdAndClockOutIsNullOrderByClockInDesc(Long employeeId);
}
