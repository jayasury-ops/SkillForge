const path = require('node:path');
const fs = require('node:fs');
const { sharedAgentBus } = require('../agents/AgentBus');
const { SkillProfilerAgent } = require('../agents/SkillProfilerAgent');
const { CareerMatcherAgent } = require('../agents/CareerMatcherAgent');
const { CurriculumArchitectAgent } = require('../agents/CurriculumArchitectAgent');
const { AssessmentEvaluatorAgent } = require('../agents/AssessmentEvaluatorAgent');
const { AdaptiveMentorAgent } = require('../agents/AdaptiveMentorAgent');
const { CAREER_TAXONOMY } = require('../config/careerTaxonomy');

/**
 * OrchestratorService
 * Master Orchestrator coordinating the Multi-Agent System (MAS),
 * state persistence, and inter-agent workflows.
 */
class OrchestratorService {
  constructor() {
    this.bus = sharedAgentBus;
    this.storePath = path.join(__dirname, '../data/learnersStore.json');

    // Instantiate Agents
    this.profilerAgent = new SkillProfilerAgent(this.bus);
    this.matcherAgent = new CareerMatcherAgent(this.bus);
    this.architectAgent = new CurriculumArchitectAgent(this.bus);
    this.evaluatorAgent = new AssessmentEvaluatorAgent(this.bus);
    this.mentorAgent = new AdaptiveMentorAgent(this.bus);

    this.activeRoadmaps = new Map();
    this.activeGapReports = new Map();
  }

