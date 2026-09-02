package com.hrproject.employeedb.controller;

import com.hrproject.employeedb.model.OnboardingStep;
import com.hrproject.employeedb.model.OnboardingWorkflow;
import com.hrproject.employeedb.service.OnboardingService;
import com.hrproject.employeedb.service.EmployeeService;
import com.hrproject.employeedb.model.Employee;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/onboarding")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OnboardingController {
    private final OnboardingService onboardingService;
    private final EmployeeService employeeService;

    @PostMapping("/initiate/{employeeId}")
    public OnboardingWorkflow initiate(@PathVariable Long employeeId) {
        Employee employee = employeeService.getEmployeeById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        return onboardingService.initiateOnboarding(employee);
    }

    @GetMapping("/employee/{employeeId}")
    public OnboardingWorkflow getWorkflow(@PathVariable Long employeeId) {
        return onboardingService.getWorkflowByEmployee(employeeId);
    }

    @PatchMapping("/steps/{stepId}/complete")
    public OnboardingStep completeStep(@PathVariable Long stepId) {
        return onboardingService.completeStep(stepId);
    }
}
