# 🚀 SkillForge AI
### Autonomous Multi-Agent Personalized Learning & Career Pathing Platform
**Final Year Engineering Capstone Project**

[![Node.js](https://img.shields.io/badge/Node.js-v24+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Architecture](https://img.shields.io/badge/Architecture-Multi--Agent_Swarm_(MAS)-6366f1)](#multi-agent-system-architecture)
[![Sample Scenario](https://img.shields.io/badge/Sample_Scenario-Full_Stack_Developer-06b6d4)](#sample-scenario-walkthrough)
[![Status](https://img.shields.io/badge/Status-Complete_&_Verified-10b981)](#how-to-run-the-project)

---

## 📖 Executive Summary
Traditional learning platforms provide rigid, one-size-fits-all courses that ignore a learner's existing skills, prior project experience, and individual career goals. **SkillForge AI** solves this problem using a collaborative team of **5 specialized autonomous AI agents** that analyze skills, identify gaps against real-world job roles, generate personalized learning roadmaps, administer diagnostic assessments, and dynamically adjust recommendations in real time.

---

## 🌟 The 6 Core Features & File Architecture

Every feature specified in the problem statement is implemented uniquely with its own dedicated agent, controller, and UI view:

```
SkillForgeAI/
├── server.js                        # Native high-performance HTTP API & Static Server (Zero npm bloat!)
├── package.json
├── README.md
├── src/
│   ├── config/
│   │   └── careerTaxonomy.js        # Feature 3: Career roles (Full Stack, AI/ML, DevOps, Data Eng)
│   ├── data/
│   │   ├── learnersStore.json       # Feature 1: Persistent learner profiles & progress
│   │   ├── resourcesCatalog.json    # Feature 4: Curated courses, docs, tutorials & projects
│   │   └── assessmentBank.json      # Feature 5: Diagnostic questions & remediation topics
│   ├── agents/
│   │   ├── AgentBus.js              # Blackboard communication bus & deliberation logger
│   │   ├── SkillProfilerAgent.js    # Feature 1 & 2: Skill auditor, strengths/weaknesses classifier
│   │   ├── CareerMatcherAgent.js    # Feature 3: Job role gap comparator & readiness scorer
│   │   ├── CurriculumArchitectAgent.js # Feature 4: Dynamic personalized roadmap synthesizer
│   │   ├── AssessmentEvaluatorAgent.js # Feature 5: Diagnostic quiz engine & grading telemetry
│   │   └── AdaptiveMentorAgent.js   # Feature 6: Conversational advisor & adaptive re-planner
│   ├── services/
│   │   └── OrchestratorService.js   # Multi-Agent orchestrator coordinating the agent swarm
│   └── routes/
│       └── apiRouter.js             # REST API endpoint handler
├── public/                          # Front-End Single-Page Application (SPA)
│   ├── index.html                   # 6 Dedicated feature workspaces + Viva demo quick-pills
│   ├── css/
│   │   └── styles.css               # Modern dark-mode aesthetic, badges, radar metrics
│   └── js/
│       └── app.js                   # Client state management, real-time polling & telemetry
├── docs/
│   ├── PROJECT_REPORT.md            # Comprehensive Academic Project Report (SRS, Architecture, Math)
│   └── VIVA_VOCE_GUIDE.md           # Top 20 Viva Voce questions & answers for project defense
└── python_reference/                # Python multi-agent reference implementation for academic submission
    ├── requirements.txt
    ├── agents.py
    └── main.py
```

---

## ⚡ How to Run the Project (Zero Setup Headache)

The application is built using **pure Node.js** without any external dependencies, meaning it starts in **under 1 second** on any machine!

### Step 1: Open Terminal in the Project Directory
```powershell
cd C:\Users\ASUS\.gemini\antigravity\scratch\SkillForgeAI
```

### Step 2: Start the Server
```powershell
node server.js
```

### Step 3: Open in Your Browser
Navigate to:
```
http://localhost:3000
```

---

## 🎯 Sample Scenario Walkthrough (Live Viva Demo)

SkillForge AI comes pre-seeded with the exact scenario from your project problem statement:

- **Learner**: Alex Chen (Senior CS Student)
- **Existing Skills**: Python (Level 3), SQL (Level 3), basic HTML/CSS (Level 2)
- **Certifications**: Python for Everybody (Coursera), Relational Databases (FreeCodeCamp)
- **Projects**: Python CLI Data Scraper, Store Inventory SQL Database
- **Target Career**: **Full Stack Developer**

### What the Multi-Agent System Does:
1. **Skill Analysis**: `SkillProfilerAgent` identifies Python and SQL as established strengths (Level 3/5) and HTML as a foundational area.
2. **Career Gap Detection**: `CareerMatcherAgent` compares Alex against Full Stack benchmarks and identifies that **JavaScript, React, and Node.js** are completely missing. Readiness Score: **42%**.
3. **Personalized Roadmap**: `CurriculumArchitectAgent` synthesizes a 7-phase chronological roadmap spanning **~75 hours** (~7 weeks at 12 hrs/week).
4. **Adaptive Remediation Trigger**: When Alex takes a JavaScript quiz in Tab 5 and scores below 70%, the `AdaptiveMentorAgent` automatically intercepts the score and dynamically prepends targeted remediation micro-labs to his roadmap!
5. **Career Goal Pivot**: If Alex switches to **AI/Machine Learning Engineer** via the top button, the agents instantly recalculate: Python and SQL become 90%+ matching assets, and the roadmap re-synthesizes for ML!

---

## 📚 Complete Project Documentation Included
- 📄 **Full Capstone Project Report**: Available in [docs/PROJECT_REPORT.md](docs/PROJECT_REPORT.md)
- 🎓 **Viva Voce Q&A Cheat Sheet**: Available in [docs/VIVA_VOCE_GUIDE.md](docs/VIVA_VOCE_GUIDE.md)
- 🐍 **Python Multi-Agent Reference Code**: Available in [python_reference/main.py](python_reference/main.py)
