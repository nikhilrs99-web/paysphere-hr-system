package com.hrproject.employeedb.service;

import com.hrproject.employeedb.model.*;
import com.hrproject.employeedb.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class PayrollService {

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private TaxConfigRepository taxConfigRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeBenefitRepository employeeBenefitRepository;

    @Autowired
    private BonusRecordRepository bonusRepository;

    public PayrollRecord processPayroll(Long employeeId, LocalDate startDate, LocalDate endDate) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        TaxConfig taxConfig = taxConfigRepository.findByCountryCode(employee.getCountry())
                .orElseGet(() -> {
                    // Default tax config if country not found
                    return new TaxConfig(null, "DEFAULT", 15.0, 5.0, 2.0);
                });

        Double grossSalary = employee.getBaseSalary();
        
        // Calculate Benefit Deductions (Employee's share)
        List<EmployeeBenefit> enrolledBenefits = employeeBenefitRepository.findByEmployeeId(employeeId);
        Double totalBenefitDeductions = enrolledBenefits.stream()
                .filter(b -> b.getStatus().equals("ACTIVE"))
                .mapToDouble(b -> b.getBenefitPackage().getMonthlyCost() * (1 - (b.getBenefitPackage().getEmployerContribution() / 100)))
                .sum();

        // Calculate Bonuses to be paid in this period
        List<BonusRecord> pendingBonuses = bonusRepository.findByEmployeeId(employeeId).stream()
                .filter(b -> b.getStatus().equals("PENDING"))
                .peek(b -> b.setStatus("PROCESSED")) // Mark as processed for payment
                .toList();

        Double totalBonuses = pendingBonuses.stream().mapToDouble(BonusRecord::getAmount).sum();
        bonusRepository.saveAll(pendingBonuses);

        Double taxableAmount = grossSalary + totalBonuses;
        Double taxAmount = (taxableAmount * taxConfig.getIncomeTaxRate()) / 100;
        Double socialSecurity = (grossSalary * taxConfig.getSocialSecurityRate()) / 100;
        Double healthInsurance = (grossSalary * taxConfig.getHealthInsuranceRate()) / 100;
        
        Double totalDeductions = taxAmount + socialSecurity + healthInsurance + totalBenefitDeductions;
        Double netSalary = (grossSalary + totalBonuses) - totalDeductions;

        PayrollRecord record = new PayrollRecord();
        record.setEmployee(employee);
        record.setPayPeriodStart(startDate);
        record.setPayPeriodEnd(endDate);
        record.setGrossSalary(grossSalary + totalBonuses);
        record.setTaxAmount(taxAmount);
        record.setBenefitsAmount(socialSecurity + healthInsurance + totalBenefitDeductions);
        record.setNetSalary(netSalary);
        record.setCurrency(employee.getCurrency());
        record.setStatus("PAID");
        record.setPaymentReference("PAY-" + System.currentTimeMillis());

        // Mock integration with accounting systems (Log to console)
        System.out.println("Integrating with Accounting System (SAP/QuickBooks): " + record.getPaymentReference());

        return payrollRepository.save(record);
    }

    public List<PayrollRecord> getPayrollHistory(Long employeeId) {
        return payrollRepository.findByEmployeeId(employeeId);
    }
    
    public List<PayrollRecord> getAllPayrollRecords() {
        return payrollRepository.findAll();
    }
}
