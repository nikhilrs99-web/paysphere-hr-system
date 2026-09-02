package com.hrproject.employeedb.service;

import com.hrproject.employeedb.model.BenefitPackage;
import com.hrproject.employeedb.model.EmployeeBenefit;
import com.hrproject.employeedb.repository.BenefitPackageRepository;
import com.hrproject.employeedb.repository.EmployeeBenefitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BenefitService {
    private final BenefitPackageRepository packageRepository;
    private final EmployeeBenefitRepository employeeBenefitRepository;

    @PostConstruct
    public void seedBenefits() {
        if (packageRepository.count() == 0) {
            BenefitPackage p1 = new BenefitPackage();
            p1.setName("Premium Health Guard");
            p1.setType("HEALTHCARE");
            p1.setDescription("Complete medical coverage including dental and vision.");
            p1.setProvider("Global Health Co.");
            p1.setMonthlyCost(400.0);
            p1.setEmployerContribution(75.0);
            p1.setRegion("GLOBAL");
            p1.setContractType("FULL_TIME");
            packageRepository.save(p1);

            BenefitPackage p2 = new BenefitPackage();
            p2.setName("Secure Future 401k");
            p2.setType("RETIREMENT");
            p2.setDescription("Retirement savings plan with employer matching.");
            p2.setProvider("Future Wealth Inc.");
            p2.setMonthlyCost(500.0);
            p2.setEmployerContribution(100.0);
            p2.setRegion("GLOBAL");
            p2.setContractType("FULL_TIME");
            packageRepository.save(p2);
        }
    }

    public BenefitPackage createPackage(BenefitPackage benefitPackage) {
        return packageRepository.save(benefitPackage);
    }

    public List<BenefitPackage> getAllPackages() {
        return packageRepository.findAll();
    }

    public List<BenefitPackage> getPackagesByRegion(String region) {
        return packageRepository.findByRegion(region);
    }

    public EmployeeBenefit enrollEmployee(EmployeeBenefit enrollment) {
        if (enrollment.getEnrollmentDate() == null) {
            enrollment.setEnrollmentDate(LocalDate.now());
        }
        if (enrollment.getStatus() == null) {
            enrollment.setStatus("ACTIVE");
        }
        return employeeBenefitRepository.save(enrollment);
    }

    public List<EmployeeBenefit> getEmployeeBenefits(Long employeeId) {
        return employeeBenefitRepository.findByEmployeeId(employeeId);
    }
}
