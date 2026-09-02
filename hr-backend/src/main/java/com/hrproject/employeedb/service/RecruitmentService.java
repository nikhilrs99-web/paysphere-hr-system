package com.hrproject.employeedb.service;

import com.hrproject.employeedb.model.Candidate;
import com.hrproject.employeedb.model.Interview;
import com.hrproject.employeedb.model.JobPosting;
import com.hrproject.employeedb.model.Scorecard;
import com.hrproject.employeedb.repository.CandidateRepository;
import com.hrproject.employeedb.repository.InterviewRepository;
import com.hrproject.employeedb.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecruitmentService {
    private final JobPostingRepository jobPostingRepository;
    private final CandidateRepository candidateRepository;
    private final InterviewRepository interviewRepository;

    // Job Postings
    public List<JobPosting> getAllJobPostings() {
        return jobPostingRepository.findAll();
    }

    public JobPosting createJobPosting(JobPosting jobPosting) {
        return jobPostingRepository.save(jobPosting);
    }

    // Candidates
    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    public List<Candidate> getCandidatesByJob(Long jobId) {
        return candidateRepository.findByJobPostingId(jobId);
    }

    public Candidate createCandidate(Candidate candidate) {
        return candidateRepository.save(candidate);
    }

    public Candidate updateCandidateStatus(Long candidateId, Candidate.CandidateStatus status) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        candidate.setStatus(status);
        return candidateRepository.save(candidate);
    }

    // Interviews
    public Interview scheduleInterview(Interview interview) {
        return interviewRepository.save(interview);
    }

    public List<Interview> getAllInterviews() {
        return interviewRepository.findAll();
    }

    public List<Interview> getInterviewsByCandidate(Long candidateId) {
        return interviewRepository.findByCandidateId(candidateId);
    }

    public Interview updateInterviewFeedback(Long interviewId, String feedback, Integer rating) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));
        interview.setFeedback(feedback);
        interview.setRating(rating);
        interview.setStatus(Interview.InterviewStatus.COMPLETED);
        return interviewRepository.save(interview);
    }

    public Interview submitScorecard(Long interviewId, Scorecard scorecard) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));
        
        scorecard.setOverallScore((scorecard.getTechnicalRating() + 
                                  scorecard.getCulturalRating() + 
                                  scorecard.getCommunicationRating()) / 3.0);
        
        interview.setScorecard(scorecard);
        interview.setStatus(Interview.InterviewStatus.COMPLETED);
        return interviewRepository.save(interview);
    }
}
