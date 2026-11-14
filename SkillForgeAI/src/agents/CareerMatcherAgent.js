const { sharedAgentBus } = require('./AgentBus');
const { CAREER_TAXONOMY } = require('../config/careerTaxonomy');

/**
 * CareerMatcherAgent
 * Role: Career Gap Analysis & Readiness Evaluation Engine
 * Maps a learner's audited competencies against target job benchmarks.
 * Identifies critical skill chasms, computes readiness indexes, and publishes gap reports.
 */
class CareerMatcherAgent {
  constructor(bus = sharedAgentBus) {
    this.name = 'CareerMatcherAgent';
    this.bus = bus;
  }

  /**
   * Perform comprehensive gap analysis against a designated career target
   * @param {object} learner - Learner profile record
   * @param {string} targetCareerId - Target career identifier (e.g., 'fullstack-developer')
   */
  async matchCareer(learner, targetCareerId) {
    const career = CAREER_TAXONOMY[targetCareerId] || CAREER_TAXONOMY['fullstack-developer'];

    this.bus.logDeliberation(
      this.name,
      'CAREER_ALIGNMENT_START',
      `Aligning ${learner.name}'s profile against target role: '${career.title}' (${career.domain}). Comparing ${career.requiredSkills.length} benchmark requirements.`,
      { targetCareerId: career.id, learnerId: learner.id }
    );

    const masteredSkills = [];
    const missingCriticalSkills = [];
    const missingSecondarySkills = [];
    const partiallyMatchedSkills = [];

    let totalWeight = 0;
    let earnedWeight = 0;

    // Map existing learner skills by lowercase name for fuzzy/clean matching
    const learnerSkillMap = new Map();
    for (const s of learner.existingSkills) {
      learnerSkillMap.set(s.name.toLowerCase().trim(), Number(s.level) || 1);
    }

    for (const req of career.requiredSkills) {
      totalWeight += req.weight;
      const reqNameLower = req.name.toLowerCase();

      // Check for exact or substring match
      let userLevel = 0;
      for (const [key, level] of learnerSkillMap.entries()) {
        if (key === reqNameLower || key.includes(reqNameLower) || reqNameLower.includes(key)) {
          userLevel = Math.max(userLevel, level);
        }
      }

      if (userLevel >= req.level) {
        // Mastered or exceeds benchmark
        masteredSkills.push({
          name: req.name,
          category: req.category,
          requiredLevel: req.level,
          learnerLevel: userLevel,
          status: 'Mastered / Exceeds Target',
          weight: req.weight
        });
        earnedWeight += req.weight;
      } else if (userLevel > 0 && userLevel < req.level) {
        // Partially matched (gap in depth)
        const gap = req.level - userLevel;
        partiallyMatchedSkills.push({
          name: req.name,
          category: req.category,
          requiredLevel: req.level,
          learnerLevel: userLevel,
          gap,
          critical: req.critical,
          status: 'Partial Match (Upskilling Required)',
          weight: req.weight
        });
        // Award fractional weight
        earnedWeight += (userLevel / req.level) * req.weight;
      } else {
        // Completely missing
        const missingEntry = {
          name: req.name,
          category: req.category,
          requiredLevel: req.level,
          learnerLevel: 0,
          critical: req.critical,
          status: req.critical ? 'Missing Critical Skill' : 'Missing Secondary Skill',
          weight: req.weight
        };

        if (req.critical) {
          missingCriticalSkills.push(missingEntry);
        } else {
          missingSecondarySkills.push(missingEntry);
        }
      }
    }

    const readinessScore = Math.round((earnedWeight / (totalWeight || 1)) * 100);

    const gapReport = {
      targetCareerId: career.id,
      targetCareerTitle: career.title,
      domain: career.domain,
      description: career.description,
      readinessScore,
      masteredSkills,
      partiallyMatchedSkills,
      missingCriticalSkills,
      missingSecondarySkills,
      totalMissingCount: missingCriticalSkills.length + missingSecondarySkills.length + partiallyMatchedSkills.length,
      evaluatedAt: new Date().toISOString()
    };

    this.bus.writeBlackboard(`gapReport:${learner.id}`, gapReport);

    this.bus.logDeliberation(
      this.name,
      'GAP_ANALYSIS_COMPLETE',
      `Career gap analysis concluded for '${career.title}'. Overall Readiness: ${readinessScore}%. Identified ${missingCriticalSkills.length} Critical Gap(s) [${missingCriticalSkills.map(s => s.name).join(', ')}], and ${partiallyMatchedSkills.length} Partial Gap(s). Handoff to CurriculumArchitectAgent.`,
      {
        readinessScore,
        criticalGaps: missingCriticalSkills.map(s => s.name),
        masteredCount: masteredSkills.length
      }
    );

    return gapReport;
  }
}

module.exports = {
  CareerMatcherAgent
};
