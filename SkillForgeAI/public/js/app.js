/**
 * SkillForge AI - Frontend Controller
 * Connects UI views, manages client state, and interacts with Orchestrator APIs
 */

// Application State
const state = {
  learner: null,
  audit: null,
  gapReport: null,
  roadmap: null,
  careers: [],
  deliberations: [],
  currentAssessment: null
};

// DOM Content Loaded Initializer
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initEventListeners();
  loadInitialData();
  // Poll deliberation logs every 5 seconds for live multi-agent activity
  setInterval(refreshDeliberations, 5000);
});

/* ================= 1. NAVIGATION & TAB SWITCHING ================= */
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
        t.tabIndex = -1;
      });
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      tab.tabIndex = 0;
      const targetId = tab.getAttribute('data-tab');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });

    tab.addEventListener('keydown', event => {
      const currentIndex = Array.from(tabs).indexOf(tab);
      let nextIndex = currentIndex;

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = tabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      tabs[nextIndex].focus();
      tabs[nextIndex].click();
    });
  });

  document.querySelectorAll('[data-open-tab]').forEach(button => {
    button.addEventListener('click', () => {
      const tab = document.getElementById(`${button.dataset.openTab}-nav`);
      if (tab) tab.click();
    });
  });
}

/* ================= 2. EVENT LISTENERS ================= */
function initEventListeners() {
  // Save Profile
  document.getElementById('btnSaveProfile').addEventListener('click', saveProfileChanges);
  
  // Add Skill
  document.getElementById('btnAddSkill').addEventListener('click', promptAddSkill);
  
  // Add Certificate
  document.getElementById('btnAddCert').addEventListener('click', promptAddCert);
  
  // Add Project
  document.getElementById('btnAddProject').addEventListener('click', promptAddProject);
  
  // Load Assessment Test
  document.getElementById('btnLoadAssessment').addEventListener('click', () => {
    const skill = document.getElementById('assessmentSkillSelector').value;
    loadAssessmentForSkill(skill);
  });
  
  // Mentor Chat Form
  document.getElementById('chatForm').addEventListener('submit', handleMentorChatSubmit);
  
  // Quick Prompt Chips
  document.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      document.getElementById('chatInput').value = prompt;
      handleMentorChatSubmit(new Event('submit'));
    });
  });

  // Refresh Deliberations
  document.getElementById('btnRefreshDelib').addEventListener('click', refreshDeliberations);

  // Quick Demo Buttons (For Viva Voce Presentation)
  document.getElementById('btnDemoSampleScenario').addEventListener('click', runDemoSampleScenario);
  document.getElementById('btnDemoAssessmentFail').addEventListener('click', runDemoAssessmentFail);
  document.getElementById('btnDemoGoalChange').addEventListener('click', runDemoGoalChange);
}

/* ================= 3. INITIAL DATA LOAD ================= */
async function loadInitialData() {
  try {
    // 1. Load Careers
    const careersRes = await fetch('/api/careers');
    const careersData = await careersRes.json();
    if (careersData.success) {
      state.careers = careersData.careers;
      populateCareerDropdown();
    }

    // 2. Load Pipeline
    await fetchPipeline();

    // 3. Render Welcome message in AI Mentor Chat
    renderMentorInitialMessage();
  } catch (err) {
    console.error('Failed to load initial data:', err);
  }
}

async function fetchPipeline(overrideCareer = null) {
  try {
    let url = '/api/pipeline?id=learner-001';
    if (overrideCareer) url += `&career=${overrideCareer}`;
    
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.success) {
      state.learner = data.learner;
      state.audit = data.audit;
      state.gapReport = data.gapReport;
      state.roadmap = data.roadmap;
      state.deliberations = data.deliberations || [];
      
      renderAllViews();
    }
  } catch (err) {
    console.error('Error fetching pipeline:', err);
  }
}

