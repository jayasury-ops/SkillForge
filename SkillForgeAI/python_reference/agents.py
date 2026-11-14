"""
SkillForge AI - Agentic Architecture (Python Reference Implementation)
Contains the 5 specialized autonomous agents for university academic submission:
1. SkillProfilerAgent
2. CareerMatcherAgent
3. CurriculumArchitectAgent
4. AssessmentEvaluatorAgent
5. AdaptiveMentorAgent
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
import datetime

@dataclass
class SkillItem:
    name: str
    level: int  # 1 to 5
    category: str
    verified: bool = False

@dataclass
class LearnerProfile:
    id: str
    name: str
    target_career: str
    existing_skills: List[SkillItem]
    certifications: List[Dict[str, str]]
    projects: List[Dict[str, Any]]
    completed_milestones: List[str] = field(default_factory=list)
    active_remediations: List[Dict[str, Any]] = field(default_factory=list)

class AgentBus:
    """Shared blackboard memory and communication bus for collaborating agents."""
    def __init__(self):
        self.deliberation_log: List[Dict[str, Any]] = []
        self.blackboard: Dict[str, Any] = {}

    def log(self, agent_name: str, phase: str, message: str, payload: Optional[Dict] = None):
        entry = {
            "timestamp": datetime.datetime.now().isoformat(),
            "agent": agent_name,
            "phase": phase,
            "message": message,
            "payload": payload or {}
        }
        self.deliberation_log.append(entry)
        print(f"[{agent_name} | {phase}] {message}")

class SkillProfilerAgent:
    """Agent 1: Profiles learner capabilities, categorizing strengths and weaknesses."""
    def __init__(self, bus: AgentBus):
        self.bus = bus

    def audit(self, learner: LearnerProfile) -> Dict[str, Any]:
        self.bus.log("SkillProfilerAgent", "AUDIT", f"Auditing {learner.name} with {len(learner.existing_skills)} skills.")
        strengths = [s for s in learner.existing_skills if s.level >= 3]
        weaknesses = [s for s in learner.existing_skills if s.level < 3]
        return {
            "strengths": [s.name for s in strengths],
            "weaknesses": [s.name for s in weaknesses],
            "completeness": 85
        }

class CareerMatcherAgent:
    """Agent 2: Compares learner profile against target industry role benchmarks."""
    def __init__(self, bus: AgentBus, taxonomy: Dict[str, Any]):
        self.bus = bus
        self.taxonomy = taxonomy

    def match(self, learner: LearnerProfile, target_role: str) -> Dict[str, Any]:
        self.bus.log("CareerMatcherAgent", "MATCHING", f"Aligning {learner.name} to {target_role}.")
        reqs = self.taxonomy.get(target_role, {}).get("required_skills", [])
        learner_skills = {s.name.lower(): s.level for s in learner.existing_skills}
        
        missing_critical = []
        mastered = []
        earned_weight = 0.0
        total_weight = 0.0

        for r in reqs:
            name = r["name"]
            weight = r.get("weight", 1.0)
            target_lvl = r.get("level", 3)
            total_weight += weight
            user_lvl = learner_skills.get(name.lower(), 0)

            if user_lvl >= target_lvl:
                mastered.append(name)
                earned_weight += weight
            else:
                missing_critical.append(name)
                earned_weight += (user_lvl / target_lvl) * weight

        readiness = round((earned_weight / (total_weight or 1.0)) * 100)
        return {
            "target": target_role,
            "readiness_score": readiness,
            "missing_critical": missing_critical,
            "mastered": mastered
        }

class CurriculumArchitectAgent:
    """Agent 3: Synthesizes dynamic, sequenced roadmap milestones with exercises."""
    def __init__(self, bus: AgentBus):
        self.bus = bus

    def build_roadmap(self, gap_report: Dict[str, Any], active_remediations: List[Dict]) -> List[Dict[str, Any]]:
        self.bus.log("CurriculumArchitectAgent", "SYNTHESIS", f"Synthesizing roadmap for {gap_report['target']}.")
        milestones = []
        
        # Priority Phase: Remediation if any
        for rem in active_remediations:
            milestones.append({
                "title": f"[Adaptive Remediation] {rem.get('topic')}",
                "priority": "HIGH",
                "estimated_hours": 4
            })
            
        for skill in gap_report.get("missing_critical", []):
            milestones.append({
                "title": f"Master Core Competency: {skill}",
                "priority": "STANDARD",
                "estimated_hours": 15
            })
        
        milestones.append({
            "title": f"Capstone Integration Project for {gap_report['target']}",
            "priority": "CAPSTONE",
            "estimated_hours": 25
        })
        return milestones

class AssessmentEvaluatorAgent:
    """Agent 4: Diagnostic testing, grading, and deficit detection."""
    def __init__(self, bus: AgentBus):
        self.bus = bus

    def evaluate(self, skill: str, answers: List[int], correct_key: List[int]) -> Dict[str, Any]:
        correct = sum(1 for a, c in zip(answers, correct_key) if a == c)
        score = round((correct / (len(correct_key) or 1)) * 100)
        passed = score >= 70
        self.bus.log("AssessmentEvaluatorAgent", "EVALUATION", f"Graded {skill}: Score {score}% (Passed: {passed}).")
        return {
            "skill": skill,
            "score": score,
            "passed": passed,
            "remediation_needed": not passed
        }

class AdaptiveMentorAgent:
    """Agent 5: Conversational supervisor and real-time adaptive orchestrator."""
    def __init__(self, bus: AgentBus):
        self.bus = bus

    def advise(self, learner: LearnerProfile, query: str, missing_skills: List[str]) -> str:
        self.bus.log("AdaptiveMentorAgent", "ADVICE", f"Answering query: '{query}'")
        return (
            f"Hello {learner.name}! To become a {learner.target_career}, focus next on closing "
            f"your critical gaps: {', '.join(missing_skills)}. Stay consistent!"
        )
