/**
 * Career Taxonomy and Competency Standards
 * Defines industry benchmarks, required skills, proficiency thresholds (1-5),
 * and priority tiers for career paths.
 */

const CAREER_TAXONOMY = {
  "fullstack-developer": {
    id: "fullstack-developer",
    title: "Full Stack Developer",
    domain: "Software Engineering & Web Development",
    description: "Builds comprehensive web applications spanning dynamic client-side interfaces, robust REST/GraphQL APIs, relational and NoSQL databases, and deployment pipelines.",
    requiredSkills: [
      { name: "JavaScript", category: "Core Languages", level: 4, weight: 1.0, critical: true },
      { name: "React", category: "Frontend Frameworks", level: 4, weight: 1.0, critical: true },
      { name: "Node.js", category: "Backend Runtime", level: 4, weight: 1.0, critical: true },
      { name: "HTML & CSS", category: "Web Basics", level: 3, weight: 0.8, critical: true },
      { name: "SQL", category: "Databases", level: 3, weight: 0.9, critical: true },
      { name: "Python", category: "Backend / Scripting", level: 2, weight: 0.6, critical: false },
      { name: "Git & Version Control", category: "DevOps & Tools", level: 3, weight: 0.7, critical: true },
      { name: "REST APIs", category: "Architecture", level: 4, weight: 0.9, critical: true }
    ],
    idealProfile: {
      minProjects: 2,
      typicalCertifications: ["AWS Certified Developer", "Meta Front-End Developer", "MongoDB Certified Developer"]
    }
  },

  "ai-ml-engineer": {
    id: "ai-ml-engineer",
    title: "AI / Machine Learning Engineer",
    domain: "Artificial Intelligence & Data Science",
    description: "Designs, trains, and deploys predictive machine learning and deep learning models, LLM systems, and automated data pipelines.",
    requiredSkills: [
      { name: "Python", category: "Core Languages", level: 5, weight: 1.0, critical: true },
      { name: "SQL", category: "Databases", level: 3, weight: 0.8, critical: true },
      { name: "Machine Learning (Scikit-Learn)", category: "AI/ML Core", level: 4, weight: 1.0, critical: true },
      { name: "Deep Learning (PyTorch/TensorFlow)", category: "AI/ML Core", level: 4, weight: 1.0, critical: true },
      { name: "Linear Algebra & Statistics", category: "Mathematics", level: 4, weight: 0.9, critical: true },
      { name: "Docker & Model Serving", category: "MLOps", level: 3, weight: 0.7, critical: false },
      { name: "LLMs & Agentic AI", category: "Advanced AI", level: 3, weight: 0.8, critical: false }
    ],
    idealProfile: {
      minProjects: 2,
      typicalCertifications: ["TensorFlow Developer Certificate", "AWS Certified Machine Learning", "DeepLearning.AI Specialization"]
    }
  },

  "cloud-devops-engineer": {
    id: "cloud-devops-engineer",
    title: "Cloud & DevOps Engineer",
    domain: "Cloud Infrastructure & Platform Reliability",
    description: "Automates CI/CD pipelines, manages scalable cloud infrastructure (AWS/GCP/Azure), containerization, and infrastructure as code.",
    requiredSkills: [
      { name: "Linux & Shell Scripting", category: "Operating Systems", level: 4, weight: 1.0, critical: true },
      { name: "Docker & Containers", category: "Containerization", level: 4, weight: 1.0, critical: true },
      { name: "Kubernetes", category: "Orchestration", level: 4, weight: 0.9, critical: true },
      { name: "AWS / Cloud Infrastructure", category: "Cloud", level: 4, weight: 1.0, critical: true },
      { name: "CI/CD Pipelines (GitHub Actions)", category: "DevOps", level: 4, weight: 0.9, critical: true },
      { name: "Python", category: "Scripting", level: 3, weight: 0.7, critical: false },
      { name: "Terraform / IaC", category: "Cloud", level: 3, weight: 0.8, critical: true }
    ],
    idealProfile: {
      minProjects: 2,
      typicalCertifications: ["AWS Solutions Architect", "Certified Kubernetes Administrator (CKA)", "Terraform Associate"]
    }
  },

  "data-engineer": {
    id: "data-engineer",
    title: "Data Engineer",
    domain: "Big Data & Analytical Systems",
    description: "Architects scalable data pipelines, ETL/ELT workflows, data warehouses, and distributed stream processing engines.",
    requiredSkills: [
      { name: "SQL", category: "Databases", level: 5, weight: 1.0, critical: true },
      { name: "Python", category: "Core Languages", level: 4, weight: 1.0, critical: true },
      { name: "Apache Spark / PySpark", category: "Big Data", level: 4, weight: 1.0, critical: true },
      { name: "Data Warehousing (Snowflake/BigQuery)", category: "Databases", level: 4, weight: 0.9, critical: true },
      { name: "Apache Airflow / ETL", category: "Pipelines", level: 4, weight: 0.9, critical: true },
      { name: "Data Modeling", category: "Architecture", level: 4, weight: 0.8, critical: true }
    ],
    idealProfile: {
      minProjects: 2,
      typicalCertifications: ["Databricks Certified Data Engineer", "Google Cloud Data Engineer"]
    }
  },

  "cybersecurity-analyst": {
    id: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    domain: "Information Security & Threat Analysis",
    description: "Monitors, detects, and investigates security vulnerabilities, safeguards network architectures, and implements security compliance protocols.",
    requiredSkills: [
      { name: "Networking Fundamentals (TCP/IP, DNS)", category: "Networking", level: 4, weight: 1.0, critical: true },
      { name: "Linux & Command Line", category: "Operating Systems", level: 4, weight: 0.9, critical: true },
      { name: "SIEM & Log Analysis", category: "SecOps", level: 4, weight: 1.0, critical: true },
      { name: "Ethical Hacking / Pentesting", category: "Security", level: 3, weight: 0.8, critical: false },
      { name: "Python", category: "Security Scripting", level: 3, weight: 0.7, critical: false },
      { name: "Vulnerability Assessment", category: "Auditing", level: 4, weight: 0.9, critical: true }
    ],
    idealProfile: {
      minProjects: 2,
      typicalCertifications: ["CompTIA Security+", "Certified Ethical Hacker (CEH)", "Cisco CyberOps"]
    }
  }
};

module.exports = {
  CAREER_TAXONOMY
};
