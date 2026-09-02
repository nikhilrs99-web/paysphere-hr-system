package com.hrproject.employeedb.controller;

import com.hrproject.employeedb.model.SuccessionPlan;
import com.hrproject.employeedb.model.TalentProgram;
import com.hrproject.employeedb.service.TalentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/talent")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TalentController {
    private final TalentService talentService;

    @PostMapping("/programs")
    public TalentProgram createProgram(@RequestBody TalentProgram program) {
        return talentService.createProgram(program);
    }

    @GetMapping("/programs")
    public List<TalentProgram> getAllPrograms() {
        return talentService.getAllPrograms();
    }

    @PostMapping("/programs/{id}/enroll/{empId}")
    public TalentProgram enrollEmployee(@PathVariable Long id, @PathVariable Long empId) {
        return talentService.enrollEmployee(id, empId);
    }

    @GetMapping("/programs/employee/{empId}")
    public List<TalentProgram> getEmployeePrograms(@PathVariable Long empId) {
        return talentService.getEmployeePrograms(empId);
    }

    @PostMapping("/succession")
    public SuccessionPlan updateSuccessionPlan(@RequestBody SuccessionPlan plan) {
        return talentService.updateSuccessionPlan(plan);
    }

    @GetMapping("/succession/employee/{empId}")
    public SuccessionPlan getSuccessionPlan(@PathVariable Long empId) {
        return talentService.getEmployeeSuccessionPlan(empId);
    }
}
