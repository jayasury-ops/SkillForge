const path = require('node:path');
const fs = require('node:fs');
const { sharedAgentBus } = require('./AgentBus');

/**
 * CurriculumArchitectAgent
 * Role: Personalized Learning Roadmap Synthesizer & Course Recommender
 * Constructs ordered learning phases, aligns curated educational materials
 * (courses, tutorials, hands-on labs), and sequences milestones to bridge identified gaps.
 */
class CurriculumArchitectAgent {
  constructor(bus = sharedAgentBus) {
    this.name = 'CurriculumArchitectAgent';
    this.bus = bus;
    this.resourcesPath = path.join(__dirname, '../data/resourcesCatalog.json');
    this.resourcesCatalog = this.loadCatalog();
  }

  loadCatalog() {
    try {
      const raw = fs.readFileSync(this.resourcesPath, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  }

  /**
   * Synthesize an end-to-end personalized learning path
   * @param {object} learner - Learner profile record
   * @param {object} gapReport - Output from CareerMatcherAgent
   * @param {Array} remediationDirectives - Optional remediation modules injected by AdaptiveMentorAgent
   */
  async buildRoadmap(learner, gapReport, remediationDirectives = []) {
    this.bus.logDeliberation(
      this.name,
      'ROADMAP_SYNTHESIS_START',
      `Designing personalized roadmap for ${learner.name} targeting '${gapReport.targetCareerTitle}'. Synthesizing modules for ${gapReport.missingCriticalSkills.length} critical gaps and ${gapReport.partiallyMatchedSkills.length} partial skill gaps.`,
      { target: gapReport.targetCareerTitle, gapsCount: gapReport.totalMissingCount }
    );

    const milestones = [];
    let sequenceCounter = 1;

    // 1. Check for Active Remediation Directives (Priority Phase 0)
    if (remediationDirectives && remediationDirectives.length > 0) {
      for (const directive of remediationDirectives) {
        milestones.push({
          id: `m-rem-${sequenceCounter++}`,
          phaseNumber: milestones.length + 1,
          isRemediation: true,
          skillTarget: directive.topic,
          title: `[Targeted Remediation] ${directive.topic} Reinforcement`,
          objective: directive.reason || 'Address diagnostic weakness identified during recent performance assessment.',
          urgency: 'HIGH',
          estimatedHours: 4,
          difficulty: 'Foundational Revisit',
          resources: [
            {
              title: `Interactive Lab: Master ${directive.topic}`,
              type: 'Diagnostic Tutorial',
              platform: 'SkillForge Guided Sandbox',
              duration: '3 hours',
              description: `Deep-dive focused drill on ${directive.topic} with step-by-step code walkthroughs.`
            }
          ],
          handsOnProject: {
            title: `Micro-Lab: ${directive.topic} Practical Drill`,
            description: `Build a minimal reproducible demonstration exercising ${directive.topic} with 100% test coverage.`
          },
          status: 'pending'
        });
      }
    }

    // 2. Identify skills requiring curriculum creation
    const skillsToCover = [
      ...gapReport.missingCriticalSkills,
      ...gapReport.partiallyMatchedSkills,
      ...gapReport.missingSecondarySkills
    ];

    // Dependency Sequencing Rule for Web/Full Stack:
    // HTML/CSS -> JS Core -> React -> Node.js -> REST APIs / Integration
    const dependencyRank = {
      'HTML & CSS': 1,
      'JavaScript': 2,
      'Git & Version Control': 3,
      'React': 4,
      'Node.js': 5,
      'REST APIs': 6,
      'SQL': 7,
      'Docker & Containers': 8
    };

    skillsToCover.sort((a, b) => {
      const rankA = dependencyRank[a.name] || 99;
      const rankB = dependencyRank[b.name] || 99;
      return rankA - rankB;
    });

    for (const skillItem of skillsToCover) {
      const skillName = skillItem.name;
      const catalogResources = this.resourcesCatalog[skillName] || [];

      // Determine level of resources needed
      const isPartial = skillItem.status.includes('Partial');
      const filteredResources = catalogResources.length > 0 ? catalogResources : [
        {
          id: `generic-${skillName.toLowerCase()}`,
          title: `Comprehensive ${skillName} Industry Bootcamp`,
          type: 'Guided Course',
          platform: 'Curated Open Source Curriculum',
          duration: '10 hours',
          difficulty: isPartial ? 'Intermediate' : 'Beginner to Intermediate',
          url: 'https://developer.mozilla.org/',
          description: `Master core principles, modern patterns, and practical execution in ${skillName}.`,
          practicalExercise: `Implement an end-to-end milestone component demonstrating real-world usage of ${skillName}.`
        }
      ];

      const estHours = filteredResources.reduce((sum, r) => {
        const h = parseInt(r.duration, 10) || 8;
        return sum + h;
      }, 0);

      milestones.push({
        id: `m-${skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${sequenceCounter++}`,
        phaseNumber: milestones.length + 1,
        skillTarget: skillName,
        category: skillItem.category,
        title: isPartial ? `Deepen Proficiency: ${skillName}` : `Master Essential: ${skillName}`,
        objective: isPartial
          ? `Elevate current working level (${skillItem.learnerLevel}/5) to industry benchmark (${skillItem.requiredLevel}/5).`
          : `Build strong conceptual foundations and hands-on fluency in ${skillName} from scratch.`,
        critical: !!skillItem.critical,
        estimatedHours: estHours,
        difficulty: isPartial ? 'Intermediate' : 'Core Foundation',
        resources: filteredResources,
        handsOnProject: {
          title: `${skillName} Practical Milestone Project`,
          description: filteredResources[0]?.practicalExercise || `Develop a production-grade component showcasing ${skillName}.`
        },
        status: (learner.progress?.completedMilestones || []).includes(`m-${skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`) ? 'completed' : 'pending'
      });
    }

    // 3. Add Capstone Integration Phase
    milestones.push({
      id: `m-capstone-${sequenceCounter++}`,
      phaseNumber: milestones.length + 1,
      skillTarget: 'Full Stack Integration',
      category: 'Capstone Engineering',
      title: `Capstone Project: End-to-End ${gapReport.targetCareerTitle} Portfolio Build`,
      objective: `Synthesize all newly acquired and existing competencies (${skillsToCover.map(s => s.name).join(', ')}) into a deployable, enterprise-ready showcase project.`,
      critical: true,
      estimatedHours: 25,
      difficulty: 'Advanced / Capstone',
      resources: [
        {
          title: `Full Stack Architecture Blueprint & Deployment Guide`,
          type: 'Project Blueprint',
          platform: 'SkillForge Architectural Studio',
          duration: '25 hours',
          url: 'https://github.com/',
          description: 'Step-by-step guidance on continuous integration, Docker deployment, and production hardening.',
          practicalExercise: 'Deploy a multi-tier web application featuring secure JWT authentication, relational database persistence, responsive UI, and automated CI/CD.'
        }
      ],
      handsOnProject: {
        title: `Production-Grade Capstone Deployment`,
        description: 'Complete architecture implementation, GitHub documentation, and live preview staging.'
      },
      status: 'pending'
    });

    const totalEstimatedHours = milestones.reduce((sum, m) => sum + (m.estimatedHours || 0), 0);

    const roadmap = {
      learnerId: learner.id,
      targetCareerId: gapReport.targetCareerId,
      targetCareerTitle: gapReport.targetCareerTitle,
      generatedAt: new Date().toISOString(),
      totalMilestones: milestones.length,
      totalEstimatedHours,
      estimatedWeeksToJobReady: Math.ceil(totalEstimatedHours / 12), // assuming 12 hours/week study pace
      milestones
    };

    this.bus.writeBlackboard(`roadmap:${learner.id}`, roadmap);

    this.bus.logDeliberation(
      this.name,
      'ROADMAP_SYNTHESIZED',
      `Personalized roadmap completed: ${milestones.length} structured milestones spanning ${totalEstimatedHours} estimated learning hours (${roadmap.estimatedWeeksToJobReady} weeks at 12 hrs/week). Ready for learner execution and mentor supervision.`,
      { totalMilestones: milestones.length, estimatedHours: totalEstimatedHours }
    );

    return roadmap;
  }
}

module.exports = {
  CurriculumArchitectAgent
};