/* ================= 4. POPULATE & RENDER VIEWS ================= */
function renderAllViews() {
  renderHeader();
  renderDashboardHero();
  renderProfileView();
  renderSkillAnalysisView();
  renderCareerMatchingView();
  renderRoadmapView();
  renderProgressView();
  renderDeliberationsView();
}

function renderHeader() {
  if (!state.learner) return;
  document.getElementById('headerLearnerName').textContent = state.learner.name;
  document.getElementById('headerTargetCareer').textContent = state.learner.targetCareerTitle || 'Full Stack Developer';
  const initials = state.learner.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  document.getElementById('headerAvatar').textContent = initials;
}

function renderDashboardHero() {
  if (!state.learner) return;

  const completed = state.learner.progress?.completedMilestones || [];
  const nextMilestone = state.roadmap?.milestones?.find(milestone => !completed.includes(milestone.id));
  document.getElementById('homeCareerGoal').textContent = state.learner.targetCareerTitle || 'Your career goal';
  document.getElementById('homeNextMilestone').textContent = nextMilestone?.title || 'Choose a new learning goal';
}

function populateCareerDropdown() {
  const sel = document.getElementById('profTargetCareer');
  sel.innerHTML = '';
  state.careers.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.title} (${c.domain})`;
    sel.appendChild(opt);
  });
}

// ---------------- FEATURE 1: USER PROFILE ----------------
function renderProfileView() {
  if (!state.learner) return;
  document.getElementById('profName').value = state.learner.name || '';
  document.getElementById('profInstitution').value = state.learner.institution || '';
  document.getElementById('profBio').value = state.learner.bio || '';
  document.getElementById('profTargetCareer').value = state.learner.targetCareerId || 'fullstack-developer';

  // Render Skills List
  const skillsContainer = document.getElementById('skillsListContainer');
  skillsContainer.innerHTML = '';
  
  (state.learner.existingSkills || []).forEach((skill, idx) => {
    const row = document.createElement('div');
    row.className = 'skill-row-item';
    
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      starsHtml += `<span class="star ${i <= skill.level ? 'active' : ''}">★</span>`;
    }

    row.innerHTML = `
      <div class="skill-name-col">
        <span>${skill.name}</span>
        <span class="badge-agentic" style="font-size: 0.65rem">${skill.category || 'General'}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 1rem">
        <div class="skill-level-stars" title="Proficiency: ${skill.level}/5">${starsHtml}</div>
        <button class="btn btn-sm btn-secondary" onclick="deleteSkill(${idx})" style="padding: 2px 6px; font-size: 0.7rem">✕</button>
      </div>
    `;
    skillsContainer.appendChild(row);
  });

  // Render Certifications
  const certsContainer = document.getElementById('certsListContainer');
  certsContainer.innerHTML = '';
  (state.learner.certifications || []).forEach((cert, idx) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between">
        <div class="item-title">📜 ${cert.title}</div>
        <button class="btn btn-sm btn-secondary" onclick="deleteCert(${idx})" style="padding: 2px 6px; font-size: 0.7rem">✕</button>
      </div>
      <div class="item-sub">${cert.issuer} &bull; ${cert.year}</div>
    `;
    certsContainer.appendChild(card);
  });

  // Render Projects
  const projectsContainer = document.getElementById('projectsListContainer');
  projectsContainer.innerHTML = '';
  (state.learner.projects || []).forEach((proj, idx) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between">
        <div class="item-title">💻 ${proj.name}</div>
        <button class="btn btn-sm btn-secondary" onclick="deleteProject(${idx})" style="padding: 2px 6px; font-size: 0.7rem">✕</button>
      </div>
      <div class="item-sub" style="margin-top: 0.25rem">${proj.description}</div>
      <div style="margin-top: 0.4rem; font-size: 0.72rem; color: var(--accent)">
        Technologies: ${(proj.technologies || []).join(', ')}
      </div>
    `;
    projectsContainer.appendChild(card);
  });
}

// ---------------- FEATURE 2: SKILL ANALYSIS ----------------
function renderSkillAnalysisView() {
  if (!state.audit) return;
  document.getElementById('statCompleteness').textContent = `${state.audit.profileCompletenessScore}%`;
  document.getElementById('statStrengthsCount').textContent = state.audit.strengths.length;
  document.getElementById('statWeaknessesCount').textContent = state.audit.weaknesses.length;
  document.getElementById('statAvgLevel').textContent = `${state.audit.averageExistingProficiency} / 5`;

  // Strengths
  const strengthsCont = document.getElementById('strengthsContainer');
  strengthsCont.innerHTML = '';
  state.audit.strengths.forEach(s => {
    const item = document.createElement('div');
    item.className = 'competency-badge-item strength';
    item.innerHTML = `
      <div style="font-weight: 700; font-size: 0.85rem">${s.name} (Level ${s.level}/5)</div>
      <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem">${s.diagnosticNote}</div>
    `;
    strengthsCont.appendChild(item);
  });

  // Weaknesses
  const weaknessesCont = document.getElementById('weaknessesContainer');
  weaknessesCont.innerHTML = '';
  state.audit.weaknesses.forEach(w => {
    const item = document.createElement('div');
    item.className = 'competency-badge-item weakness';
    item.innerHTML = `
      <div style="font-weight: 700; font-size: 0.85rem">${w.name} (Level ${w.level}/5)</div>
      <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem">${w.diagnosticNote}</div>
    `;
    weaknessesCont.appendChild(item);
  });

  // Practical Validation Insights
  const validCont = document.getElementById('practicalValidationContainer');
  validCont.innerHTML = '';
  (state.audit.practicalCorrelations || []).forEach(cor => {
    const c = document.createElement('div');
    c.className = 'validation-card';
    c.innerHTML = `
      <div style="font-weight: 700; font-size: 0.82rem; color: var(--accent)">${cor.project}</div>
      <div style="font-size: 0.75rem; color: var(--text-main); margin-top: 0.25rem">${cor.insight}</div>
    `;
    validCont.appendChild(c);
  });
}

// ---------------- FEATURE 3: CAREER MATCHING ----------------
function renderCareerMatchingView() {
  if (!state.gapReport) return;
  document.getElementById('matchTargetTitle').textContent = state.gapReport.targetCareerTitle;
  document.getElementById('matchTargetDomain').textContent = state.gapReport.domain;
  document.getElementById('matchTargetDesc').textContent = state.gapReport.description;
  
  const score = state.gapReport.readinessScore;
  document.getElementById('readinessScoreVal').textContent = `${score}%`;
  
  let caption = 'Low Match: Extensive upskilling recommended';
  if (score >= 75) caption = 'Job-Ready: High match with benchmark';
  else if (score >= 45) caption = 'Moderate Readiness: Core skill gaps must be closed';
  document.getElementById('readinessScoreCaption').textContent = caption;

  // Missing Critical Skills
  const critCont = document.getElementById('missingCriticalContainer');
  critCont.innerHTML = '';
  (state.gapReport.missingCriticalSkills || []).forEach(s => {
    const pill = document.createElement('div');
    pill.className = 'gap-pill-item';
    pill.innerHTML = `
      <div class="gap-pill-header">
        <span class="text-danger">${s.name}</span>
        <span>Target: Lvl ${s.requiredLevel}</span>
      </div>
      <div class="gap-pill-sub">Category: ${s.category} &bull; Must-Have Critical Competency</div>
    `;
    critCont.appendChild(pill);
  });

  // Partially Matched
  const partCont = document.getElementById('partiallyMatchedContainer');
  partCont.innerHTML = '';
  (state.gapReport.partiallyMatchedSkills || []).forEach(s => {
    const pill = document.createElement('div');
    pill.className = 'gap-pill-item';
    pill.innerHTML = `
      <div class="gap-pill-header">
        <span class="text-warning">${s.name}</span>
        <span>Lvl ${s.learnerLevel} &rarr; Target Lvl ${s.requiredLevel}</span>
      </div>
      <div class="gap-pill-sub">Category: ${s.category} &bull; Skill Gap: ${s.gap} level(s)</div>
    `;
    partCont.appendChild(pill);
  });

  // Mastered Skills
  const mastCont = document.getElementById('masteredSkillsContainer');
  mastCont.innerHTML = '';
  (state.gapReport.masteredSkills || []).forEach(s => {
    const pill = document.createElement('div');
    pill.className = 'gap-pill-item';
    pill.innerHTML = `
      <div class="gap-pill-header">
        <span class="text-success">${s.name}</span>
        <span>Lvl ${s.learnerLevel} / ${s.requiredLevel}</span>
      </div>
      <div class="gap-pill-sub">Category: ${s.category} &bull; Meets/Exceeds Industry Standard</div>
    `;
    mastCont.appendChild(pill);
  });
}

// ---------------- FEATURE 4: LEARNING ROADMAP ----------------
function renderRoadmapView() {
  if (!state.roadmap) return;
  document.getElementById('roadmapHoursPill').textContent = `⏳ ${state.roadmap.totalEstimatedHours} Total Hours`;
  document.getElementById('roadmapWeeksPill').textContent = `📅 ~${state.roadmap.estimatedWeeksToJobReady} Weeks Job-Ready`;

  // Check for active remediation banner
  const remediations = state.learner?.progress?.activeRemediations || [];
  const remBanner = document.getElementById('remediationAlertBanner');
  if (remediations.length > 0) {
    remBanner.classList.remove('hidden');
    document.getElementById('remediationAlertText').innerHTML = `
      <b>Adaptive Intervention Active:</b> The Adaptive AI Mentor detected scores below 70% in recent assessments and has prioritized <b>${remediations.length} targeted remediation drill(s)</b>: ${remediations.map(r => r.topic).join(', ')}.
    `;
  } else {
    remBanner.classList.add('hidden');
  }

  const timelineCont = document.getElementById('roadmapMilestonesTimeline');
  timelineCont.innerHTML = '';

  const completedList = state.learner?.progress?.completedMilestones || [];

  state.roadmap.milestones.forEach((m, idx) => {
    const isDone = completedList.includes(m.id);
    const node = document.createElement('div');
    node.className = `milestone-node ${isDone ? 'completed' : ''} ${m.isRemediation ? 'remediation' : ''}`;
    
    // Resources Grid HTML
    let resHtml = '';
    (m.resources || []).forEach(r => {
      resHtml += `
        <div class="resource-card">
          <div>
            <span class="res-type-badge">${r.type || 'Resource'}</span>
            <div class="res-title">${r.title}</div>
            <div class="res-desc">${r.description || ''}</div>
          </div>
          <div class="res-footer">
            <span>⏱️ ${r.duration || '6 hours'}</span>
            <a href="${r.url || '#'}" target="_blank" class="res-link">Open Material &rarr;</a>
          </div>
        </div>
      `;
    });

    node.innerHTML = `
      <div class="milestone-header">
        <div>
          <span class="phase-tag">${m.isRemediation ? '🚨 ADAPTIVE REMEDIATION' : `PHASE ${idx + 1}`} &bull; ${m.skillTarget}</span>
          <div class="milestone-title">${m.title}</div>
        </div>
        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.8rem; font-weight: 600">
          <input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleMilestoneDone('${m.id}')">
          <span>${isDone ? 'Completed ✅' : 'Mark Completed'}</span>
        </label>
      </div>
      <div class="milestone-obj">🎯 <b>Objective:</b> ${m.objective}</div>
      <div class="resource-cards-grid">${resHtml}</div>
      ${m.handsOnProject ? `
        <div class="project-box">
          <h5>🛠️ Practical Milestone Challenge: ${m.handsOnProject.title}</h5>
          <p>${m.handsOnProject.description}</p>
        </div>
      ` : ''}
    `;

    timelineCont.appendChild(node);
  });
}

// ---------------- FEATURE 5: PROGRESS & ASSESSMENTS ----------------
function renderProgressView() {
  if (!state.learner || !state.roadmap) return;
  const completed = (state.learner.progress?.completedMilestones || []).length;
  const total = state.roadmap.milestones?.length || 1;
  const percent = Math.min(100, Math.round((completed / total) * 100));

  document.getElementById('milestoneProgressPercent').textContent = `${percent}%`;
  document.getElementById('milestoneProgressBar').style.width = `${percent}%`;
  document.getElementById('completedMilestonesCount').textContent = completed;
  document.getElementById('totalHoursInvested').textContent = `${state.learner.progress?.hoursInvested || 0} hrs`;

  const history = state.learner.progress?.assessmentHistory || [];
  document.getElementById('testsAttemptedCount').textContent = history.length;

  const historyCont = document.getElementById('assessmentHistoryContainer');
  if (history.length === 0) {
    historyCont.innerHTML = `<p class="empty-state">No assessments completed yet. Take a test above!</p>`;
  } else {
    historyCont.innerHTML = '';
    history.forEach(h => {
      const item = document.createElement('div');
      item.className = 'history-item';
      item.innerHTML = `
        <div>
          <b>${h.skillName}</b>
          <span style="font-size: 0.72rem; color: var(--text-dim); margin-left: 0.5rem">${new Date(h.date).toLocaleDateString()}</span>
        </div>
        <div>
          <span style="font-weight: 700; color: ${h.passed ? 'var(--success)' : 'var(--danger)'}">
            ${h.scorePercent}% ${h.passed ? 'PASSED' : 'REMEDIATION'}
          </span>
        </div>
      `;
      historyCont.appendChild(item);
    });
  }
}

// ---------------- FEATURE 6: DELIBERATION STREAM ----------------
function renderDeliberationsView() {
  const feed = document.getElementById('deliberationFeed');
  if (!state.deliberations || state.deliberations.length === 0) {
    feed.innerHTML = `<p class="empty-state">No agent deliberations logged yet.</p>`;
    return;
  }

  feed.innerHTML = '';
  state.deliberations.forEach(d => {
    const card = document.createElement('div');
    card.className = `delib-card ${d.agentName}`;
    const timeStr = new Date(d.timestamp).toLocaleTimeString();
    card.innerHTML = `
      <div class="delib-header">
        <span class="delib-agent">${d.agentName}</span>
        <span class="delib-phase">[${d.phase}] &bull; ${timeStr}</span>
      </div>
      <div class="delib-msg">${d.message}</div>
    `;
    feed.appendChild(card);
  });
}

async function refreshDeliberations() {
  try {
    const res = await fetch('/api/deliberations');
    const data = await res.json();
    if (data.success) {
      state.deliberations = data.deliberations;
      renderDeliberationsView();
    }
  } catch (e) {}
}

/* ================= 5. USER PROFILE ACTIONS ================= */
async function saveProfileChanges() {
  const name = document.getElementById('profName').value;
  const institution = document.getElementById('profInstitution').value;
  const bio = document.getElementById('profBio').value;
  const targetCareerId = document.getElementById('profTargetCareer').value;

  const payload = {
    learnerId: state.learner.id,
    name,
    institution,
    bio,
    existingSkills: state.learner.existingSkills,
    certifications: state.learner.certifications,
    projects: state.learner.projects
  };

  try {
    const res = await fetch('/api/learner/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      // If career changed, update it
      if (targetCareerId !== state.learner.targetCareerId) {
        await fetch('/api/career/change', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ learnerId: state.learner.id, targetCareerId })
        });
      }
      await fetchPipeline();
      alert('Profile updated! Multi-Agent Pipeline re-evaluated your career roadmap.');
    }
  } catch (err) {
    console.error(err);
    alert('Failed to save profile changes');
  }
}

function promptAddSkill() {
  const name = prompt('Skill Name (e.g. JavaScript, Docker, Kubernetes):');
  if (!name) return;
  const levelStr = prompt('Proficiency Level (1 to 5):', '3');
  const level = Math.max(1, Math.min(5, parseInt(levelStr, 10) || 1));
  const category = prompt('Category (e.g. Frontend, Backend, Database):', 'Core Languages') || 'General';

  state.learner.existingSkills.push({ name, level, category, verified: false });
  renderProfileView();
}

window.deleteSkill = function(idx) {
  state.learner.existingSkills.splice(idx, 1);
  renderProfileView();
};

function promptAddCert() {
  const title = prompt('Certification Title:');
  if (!title) return;
  const issuer = prompt('Issuer (e.g. AWS, Coursera, Meta):', 'Accredited Org');
  const year = prompt('Year:', '2024');

  state.learner.certifications.push({ title, issuer, year });
  renderProfileView();
}

window.deleteCert = function(idx) {
  state.learner.certifications.splice(idx, 1);
  renderProfileView();
};

function promptAddProject() {
  const name = prompt('Project Title:');
  if (!name) return;
  const description = prompt('Project Description:');
  const techStr = prompt('Technologies used (comma separated):', 'Python, SQL');
  const technologies = techStr ? techStr.split(',').map(t => t.trim()) : [];

  state.learner.projects.push({ name, description, technologies });
  renderProfileView();
}

window.deleteProject = function(idx) {
  state.learner.projects.splice(idx, 1);
  renderProfileView();
};

/* ================= 6. MILESTONE TOGGLE ================= */
window.toggleMilestoneDone = async function(milestoneId) {
  try {
    const res = await fetch('/api/milestone/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ learnerId: state.learner.id, milestoneId })
    });
    const data = await res.json();
    if (data.success) {
      await fetchPipeline();
    }
  } catch (err) {
    console.error(err);
  }
};

/* ================= 7. ASSESSMENT TESTING SANDBOX ================= */
async function loadAssessmentForSkill(skillName) {
  const container = document.getElementById('quizContainer');
  container.innerHTML = `<p class="empty-state">Loading questions for ${skillName}...</p>`;

  try {
    const res = await fetch(`/api/assessment?skill=${encodeURIComponent(skillName)}`);
    const data = await res.json();
    if (!data.success || !data.questions.length) {
      container.innerHTML = `<p class="empty-state">No questions found for ${skillName}.</p>`;
      return;
    }

    state.currentAssessment = {
      skillName,
      questions: data.questions
    };

    let questionsHtml = '';
    data.questions.forEach((q, qIdx) => {
      let optionsHtml = '';
      q.options.forEach((opt, optIdx) => {
        optionsHtml += `
          <label class="quiz-option-label">
            <input type="radio" name="question_${qIdx}" value="${optIdx}">
            <span>${opt}</span>
          </label>
        `;
      });

      questionsHtml += `
        <div class="quiz-question-card">
          <div class="quiz-question-text">Question ${qIdx + 1}: ${q.question}</div>
          ${q.code ? `<pre class="quiz-code-block">${q.code}</pre>` : ''}
          <div class="quiz-options-group">${optionsHtml}</div>
        </div>
      `;
    });

    questionsHtml += `
      <div style="display: flex; justify-content: flex-end; margin-top: 1rem">
        <button id="btnSubmitQuiz" class="btn btn-primary">Submit Assessment for Evaluation &rarr;</button>
      </div>
      <div id="quizEvaluationOutput"></div>
    `;

    container.innerHTML = questionsHtml;

    document.getElementById('btnSubmitQuiz').addEventListener('click', submitCurrentAssessment);
  } catch (err) {
    container.innerHTML = `<p class="empty-state text-danger">Error loading assessment.</p>`;
  }
}

async function submitCurrentAssessment() {
  if (!state.currentAssessment) return;
  const questions = state.currentAssessment.questions;
  const answers = [];

  for (let i = 0; i < questions.length; i++) {
    const selected = document.querySelector(`input[name="question_${i}"]:checked`);
    answers.push(selected ? parseInt(selected.value, 10) : -1);
  }

  const out = document.getElementById('quizEvaluationOutput');
  out.innerHTML = `<p class="empty-state">AssessmentEvaluatorAgent grading submission...</p>`;

  try {
    const res = await fetch('/api/assessment/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        learnerId: state.learner.id,
        skillName: state.currentAssessment.skillName,
        answers
      })
    });

    const data = await res.json();
    if (data.success) {
      const ev = data.evaluation;
      let weaknessesHtml = '';
      if (ev.identifiedWeaknesses && ev.identifiedWeaknesses.length > 0) {
        weaknessesHtml = `
          <div style="margin-top: 0.75rem; font-size: 0.8rem">
            <b>Identified Weaknesses:</b>
            <ul style="margin-left: 1.25rem; margin-top: 0.25rem">
              ${ev.identifiedWeaknesses.map(w => `<li><b>${w.topic}:</b> ${w.rationale}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      out.innerHTML = `
        <div class="quiz-results-banner ${ev.passed ? 'pass' : 'fail'}">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <h4 style="color: ${ev.passed ? 'var(--success)' : 'var(--danger)'}">
              ${ev.passed ? '🎉 Assessment Passed!' : '⚠️ Needs Remediation (< 70%)'}
            </h4>
            <span style="font-weight: 800; font-size: 1.2rem">${ev.scorePercent}% (${ev.gradeTier})</span>
          </div>
          <p style="font-size: 0.82rem; margin-top: 0.35rem">
            ${ev.passed
              ? 'Great job! Your proficiency has been verified and updated in your profile.'
              : 'The Adaptive AI Mentor has intercepted this score and automatically added prerequisite review modules to your Roadmap tab!'}
          </p>
          ${weaknessesHtml}
        </div>
      `;

      // Refresh pipeline data to show updated roadmap and deliberations
      await fetchPipeline();
    }
  } catch (err) {
    out.innerHTML = `<p class="empty-state text-danger">Error submitting assessment</p>`;
  }
}

/* ================= 8. AI MENTOR CONVERSATION ================= */
function renderMentorInitialMessage() {
  const container = document.getElementById('chatMessages');
  container.innerHTML = `
    <div class="chat-bubble mentor">
      Hello Alex! I am your <b>SkillForge AI Mentor</b>. Together with our 4 specialized agents, I have reviewed your target goal to become a <b>Full Stack Developer</b>.
      <br><br>
      You already possess solid foundations in <b>Python, SQL, and HTML</b>. However, our <b>CareerMatcherAgent</b> has flagged 3 critical missing competencies: <b>JavaScript, React, and Node.js</b>.
      <br><br>
      I've structured your personalized roadmap in Tab 4. How can I assist your learning today?
      <div class="mentor-actions-chips">
        <span class="action-chip">Target: Full Stack Developer</span>
        <span class="action-chip">Roadmap: 75 Hours</span>
        <span class="action-chip">3 Critical Gaps</span>
      </div>
    </div>
  `;
}

async function handleMentorChatSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;

  const container = document.getElementById('chatMessages');

  // Add User Bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble user';
  userBubble.textContent = message;
  container.appendChild(userBubble);

  input.value = '';
  container.scrollTop = container.scrollHeight;

  // Add Loading Bubble
  const loadingBubble = document.createElement('div');
  loadingBubble.className = 'chat-bubble mentor';
  loadingBubble.innerHTML = `<em>AI Mentor deliberating with agent swarm...</em>`;
  container.appendChild(loadingBubble);
  container.scrollTop = container.scrollHeight;

  try {
    const res = await fetch('/api/mentor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ learnerId: state.learner.id, message })
    });
    const data = await res.json();
    if (data.success) {
      const adv = data.advice;
      let actionsHtml = '';
      if (adv.suggestedActions && adv.suggestedActions.length > 0) {
        actionsHtml = `
          <div class="mentor-actions-chips">
            ${adv.suggestedActions.map(a => `<span class="action-chip">${a}</span>`).join('')}
          </div>
        `;
      }

      loadingBubble.innerHTML = `
        ${adv.reply.replace(/\n\n/g, '<br><br>')}
        ${actionsHtml}
      `;
      container.scrollTop = container.scrollHeight;
      
      // Update deliberations
      if (data.deliberations) {
        state.deliberations = data.deliberations;
        renderDeliberationsView();
      }
    }
  } catch (err) {
    loadingBubble.innerHTML = `<span class="text-danger">Sorry, unable to connect to mentor agent right now.</span>`;
  }
}

/* ================= 9. VIVA VOCE DEMO SIMULATORS ================= */
// Demo Action 1: Reset to Sample Scenario
async function runDemoSampleScenario() {
  const samplePayload = {
    learnerId: 'learner-001',
    name: 'Alex Chen',
    institution: 'Tech Institute / University',
    bio: 'Aspiring Full Stack Engineer with strong foundational backend scripting and relational database experience.',
    existingSkills: [
      { name: 'Python', level: 3, category: 'Backend / Scripting', verified: true },
      { name: 'SQL', level: 3, category: 'Databases', verified: true },
      { name: 'HTML & CSS', level: 2, category: 'Web Basics', verified: true }
    ],
    certifications: [
      { title: 'Python for Everybody Specialization', issuer: 'Coursera / Univ. of Michigan', year: '2024' },
      { title: 'Relational Database Fundamentals', issuer: 'FreeCodeCamp', year: '2024' }
    ],
    projects: [
      { name: 'Python CLI Data Scraper', description: 'Automated web scraper with BeautifulSoup parsing tabular datasets.', technologies: ['Python', 'BeautifulSoup'] },
      { name: 'Retail Store Inventory Database', description: 'Normalized relational schema with 8 tables and complex analytical SQL queries.', technologies: ['SQL', 'PostgreSQL'] }
    ]
  };

  await fetch('/api/learner/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(samplePayload)
  });

  await fetch('/api/career/change', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ learnerId: 'learner-001', targetCareerId: 'fullstack-developer' })
  });

  await fetchPipeline();
  document.querySelector('[data-tab="tab-career-matching"]').click();
  alert('Sample Scenario Loaded! Target: Full Stack Developer. Current: Python, SQL, HTML. Missing: JavaScript, React, Node.js.');
}

// Demo Action 2: Simulate Assessment Failure -> Adaptive Remediation
async function runDemoAssessmentFail() {
  // Simulate Alex scoring 33% on JavaScript quiz
  const res = await fetch('/api/assessment/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      learnerId: 'learner-001',
      skillName: 'JavaScript',
      answers: [0, 0, 0] // Wrong answers to trigger < 70%
    })
  });

  await res.json();
  await fetchPipeline();
  document.querySelector('[data-tab="tab-roadmap"]').click();
  alert('⚡ Adaptive Intervention Triggered! Score was below 70%. The AdaptiveMentorAgent and CurriculumArchitectAgent have dynamically inserted prerequisite remediation modules at the top of the Roadmap tab!');
}

// Demo Action 3: Pivot Career Target to AI/ML Engineer
async function runDemoGoalChange() {
  await fetch('/api/career/change', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ learnerId: 'learner-001', targetCareerId: 'ai-ml-engineer' })
  });

  await fetchPipeline();
  document.querySelector('[data-tab="tab-career-matching"]').click();
  alert('🔄 Career Goal Pivoted to AI/ML Engineer! Notice how Python & SQL instantly shifted to Mastered Skills and readiness recalculates dynamically!');
}
