package com.hrproject.employeedb.controller;

import com.hrproject.employeedb.model.BenefitPackage;
import com.hrproject.employeedb.model.EmployeeBenefit;
import com.hrproject.employeedb.service.BenefitService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/benefits")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BenefitController {
    private final BenefitService benefitService;

    @PostMapping("/packages")
    public BenefitPackage createPackage(@RequestBody BenefitPackage benefitPackage) {
        return benefitService.createPackage(benefitPackage);
    }

    @GetMapping("/packages")
    public List<BenefitPackage> getAllPackages() {
        return benefitService.getAllPackages();
    }

    @GetMapping("/packages/region/{region}")
    public List<BenefitPackage> getPackagesByRegion(@PathVariable String region) {
        return benefitService.getPackagesByRegion(region);
    }

    @PostMapping("/enroll")
    public EmployeeBenefit enrollEmployee(@RequestBody EmployeeBenefit enrollment) {
        return benefitService.enrollEmployee(enrollment);
    }

    @GetMapping("/employee/{employeeId}")
    public List<EmployeeBenefit> getEmployeeBenefits(@PathVariable Long employeeId) {
        return benefitService.getEmployeeBenefits(employeeId);
    }
}
