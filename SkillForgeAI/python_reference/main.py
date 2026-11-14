"""
SkillForge AI - Multi-Agent Simulation Pipeline
Demonstrates the Sample Scenario:
Student Alex Chen (Python, SQL, HTML) targeting Full Stack Developer.
Simulates:
1. Multi-agent gap detection (missing JavaScript, React, Node.js)
2. Personalized roadmap synthesis
3. Dynamic adaptive intervention on low assessment score
"""

from agents import (
    AgentBus, SkillItem, LearnerProfile,
    SkillProfilerAgent, CareerMatcherAgent,
    CurriculumArchitectAgent, AssessmentEvaluatorAgent,
    AdaptiveMentorAgent
)

def run_simulation():
    print("=" * 65)
    print("🚀 SkillForge AI - Multi-Agent Academic Simulation Pipeline")
    print("=" * 65)

    bus = AgentBus()

    # Benchmark taxonomy
    taxonomy = {
        "Full Stack Developer": {
            "required_skills": [
                {"name": "JavaScript", "level": 4, "weight": 1.0},
                {"name": "React", "level": 4, "weight": 1.0},
                {"name": "Node.js", "level": 4, "weight": 1.0},
                {"name": "HTML & CSS", "level": 3, "weight": 0.8},
                {"name": "SQL", "level": 3, "weight": 0.9},
                {"name": "Python", "level": 2, "weight": 0.6}
            ]
        }
    }

    # Instantiate the 5 specialized agents
    profiler = SkillProfilerAgent(bus)
    matcher = CareerMatcherAgent(bus, taxonomy)
    architect = CurriculumArchitectAgent(bus)
    evaluator = AssessmentEvaluatorAgent(bus)
    mentor = AdaptiveMentorAgent(bus)

    # 1. Initialize Sample Scenario Student: Alex Chen
    alex = LearnerProfile(
        id="alex-001",
        name="Alex Chen",
        target_career="Full Stack Developer",
        existing_skills=[
            SkillItem("Python", 3, "Backend", verified=True),
            SkillItem("SQL", 3, "Databases", verified=True),
            SkillItem("HTML & CSS", 2, "Frontend", verified=True)
        ],
        certifications=[{"title": "Python for Everybody", "issuer": "Coursera"}],
        projects=[{"name": "CLI Data Scraper", "tech": ["Python", "BeautifulSoup"]}]
    )

    # 2. Agent 1 audits learner
    audit = profiler.audit(alex)
    print(f"\n[Audit Result] Strengths: {audit['strengths']} | Weaknesses: {audit['weaknesses']}")

    # 3. Agent 2 matches career & finds gaps
    gap_report = matcher.match(alex, "Full Stack Developer")
    print(f"\n[Gap Analysis] Readiness: {gap_report['readiness_score']}%")
    print(f"Missing Critical Skills: {gap_report['missing_critical']}")
    print(f"Mastered Skills: {gap_report['mastered']}")

    # 4. Agent 3 builds personalized roadmap
    roadmap = architect.build_roadmap(gap_report, alex.active_remediations)
    print(f"\n[Personalized Roadmap] {len(roadmap)} Milestones Synthesized:")
    for i, m in enumerate(roadmap, 1):
        print(f"  Phase {i}: {m['title']} (~{m['estimated_hours']} hrs)")

    # 5. Agent 4 runs assessment & Agent 5 reacts to low score
    print("\n--- Simulating Assessment Struggle (JavaScript: Score 33% < 70%) ---")
    quiz_result = evaluator.evaluate("JavaScript", answers=[0, 0, 1], correct_key=[1, 1, 1])
    if quiz_result["remediation_needed"]:
        print("⚡ Assessment Evaluator triggered REMEDIATION DEFICIT signal on Blackboard.")
        alex.active_remediations.append({"skill": "JavaScript", "topic": "Async Event Loop & Promises"})
        
        # Adaptive re-synthesis
        updated_roadmap = architect.build_roadmap(gap_report, alex.active_remediations)
        print(f"\n[Adaptive Roadmap Re-planned] Top milestone is now:")
        print(f"  👉 {updated_roadmap[0]['title']}")

    # 6. Agent 5 answers student query
    response = mentor.advise(alex, "Why do I need Node.js if I know Python?", gap_report["missing_critical"])
    print(f"\n[AI Mentor Advice]:\n{response}\n")

if __name__ == "__main__":
    run_simulation()
