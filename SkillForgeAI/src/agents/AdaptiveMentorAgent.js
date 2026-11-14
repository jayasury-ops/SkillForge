const { sharedAgentBus } = require('./AgentBus');

/**
 * AdaptiveMentorAgent
 * Role: Conversational AI Mentor & Dynamic Learning Path Orchestrator
 * Serves as the learner's personal academic advisor and real-time supervisor.
 * Intercepts diagnostic failures to prescribe remediation, reacts to career goal pivots,
 * and maintains continuous dialog with learners.
 */
class AdaptiveMentorAgent {
  constructor(bus = sharedAgentBus) {
    this.name = 'AdaptiveMentorAgent';
    this.bus = bus;
    this.registerEventListeners();
  }

  registerEventListeners() {
    // React to assessment deficits
    this.bus.on('assessment:deficit', async (eventData) => {
      this.handleAssessmentDeficit(eventData);
    });

    // React to goal changes
    this.bus.on('goal:changed', async (eventData) => {
      this.handleGoalChange(eventData);
    });
  }

  /**
   * Adaptive Intervention when a learner struggles in an assessment (<70%)
   */
  async handleAssessmentDeficit({ learner, skillName, scorePercent, weaknesses }) {
    this.bus.logDeliberation(
      this.name,
      'ADAPTIVE_INTERVENTION',
      `Activating adaptive intervention protocol for ${learner.name}. Score: ${scorePercent}% in '${skillName}'. Formulating remediation strategy for: ${weaknesses.map(w => w.topic).join('; ')}.`,
      { scorePercent, weaknessTopics: weaknesses.map(w => w.topic) }
    );

    // Generate actionable remediation directives
    const remediationDirectives = weaknesses.map(w => ({
      skill: skillName,
      topic: w.topic,
      reason: `Learner struggled with: "${w.questionText.substring(0, 80)}...". Need reinforcement on ${w.topic}.`
    }));

    return remediationDirectives;
  }

  /**
   * Adaptive Response when learner changes career aspiration
   */
  async handleGoalChange({ learner, oldGoal, newGoal }) {
    this.bus.logDeliberation(
      this.name,
      'GOAL_PIVOT_DETECTED',
      `Learner ${learner.name} pivoted career target from '${oldGoal}' to '${newGoal}'. Initiating multi-agent re-alignment pipeline (Profiler -> Matcher -> Curriculum Architect).`,
      { oldGoal, newGoal }
    );
  }

