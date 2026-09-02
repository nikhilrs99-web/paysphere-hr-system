package com.hrproject.employeedb.controller;

import com.hrproject.employeedb.model.Candidate;
import com.hrproject.employeedb.model.Interview;
import com.hrproject.employeedb.model.JobPosting;
import com.hrproject.employeedb.model.Scorecard;
import com.hrproject.employeedb.service.RecruitmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/recruitment")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RecruitmentController {
    private final RecruitmentService recruitmentService;

    @GetMapping("/jobs")
    public List<JobPosting> getAllJobs() {
        return recruitmentService.getAllJobPostings();
    }

    @PostMapping("/jobs")
    public JobPosting createJob(@RequestBody JobPosting job) {
        return recruitmentService.createJobPosting(job);
    }

    @GetMapping("/candidates")
    public List<Candidate> getAllCandidates() {
        return recruitmentService.getAllCandidates();
    }

    @GetMapping("/jobs/{jobId}/candidates")
    public List<Candidate> getCandidatesByJob(@PathVariable Long jobId) {
        return recruitmentService.getCandidatesByJob(jobId);
    }

    @PostMapping("/candidates")
    public Candidate createCandidate(@RequestBody Candidate candidate) {
        return recruitmentService.createCandidate(candidate);
    }

    @PatchMapping("/candidates/{id}/status")
    public Candidate updateStatus(@PathVariable Long id, @RequestParam Candidate.CandidateStatus status) {
        return recruitmentService.updateCandidateStatus(id, status);
    }

    @PostMapping("/interviews")
    public Interview scheduleInterview(@RequestBody Interview interview) {
        return recruitmentService.scheduleInterview(interview);
    }

    @GetMapping("/candidates/{candidateId}/interviews")
    public List<Interview> getInterviews(@PathVariable Long candidateId) {
        return recruitmentService.getInterviewsByCandidate(candidateId);
    }

    @GetMapping("/interviews")
    public List<Interview> getAllInterviews() {
        return recruitmentService.getAllInterviews();
    }

    @PatchMapping("/interviews/{id}/feedback")
    public Interview updateFeedback(@PathVariable Long id, @RequestParam String feedback,
            @RequestParam Integer rating) {
        return recruitmentService.updateInterviewFeedback(id, feedback, rating);
    }

    @PostMapping("/interviews/{id}/scorecard")
    public Interview submitScorecard(@PathVariable Long id, @RequestBody Scorecard scorecard) {
        return recruitmentService.submitScorecard(id, scorecard);
    }
}
