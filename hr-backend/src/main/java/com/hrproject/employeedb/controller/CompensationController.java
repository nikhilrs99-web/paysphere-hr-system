package com.hrproject.employeedb.controller;

import com.hrproject.employeedb.model.BonusRecord;
import com.hrproject.employeedb.model.CompensationStructure;
import com.hrproject.employeedb.service.CompensationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/compensation")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CompensationController {
    private final CompensationService compensationService;

    @PostMapping("/structures")
    public CompensationStructure saveStructure(@RequestBody CompensationStructure structure) {
        return compensationService.saveStructure(structure);
    }

    @GetMapping("/structures")
    public List<CompensationStructure> getAllStructures() {
        return compensationService.getAllStructures();
    }

    @PostMapping("/bonuses")
    public BonusRecord allocateBonus(@RequestBody BonusRecord bonus) {
        return compensationService.allocateBonus(bonus);
    }

    @GetMapping("/bonuses/employee/{employeeId}")
    public List<BonusRecord> getEmployeeBonuses(@PathVariable Long employeeId) {
        return compensationService.getEmployeeBonuses(employeeId);
    }

    @GetMapping("/bonuses/pending")
    public List<BonusRecord> getPendingBonuses() {
        return compensationService.getPendingBonuses();
    }
}