  /**
   * Interactive Conversational Mentorship
   * Generates intelligent, context-aware mentoring advice based on the learner's live profile,
   * current milestone, gaps, and recent assessment history.
   * @param {object} learner - Current learner record
   * @param {object} gapReport - Current gap report
   * @param {object} currentRoadmap - Active roadmap
   * @param {string} userQuery - The message sent by the learner
   */
  async generateMentoringResponse(learner, gapReport, currentRoadmap, userQuery) {
    this.bus.logDeliberation(
      this.name,
      'MENTOR_DIALOGUE',
      `Generating conversational advice for learner ${learner.name} answering: "${userQuery}".`,
      { query: userQuery }
    );

    const queryLower = (userQuery || '').toLowerCase();
    const target = gapReport?.targetCareerTitle || learner.targetCareerTitle || 'Software Engineer';
    const missingSkills = (gapReport?.missingCriticalSkills || []).map(s => s.name);
    const completedCount = (learner.progress?.completedMilestones || []).length;
    const totalMilestones = currentRoadmap?.milestones?.length || 5;

    // Rule-based high-intelligence contextual reasoning engine:
    let reply = '';
    let suggestedActions = [];

    if (queryLower.includes('why') && (queryLower.includes('node') || queryLower.includes('javascript'))) {
      reply = `Hello ${learner.name}! Great question. While your existing **Python** skills are fantastic for backend logic, data science, and scripting, your target role is **${target}**. In modern full-stack development, **JavaScript & Node.js** allow you to write both client-side and server-side logic in a unified runtime, utilize npm's rich ecosystem, and integrate seamlessly with React frontend applications! Learning Node.js will also make you dual-stack fluent (Python + JS), which top engineering teams highly value.`;
      suggestedActions = [
        'Review Phase 1: Modern JavaScript Foundations',
        'Take a 3-minute JavaScript diagnostic quiz',
        'Compare Python Flask/FastAPI vs Node.js Express'
      ];
    } else if (queryLower.includes('react') || queryLower.includes('hook') || queryLower.includes('frontend')) {
      reply = `As a future **${target}**, mastering React is essential because it is the world's most demanded frontend library. Since you already know basic HTML/CSS, your next strategic leap is understanding how React transforms static UI into reactive, component-driven interfaces. Focus first on state (` + '`useState`' + `) and side-effects (` + '`useEffect`' + `), and then tackle custom hooks.`;
      suggestedActions = [
        'Open React 19 Component Architecture Milestone',
        'Practice building the Kanban Board project',
        'Take the React diagnostic assessment'
      ];
    } else if (queryLower.includes('fail') || queryLower.includes('low score') || queryLower.includes('stuck') || queryLower.includes('help')) {
      reply = `Don't be discouraged at all, ${learner.name}! Stumbling on a quiz or difficult concept is the single most valuable signal in adaptive learning—it pinpoints the exact edge of your knowledge. I have already flagged your review topics on the blackboard, and our **CurriculumArchitectAgent** can dynamically weave targeted practice exercises right into your roadmap so you master it effortlessly. Take a quick break, review the code explanation, and try again!`;
      suggestedActions = [
        'Inspect detailed quiz explanations and rationale',
        'Launch targeted remediation drill',
        'Ask me to explain any specific line of code'
      ];
    } else if (queryLower.includes('how long') || queryLower.includes('weeks') || queryLower.includes('time') || queryLower.includes('roadmap')) {
      const weeks = currentRoadmap?.estimatedWeeksToJobReady || 8;
      const hours = currentRoadmap?.totalEstimatedHours || 70;
      reply = `Based on your current baseline (${learner.existingSkills.map(s => s.name).join(', ')}) and our gap analysis against **${target}**, our agents estimate you need approximately **${hours} learning hours** (about **${weeks} weeks** at a steady pace of 10-12 hours per week). You've already completed **${completedCount} of ${totalMilestones} milestones**!`;
      suggestedActions = [
        'View chronological roadmap milestones',
        'Mark next hands-on milestone completed',
        'Generate career readiness certificate preview'
      ];
    } else if (queryLower.includes('career') || queryLower.includes('switch') || queryLower.includes('change') || queryLower.includes('job')) {
      reply = `You have the flexibility to switch career tracks at any time! If you switch from **${target}** to another path like **AI/Machine Learning Engineer** or **Cloud & DevOps**, our multi-agent bus will immediately recalculate your match percentage. For example, your **Python and SQL** skills are 90%+ matching for AI/ML, meaning your path to job readiness there would be even faster!`;
      suggestedActions = [
        'Explore AI / Machine Learning Engineer match',
        'Switch target role in Profile tab',
        'Compare skill gaps across multiple careers'
      ];
    } else {
      reply = `Welcome back, ${learner.name}! I am your **Adaptive AI Mentor**. Together with our specialized agents (**SkillProfiler**, **CareerMatcher**, **CurriculumArchitect**, and **AssessmentEvaluator**), I am actively tracking your journey toward becoming a **${target}**.\n\nYour top critical skill gaps to conquer are: **${missingSkills.slice(0, 3).join(', ') || 'Capstone Project'}**.\n\nWhat would you like to focus on today? You can ask me conceptual questions, review your roadmap, or take a diagnostic quiz!`;
      suggestedActions = [
        'What skills do I need to learn next?',
        'Why do I need Node.js if I know Python?',
        'How do React hooks work?'
      ];
    }

    return {
      mentorName: 'AI Mentor (SkillForge Adaptive Advisor)',
      timestamp: new Date().toISOString(),
      reply,
      suggestedActions
    };
  }
}

module.exports = {
  AdaptiveMentorAgent
};
