const url = require('node:url');

/**
 * API Router
 * Dispatches incoming HTTP requests to the OrchestratorService
 */
function createApiRouter(orchestrator) {
  return async function handleApiRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // CORS & JSON Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Helper to send JSON responses
    const sendJson = (statusCode, payload) => {
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(payload));
    };

    // Helper to parse JSON body
    const parseBody = () => {
      return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            resolve(body ? JSON.parse(body) : {});
          } catch (err) {
            reject(new Error('Invalid JSON format in request body'));
          }
        });
        req.on('error', reject);
      });
    };

    try {
      // 1. Get Learner Profile
      if (pathname === '/api/learner' && method === 'GET') {
        const learnerId = parsedUrl.query.id || 'learner-001';
        const learner = orchestrator.getLearner(learnerId);
        return sendJson(200, { success: true, learner });
      }

      // 2. Update Learner Profile
      if (pathname === '/api/learner/update' && method === 'POST') {
        const body = await parseBody();
        const learnerId = body.learnerId || 'learner-001';
        const result = await orchestrator.updateProfile(learnerId, body);
        return sendJson(200, { success: true, ...result });
      }

      // 3. Get Career Taxonomy
      if (pathname === '/api/careers' && method === 'GET') {
        const careers = orchestrator.getAllCareers();
        return sendJson(200, { success: true, careers });
      }

      // 4. Change Career Target (Goal Pivot)
      if (pathname === '/api/career/change' && method === 'POST') {
        const body = await parseBody();
        const learnerId = body.learnerId || 'learner-001';
        const targetCareerId = body.targetCareerId;
        if (!targetCareerId) {
          return sendJson(400, { success: false, error: 'targetCareerId required' });
        }
        const result = await orchestrator.changeCareerGoal(learnerId, targetCareerId);
        return sendJson(200, { success: true, ...result });
      }

      // 5. Run/Get Multi-Agent Pipeline
      if (pathname === '/api/pipeline' && method === 'GET') {
        const learnerId = parsedUrl.query.id || 'learner-001';
        const overrideCareer = parsedUrl.query.career || null;
        const result = await orchestrator.runMultiAgentPipeline(learnerId, overrideCareer);
        return sendJson(200, { success: true, ...result });
      }

      // 6. Get Assessment Questions
      if (pathname === '/api/assessment' && method === 'GET') {
        const skillName = parsedUrl.query.skill || 'JavaScript';
        const questions = orchestrator.getAssessmentQuestions(skillName);
        return sendJson(200, { success: true, skillName, questions });
      }

      // 7. Submit Assessment (Triggers Adaptive Remediation on Failure)
      if (pathname === '/api/assessment/submit' && method === 'POST') {
        const body = await parseBody();
        const learnerId = body.learnerId || 'learner-001';
        const skillName = body.skillName;
        const answers = body.answers;
        if (!skillName || !Array.isArray(answers)) {
          return sendJson(400, { success: false, error: 'skillName and answers array required' });
        }
        const result = await orchestrator.submitAssessment(learnerId, skillName, answers);
        return sendJson(200, { success: true, ...result });
      }

      // 8. Toggle Milestone Completion
      if (pathname === '/api/milestone/toggle' && method === 'POST') {
        const body = await parseBody();
        const learnerId = body.learnerId || 'learner-001';
        const milestoneId = body.milestoneId;
        if (!milestoneId) {
          return sendJson(400, { success: false, error: 'milestoneId required' });
        }
        const result = await orchestrator.toggleMilestone(learnerId, milestoneId);
        return sendJson(200, { success: true, ...result });
      }

      // 9. Interactive Mentor Chat
      if (pathname === '/api/mentor/chat' && method === 'POST') {
        const body = await parseBody();
        const learnerId = body.learnerId || 'learner-001';
        const message = body.message;
        if (!message) {
          return sendJson(400, { success: false, error: 'message required' });
        }
        const result = await orchestrator.chatWithMentor(learnerId, message);
        return sendJson(200, { success: true, ...result });
      }

      // 10. Agent Deliberations Log
      if (pathname === '/api/deliberations' && method === 'GET') {
        const deliberations = orchestrator.getDeliberations();
        return sendJson(200, { success: true, deliberations });
      }

      // Not found
      return sendJson(404, { success: false, error: `API route '${pathname}' not found` });
    } catch (err) {
      console.error('API Error:', err);
      return sendJson(500, { success: false, error: err.message || 'Internal Server Error' });
    }
  };
}

module.exports = {
  createApiRouter
};
