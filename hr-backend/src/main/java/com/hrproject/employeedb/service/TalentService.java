package com.hrproject.employeedb.service;

import com.hrproject.employeedb.model.Employee;
import com.hrproject.employeedb.model.SuccessionPlan;
import com.hrproject.employeedb.model.TalentProgram;
import com.hrproject.employeedb.repository.EmployeeRepository;
import com.hrproject.employeedb.repository.SuccessionPlanRepository;
import com.hrproject.employeedb.repository.TalentProgramRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TalentService {
    private final TalentProgramRepository programRepository;
    private final SuccessionPlanRepository successionRepository;
    private final EmployeeRepository employeeRepository;

    @PostConstruct
    public void seedPrograms() {
        if (programRepository.count() == 0) {
            TalentProgram p1 = new TalentProgram();
            p1.setName("Leadership Excellence");
            p1.setDescription("Advanced management skills for future leaders.");
            p1.setTargetRole("Manager");
            p1.setEnrollees(new ArrayList<>());
            programRepository.save(p1);

            TalentProgram p2 = new TalentProgram();
            p2.setName("Full-Stack Mastery");
            p2.setDescription("Intensive training on Spring Boot and React.");
            p2.setTargetRole("Engineer");
            p2.setEnrollees(new ArrayList<>());
            programRepository.save(p2);
        }
    }

    public TalentProgram createProgram(TalentProgram program) {
        return programRepository.save(program);
    }

    public List<TalentProgram> getAllPrograms() {
        return programRepository.findAll();
    }

    public TalentProgram enrollEmployee(Long programId, Long employeeId) {
        TalentProgram program = programRepository.findById(programId).orElseThrow();
        Employee employee = employeeRepository.findById(employeeId).orElseThrow();
        if (!program.getEnrollees().contains(employee)) {
            program.getEnrollees().add(employee);
        }
        return programRepository.save(program);
    }

    public List<TalentProgram> getEmployeePrograms(Long employeeId) {
        // Simple search (for production this would be better with JPQL)
        return programRepository.findAll().stream()
                .filter(p -> p.getEnrollees().stream().anyMatch(e -> e.getId().equals(employeeId)))
                .toList();
    }

    public SuccessionPlan updateSuccessionPlan(SuccessionPlan plan) {
        return successionRepository.save(plan);
    }

    public SuccessionPlan getEmployeeSuccessionPlan(Long employeeId) {
        return successionRepository.findByEmployeeId(employeeId).orElse(null);
    }
}