  loadStore() {
    try {
      const raw = fs.readFileSync(this.storePath, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      return { learners: [] };
    }
  }

  saveStore(data) {
    try {
      fs.writeFileSync(this.storePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to save store:', e);
    }
  }

  getLearner(id = 'learner-001') {
    const store = this.loadStore();
    return store.learners.find(l => l.id === id) || store.learners[0];
  }

  getAllCareers() {
    return Object.values(CAREER_TAXONOMY);
  }

  /**
   * Run full multi-agent collaborative synthesis for a learner
   */
  async runMultiAgentPipeline(learnerId = 'learner-001', overrideCareerId = null) {
    const learner = this.getLearner(learnerId);
    if (!learner) throw new Error(`Learner ${learnerId} not found`);

    const targetCareer = overrideCareerId || learner.targetCareerId || 'fullstack-developer';

    this.bus.logDeliberation(
      'OrchestratorService',
      'PIPELINE_INITIATION',
      `Triggering end-to-end Multi-Agent collaborative workflow for ${learner.name} -> Target: ${targetCareer}.`,
      { learnerId, targetCareer }
    );

    // Agent 1: Skill Profiler Agent
    const audit = await this.profilerAgent.auditLearner(learner);

    // Agent 2: Career Matcher Agent
    const gapReport = await this.matcherAgent.matchCareer(learner, targetCareer);
    this.activeGapReports.set(learner.id, gapReport);

    // Agent 3: Curriculum Architect Agent (with existing active remediations)
    const activeRemediations = learner.progress?.activeRemediations || [];
    const roadmap = await this.architectAgent.buildRoadmap(learner, gapReport, activeRemediations);
    this.activeRoadmaps.set(learner.id, roadmap);

    // Update Learner state with synthesized metrics
    const store = this.loadStore();
    const idx = store.learners.findIndex(l => l.id === learner.id);
    if (idx !== -1) {
      store.learners[idx].targetCareerId = targetCareer;
      store.learners[idx].targetCareerTitle = gapReport.targetCareerTitle;
      store.learners[idx].progress.overallReadinessScore = gapReport.readinessScore;
      this.saveStore(store);
    }

    return {
      learner: this.getLearner(learnerId),
      audit,
      gapReport,
      roadmap,
      deliberations: this.bus.getRecentDeliberations(15)
    };
  }

  /**
   * Update learner profile details (skills, certifications, projects, bio)
   */
  async updateProfile(learnerId, updatedData) {
    const store = this.loadStore();
    const idx = store.learners.findIndex(l => l.id === learnerId);
    if (idx === -1) throw new Error('Learner not found');

    const learner = store.learners[idx];

    if (updatedData.name) learner.name = updatedData.name;
    if (updatedData.bio !== undefined) learner.bio = updatedData.bio;
    if (updatedData.institution !== undefined) learner.institution = updatedData.institution;
    if (Array.isArray(updatedData.existingSkills)) learner.existingSkills = updatedData.existingSkills;
    if (Array.isArray(updatedData.certifications)) learner.certifications = updatedData.certifications;
    if (Array.isArray(updatedData.projects)) learner.projects = updatedData.projects;

    this.saveStore(store);

    this.bus.logDeliberation(
      'OrchestratorService',
      'PROFILE_UPDATED',
      `Learner profile updated for ${learner.name}. Re-executing multi-agent assessment.`,
      { learnerId }
    );

    return this.runMultiAgentPipeline(learnerId, learner.targetCareerId);
  }

  /**
   * Pivot Career Goal
   */
  async changeCareerGoal(learnerId, newCareerId) {
    const store = this.loadStore();
    const idx = store.learners.findIndex(l => l.id === learnerId);
    if (idx === -1) throw new Error('Learner not found');

    const learner = store.learners[idx];
    const oldCareer = learner.targetCareerTitle;
    const careerInfo = CAREER_TAXONOMY[newCareerId] || CAREER_TAXONOMY['fullstack-developer'];

    learner.targetCareerId = newCareerId;
    learner.targetCareerTitle = careerInfo.title;
    this.saveStore(store);

    await this.mentorAgent.handleGoalChange({
      learner,
      oldGoal: oldCareer,
      newGoal: careerInfo.title
    });

    return this.runMultiAgentPipeline(learnerId, newCareerId);
  }

  /**
   * Submit an assessment and process adaptive remediation
   */
  async submitAssessment(learnerId, skillName, userAnswers) {
    const store = this.loadStore();
    const idx = store.learners.findIndex(l => l.id === learnerId);
    if (idx === -1) throw new Error('Learner not found');

    const learner = store.learners[idx];

    // Evaluate submission via AssessmentEvaluatorAgent
    const evaluation = await this.evaluatorAgent.evaluateSubmission(learner, skillName, userAnswers);

    // Record in history
    if (!learner.progress.assessmentHistory) {
      learner.progress.assessmentHistory = [];
    }
    learner.progress.assessmentHistory.unshift({
      id: evaluation.assessmentId,
      skillName,
      scorePercent: evaluation.scorePercent,
      passed: evaluation.passed,
      date: new Date().toISOString()
    });

    // Check if adaptive remediation is triggered
    if (!evaluation.passed) {
      const remediations = await this.mentorAgent.handleAssessmentDeficit({
        learner,
        skillName,
        scorePercent: evaluation.scorePercent,
        weaknesses: evaluation.identifiedWeaknesses
      });

      // Merge new remediations
      if (!learner.progress.activeRemediations) {
        learner.progress.activeRemediations = [];
      }
      for (const rem of remediations) {
        if (!learner.progress.activeRemediations.some(r => r.topic === rem.topic)) {
          learner.progress.activeRemediations.push(rem);
        }
      }
    } else {
      // If passed, remove any active remediations for this skill
      if (learner.progress.activeRemediations) {
        learner.progress.activeRemediations = learner.progress.activeRemediations.filter(
          r => r.skill.toLowerCase() !== skillName.toLowerCase()
        );
      }
      // Boost skill proficiency in learner's verified skills
      const existingSkill = learner.existingSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
      if (existingSkill) {
        existingSkill.level = Math.min(5, (Number(existingSkill.level) || 2) + 1);
        existingSkill.verified = true;
      } else {
        learner.existingSkills.push({
          name: skillName,
          level: 3,
          category: 'Assessed Competency',
          verified: true
        });
      }
    }

    this.saveStore(store);

    // Re-run pipeline to incorporate adaptive roadmap changes
    const pipelineResult = await this.runMultiAgentPipeline(learnerId, learner.targetCareerId);

    return {
      evaluation,
      pipelineResult
    };
  }

  /**
   * Toggle a milestone completed / pending
   */
  async toggleMilestone(learnerId, milestoneId) {
    const store = this.loadStore();
    const idx = store.learners.findIndex(l => l.id === learnerId);
    if (idx === -1) throw new Error('Learner not found');

    const learner = store.learners[idx];
    if (!learner.progress.completedMilestones) {
      learner.progress.completedMilestones = [];
    }

    const mIdx = learner.progress.completedMilestones.indexOf(milestoneId);
    let isNowCompleted = false;
    if (mIdx === -1) {
      learner.progress.completedMilestones.push(milestoneId);
      learner.progress.hoursInvested = (learner.progress.hoursInvested || 0) + 10;
      isNowCompleted = true;
    } else {
      learner.progress.completedMilestones.splice(mIdx, 1);
      learner.progress.hoursInvested = Math.max(0, (learner.progress.hoursInvested || 10) - 10);
    }

    this.saveStore(store);

    this.bus.logDeliberation(
      'OrchestratorService',
      'PROGRESS_TRACKED',
      `Milestone '${milestoneId}' marked as ${isNowCompleted ? 'COMPLETED' : 'PENDING'} for ${learner.name}. Updated investment: ${learner.progress.hoursInvested} hours.`,
      { milestoneId, isNowCompleted }
    );

    return this.runMultiAgentPipeline(learnerId, learner.targetCareerId);
  }

  /**
   * Interactive Mentor Chat
   */
  async chatWithMentor(learnerId, userQuery) {
    const learner = this.getLearner(learnerId);
    const gapReport = this.activeGapReports.get(learnerId) || await this.matcherAgent.matchCareer(learner, learner.targetCareerId);
    const roadmap = this.activeRoadmaps.get(learnerId) || await this.architectAgent.buildRoadmap(learner, gapReport, learner.progress?.activeRemediations);

    const advice = await this.mentorAgent.generateMentoringResponse(learner, gapReport, roadmap, userQuery);
    return {
      advice,
      deliberations: this.bus.getRecentDeliberations(10)
    };
  }

  /**
   * Get Assessment questions for a given skill
   */
  getAssessmentQuestions(skillName) {
    return this.evaluatorAgent.getAssessmentForSkill(skillName);
  }

  getDeliberations() {
    return this.bus.getRecentDeliberations(30);
  }
}

module.exports = {
  OrchestratorService
};
