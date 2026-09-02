package com.hrproject.employeedb.service;

import com.hrproject.employeedb.model.BonusRecord;
import com.hrproject.employeedb.model.CompensationStructure;
import com.hrproject.employeedb.repository.BonusRecordRepository;
import com.hrproject.employeedb.repository.CompensationStructureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompensationService {
    private final CompensationStructureRepository structureRepository;
    private final BonusRecordRepository bonusRepository;

    @PostConstruct
    public void seedStructures() {
        if (structureRepository.count() == 0) {
            CompensationStructure s1 = new CompensationStructure();
            s1.setRole("Senior Software Engineer");
            s1.setRegion("US");
            s1.setMinSalary(120000.0);
            s1.setMaxSalary(180000.0);
            s1.setCurrency("USD");
            s1.setPayFrequency("SALARIED");
            structureRepository.save(s1);

            CompensationStructure s2 = new CompensationStructure();
            s2.setRole("HR Manager");
            s2.setRegion("EU");
            s2.setMinSalary(60000.0);
            s2.setMaxSalary(90000.0);
            s2.setCurrency("EUR");
            s2.setPayFrequency("SALARIED");
            structureRepository.save(s2);
        }
    }

    public CompensationStructure saveStructure(CompensationStructure structure) {
        return structureRepository.save(structure);
    }

    public List<CompensationStructure> getAllStructures() {
        return structureRepository.findAll();
    }

    public BonusRecord allocateBonus(BonusRecord bonus) {
        if (bonus.getAllocationDate() == null) {
            bonus.setAllocationDate(LocalDate.now());
        }
        if (bonus.getStatus() == null) {
            bonus.setStatus("PENDING");
        }
        return bonusRepository.save(bonus);
    }

    public List<BonusRecord> getEmployeeBonuses(Long employeeId) {
        return bonusRepository.findByEmployeeId(employeeId);
    }

    public List<BonusRecord> getPendingBonuses() {
        return bonusRepository.findByStatus("PENDING");
    }
}
