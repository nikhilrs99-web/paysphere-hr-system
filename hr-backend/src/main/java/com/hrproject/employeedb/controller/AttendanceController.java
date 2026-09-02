package com.hrproject.employeedb.controller;

import com.hrproject.employeedb.model.*;
import com.hrproject.employeedb.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/clock-in")
    public ResponseEntity<AttendanceRecord> clockIn(@RequestBody Map<String, Object> payload) {
        Long employeeId = Long.valueOf(payload.get("employeeId").toString());
        String location = (String) payload.getOrDefault("location", "Office");
        return ResponseEntity.ok(attendanceService.clockIn(employeeId, location));
    }

    @PostMapping("/clock-out")
    public ResponseEntity<AttendanceRecord> clockOut(@RequestBody Map<String, Object> payload) {
        Long employeeId = Long.valueOf(payload.get("employeeId").toString());
        return ResponseEntity.ok(attendanceService.clockOut(employeeId));
    }

    @PostMapping("/leave-request")
    public ResponseEntity<LeaveRequest> requestLeave(@RequestBody Map<String, Object> payload) {
        Long employeeId = Long.valueOf(payload.get("employeeId").toString());
        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setStartDate(java.time.LocalDate.parse((String) payload.get("startDate")));
        leaveRequest.setEndDate(java.time.LocalDate.parse((String) payload.get("endDate")));
        leaveRequest.setLeaveType((String) payload.get("leaveType"));
        leaveRequest.setReason((String) payload.get("reason"));
        
        return ResponseEntity.ok(attendanceService.requestLeave(employeeId, leaveRequest));
    }

    @GetMapping("/employee/{employeeId}")
    public List<AttendanceRecord> getAttendance(@PathVariable Long employeeId) {
        return attendanceService.getAttendanceHistory(employeeId);
    }

    @GetMapping("/leave/employee/{employeeId}")
    public List<LeaveRequest> getLeaveRequests(@PathVariable Long employeeId) {
        return attendanceService.getLeaveHistory(employeeId);
    }

    @DeleteMapping("/leave/cancel/{leaveId}")
    public ResponseEntity<Void> cancelLeave(@PathVariable Long leaveId) {
        attendanceService.cancelLeave(leaveId);
        return ResponseEntity.ok().build();
    }
}
