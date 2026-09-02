package com.hrproject.employeedb.service;

import com.hrproject.employeedb.model.*;
import com.hrproject.employeedb.repository.OnboardingStepRepository;
import com.hrproject.employeedb.repository.OnboardingWorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OnboardingService {
    private final OnboardingWorkflowRepository workflowRepository;
    private final OnboardingStepRepository stepRepository;

    public OnboardingWorkflow initiateOnboarding(Employee employee) {
        // Check if workflow already exists
        return workflowRepository.findByEmployeeId(employee.getId())
                .map(existing -> {
                    // If steps are empty, generate them (recovery)
                    if (existing.getSteps() == null || existing.getSteps().isEmpty()) {
                        existing.setSteps(generateStepsForCountry(existing, employee.getCountry()));
                        return workflowRepository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> {
                    OnboardingWorkflow workflow = new OnboardingWorkflow();
                    workflow.setEmployee(employee);
                    workflow.setCountry(employee.getCountry());
                    workflow.setStatus(OnboardingWorkflow.WorkflowStatus.IN_PROGRESS);
                    
                    final OnboardingWorkflow savedWorkflow = workflowRepository.save(workflow);
                    List<OnboardingStep> steps = generateStepsForCountry(savedWorkflow, employee.getCountry());
                    savedWorkflow.setSteps(steps);
                    
                    return workflowRepository.save(savedWorkflow);
                });
    }

    private List<OnboardingStep> generateStepsForCountry(OnboardingWorkflow workflow, String country) {
        List<OnboardingStep> steps = new ArrayList<>();
        
        // General steps
        steps.add(createStep(workflow, "Contract Signing", OnboardingStep.StepType.CONTRACT, 3));
        steps.add(createStep(workflow, "Document Upload (ID, Proof of Address)", OnboardingStep.StepType.DOCUMENT, 5));
        
        // Country specific compliance
        if ("USA".equalsIgnoreCase(country)) {
            steps.add(createStep(workflow, "Form I-9 Verification", OnboardingStep.StepType.COMPLIANCE, 3));
            steps.add(createStep(workflow, "W-4 Tax Withholding", OnboardingStep.StepType.COMPLIANCE, 7));
        } else if ("India".equalsIgnoreCase(country)) {
            steps.add(createStep(workflow, "PF (Provident Fund) Enrollment", OnboardingStep.StepType.COMPLIANCE, 7));
            steps.add(createStep(workflow, "Aadhar Verification", OnboardingStep.StepType.COMPLIANCE, 3));
        } else {
            steps.add(createStep(workflow, "Local Compliance Review", OnboardingStep.StepType.COMPLIANCE, 10));
        }
        
        steps.add(createStep(workflow, "General Compliance Training", OnboardingStep.StepType.TRAINING, 14));
        
        return steps;
    }

    private OnboardingStep createStep(OnboardingWorkflow workflow, String title, OnboardingStep.StepType type, int daysFromNow) {
        OnboardingStep step = new OnboardingStep();
        step.setWorkflow(workflow);
        step.setTitle(title);
        step.setType(type);
        step.setDueDate(LocalDate.now().plusDays(daysFromNow));
        step.setStatus(OnboardingStep.StepStatus.PENDING);
        return stepRepository.save(step);
    }

    public OnboardingWorkflow getWorkflowByEmployee(Long employeeId) {
        return workflowRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new RuntimeException("Workflow not found for employee"));
    }

    public OnboardingStep completeStep(Long stepId) {
        OnboardingStep step = stepRepository.findById(stepId)
                .orElseThrow(() -> new RuntimeException("Step not found"));
        step.setStatus(OnboardingStep.StepStatus.COMPLETED);
        return stepRepository.save(step);
    }
}
