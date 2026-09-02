package com.hrproject.employeedb.controller;

import com.hrproject.employeedb.model.PayrollRecord;
import com.hrproject.employeedb.service.PayrollService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin(origins = "*")
public class PayrollController {

    @Autowired
    private PayrollService payrollService;

    @PostMapping("/process")
    public ResponseEntity<PayrollRecord> processPayroll(@RequestBody Map<String, Object> payload) {
        Long employeeId = Long.valueOf(payload.get("employeeId").toString());
        LocalDate startDate = LocalDate.parse(payload.get("startDate").toString());
        LocalDate endDate = LocalDate.parse(payload.get("endDate").toString());
        
        return ResponseEntity.ok(payrollService.processPayroll(employeeId, startDate, endDate));
    }

    @GetMapping("/employee/{employeeId}")
    public List<PayrollRecord> getEmployeePayroll(@PathVariable Long employeeId) {
        return payrollService.getPayrollHistory(employeeId);
    }

    @GetMapping("/all")
    public List<PayrollRecord> getAllPayroll() {
        return payrollService.getAllPayrollRecords();
    }
}
