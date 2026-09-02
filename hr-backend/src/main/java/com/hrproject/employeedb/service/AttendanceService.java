package com.hrproject.employeedb.service;

import com.hrproject.employeedb.model.*;
import com.hrproject.employeedb.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public AttendanceRecord clockIn(Long employeeId, String location) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        AttendanceRecord record = new AttendanceRecord();
        record.setEmployee(employee);
        record.setClockIn(LocalDateTime.now());
        record.setLocation(location);
        record.setStatus("ON_TIMING");
        return attendanceRepository.save(record);
    }

    public AttendanceRecord clockOut(Long employeeId) {
        AttendanceRecord record = attendanceRepository
                .findTopByEmployeeIdAndClockOutIsNullOrderByClockInDesc(employeeId)
                .orElseThrow(() -> new RuntimeException("No active clock-in found"));

        record.setClockOut(LocalDateTime.now());

        Duration duration = Duration.between(record.getClockIn(), record.getClockOut());
        double hours = duration.toMinutes() / 60.0;
        record.setTotalHours(hours);

        if (hours > 8.0) {
            record.setOvertimeHours(hours - 8.0);
            record.setStatus("OVERTIME");
        } else {
            record.setOvertimeHours(0.0);
        }

        return attendanceRepository.save(record);
    }

    public LeaveRequest requestLeave(Long employeeId, LeaveRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        request.setEmployee(employee);
        request.setStatus("PENDING");
        request.setRequestDate(java.time.LocalDate.now());
        return leaveRequestRepository.save(request);
    }

    public LeaveRequest updateLeaveStatus(Long leaveId, String status) {
        LeaveRequest request = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        request.setStatus(status);
        return leaveRequestRepository.save(request);
    }

    public List<AttendanceRecord> getAttendanceHistory(Long employeeId) {
        return attendanceRepository.findByEmployeeId(employeeId);
    }

    public List<LeaveRequest> getLeaveHistory(Long employeeId) {
        return leaveRequestRepository.findByEmployeeId(employeeId);
    }

    public void cancelLeave(Long leaveId) {
        LeaveRequest request = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        if ("PENDING".equals(request.getStatus())) {
            leaveRequestRepository.delete(request);
        } else {
            throw new RuntimeException("Only pending leave requests can be canceled");
        }
    }
}
