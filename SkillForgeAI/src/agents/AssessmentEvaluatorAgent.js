const path = require('node:path');
const fs = require('node:fs');
const { sharedAgentBus } = require('./AgentBus');

/**
 * AssessmentEvaluatorAgent
 * Role: Diagnostic Assessment Engine & Performance Telemetry Evaluator
 * Administers skill-specific knowledge tests, evaluates response accuracy,
 * tracks historical learning velocity, and isolates conceptual misconceptions.
 */
class AssessmentEvaluatorAgent {
  constructor(bus = sharedAgentBus) {
    this.name = 'AssessmentEvaluatorAgent';
    this.bus = bus;
    this.bankPath = path.join(__dirname, '../data/assessmentBank.json');
    this.assessmentBank = this.loadBank();
  }

  loadBank() {
    try {
      const raw = fs.readFileSync(this.bankPath, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  }

  /**
   * Fetch assessment questions for a designated skill
   * @param {string} skillName - Name of skill to test
   */
  getAssessmentForSkill(skillName) {
    const questions = this.assessmentBank[skillName] || [];
    if (questions.length === 0) {
      // Dynamic fallback questions if skill not in static bank
      return [
        {
          id: `q-${skillName.toLowerCase()}-auto-1`,
          question: `In professional software development, what is the best practice when writing production code with ${skillName}?`,
          options: [
            "Write monolithic code without unit tests",
            "Follow modular design, handle exceptions gracefully, and write maintainable documentation",
            "Commit sensitive credentials directly into git repositories",
            "Avoid code reviews to deliver features faster"
          ],
          correctIndex: 1,
          explanation: `High quality ${skillName} development requires modularity, error resilience, and automated testing.`,
          remediationTopic: `${skillName} Engineering Best Practices`
        }
      ];
    }
    return questions;
  }

  /**
   * Evaluate a completed assessment submission
   * @param {object} learner - Learner profile record
   * @param {string} skillName - Skill assessed
   * @param {Array<number>} userAnswers - Array of selected option indexes
   */
  async evaluateSubmission(learner, skillName, userAnswers) {
    const questions = this.getAssessmentForSkill(skillName);
    let correctCount = 0;
    const itemAnalysis = [];
    const identifiedWeaknesses = [];

    this.bus.logDeliberation(
      this.name,
      'EVALUATION_START',
      `Grading diagnostic assessment for ${learner.name} in '${skillName}' (${questions.length} items evaluated).`,
      { learnerId: learner.id, skillName }
    );

    questions.forEach((q, idx) => {
      const selected = userAnswers[idx];
      const isCorrect = selected === q.correctIndex;

      if (isCorrect) {
        correctCount++;
      } else {
        identifiedWeaknesses.push({
          topic: q.remediationTopic || skillName,
          questionId: q.id,
          questionText: q.question,
          learnerSelected: selected !== undefined ? q.options[selected] : 'No Answer',
          correctAnswer: q.options[q.correctIndex],
          rationale: q.explanation
        });
      }

      itemAnalysis.push({
        questionNumber: idx + 1,
        questionText: q.question,
        userSelected: selected,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation
      });
    });

    const scorePercent = Math.round((correctCount / (questions.length || 1)) * 100);
    const passed = scorePercent >= 70;

    const evaluationResult = {
      assessmentId: `test-${Date.now()}`,
      skillName,
      evaluatedAt: new Date().toISOString(),
      scorePercent,
      correctCount,
      totalQuestions: questions.length,
      passed,
      gradeTier: scorePercent >= 90 ? 'Mastery (A+)' : scorePercent >= 70 ? 'Proficient (B)' : 'Needs Remediation (C/F)',
      identifiedWeaknesses,
      itemAnalysis
    };

    // Emit event on bus for AdaptiveMentorAgent
    if (!passed) {
      this.bus.logDeliberation(
        this.name,
        'ASSESSMENT_DEFICIT_TRIGGERED',
        `Learner ${learner.name} scored ${scorePercent}% on '${skillName}' assessment (Below 70% threshold). Isolated ${identifiedWeaknesses.length} conceptual gap(s): [${identifiedWeaknesses.map(w => w.topic).join(', ')}]. Alerting AdaptiveMentorAgent for dynamic intervention!`,
        { scorePercent, weaknesses: identifiedWeaknesses.map(w => w.topic) }
      );
      this.bus.emit('assessment:deficit', {
        learner,
        skillName,
        scorePercent,
        weaknesses: identifiedWeaknesses
      });
    } else {
      this.bus.logDeliberation(
        this.name,
        'ASSESSMENT_PASSED',
        `Learner ${learner.name} demonstrated proficiency with ${scorePercent}% in '${skillName}'. Readiness index eligible for advancement.`,
        { scorePercent }
      );
      this.bus.emit('assessment:passed', {
        learner,
        skillName,
        scorePercent
      });
    }

    return evaluationResult;
  }
}

module.exports = {
  AssessmentEvaluatorAgent
};
