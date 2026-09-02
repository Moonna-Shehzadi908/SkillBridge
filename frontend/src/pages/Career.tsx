import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  AlertCircle,
  BookOpen,
  PlayCircle,
  GraduationCap,
  FileText,
  ExternalLink,
  Route,
  CircleDot,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

const API_URL = "http://127.0.0.1:8000";

interface UserSkill {
  id: number;
  name: string;
  description?: string;
  category?: string;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  url: string;
  resource_type: "article" | "video" | "course" | "documentation";
  resource_type_display?: string;
  skill: number;
  skill_name: string;
  created_at: string;
  updated_at: string;
}

interface Career {
  id: number;
  title: string;
  description: string;
  required_skills: string[];
  average_salary: string | number | null;
  demand_level: "LOW" | "MEDIUM" | "HIGH";
  career_url: string | null;
  created_at?: string;
  updated_at?: string;

  match_percentage?: number;
  matched_skills_count?: number;
  required_skills_count?: number;
}

interface CareerRecommendationResponse {
  count: number;
  recommendations: Career[];
}

interface SkillGap {
  matchedSkills: string[];
  missingSkills: string[];
}

const normalizeSkill = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const getMatchLabel = (score: number) => {
  if (score >= 80) return "Excellent Match";
  if (score >= 60) return "Strong Match";
  if (score >= 40) return "Good Match";
  if (score > 0) return "Potential Match";
  return "No Match";
};

const getDemandLabel = (level: Career["demand_level"]) => {
  switch (level) {
    case "HIGH":
      return "High Demand";
    case "MEDIUM":
      return "Medium Demand";
    default:
      return "Growing Field";
  }
};

const formatSalary = (salary: Career["average_salary"]) => {
  if (salary === null || salary === undefined || salary === "") {
    return "Salary data unavailable";
  }

  const numericSalary = Number(salary);

  if (Number.isNaN(numericSalary)) {
    return String(salary);
  }

  return `PKR ${numericSalary.toLocaleString()}`;
};

const getDemandClass = (level: Career["demand_level"]) => {
  if (level === "HIGH") {
    return "demand-high";
  }

  if (level === "MEDIUM") {
    return "demand-medium";
  }

  return "demand-low";
};

const getResourceTypeLabel = (
  resource: Resource
) => {
  if (resource.resource_type_display) {
    return resource.resource_type_display;
  }

  switch (resource.resource_type) {
    case "video":
      return "Video";
    case "course":
      return "Course";
    case "documentation":
      return "Documentation";
    default:
      return "Article";
  }
};

const getResourceIcon = (
  resourceType: Resource["resource_type"]
) => {
  switch (resourceType) {
    case "video":
      return PlayCircle;
    case "course":
      return GraduationCap;
    case "documentation":
      return FileText;
    default:
      return BookOpen;
  }
};

export default function Career() {
  const navigate = useNavigate();

  const [careers, setCareers] = useState<Career[]>([]);
  const [aiResults, setAiResults] = useState<Career[]>([]);
  const [mySkills, setMySkills] = useState<UserSkill[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  const [loading, setLoading] = useState(true);
  const [mySkillsLoading, setMySkillsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [resourcesLoading, setResourcesLoading] = useState(false);

  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");
  const [resourcesError, setResourcesError] = useState("");

  const [aiHasRun, setAiHasRun] = useState(false);

  const accessToken = localStorage.getItem("access_token");

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    }),
    [accessToken]
  );

  const handleUnauthorized = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  const fetchCareers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/career/`, {
        headers: authHeaders,
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load career paths.");
      }

      const data = await response.json();

      setCareers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Career fetch error:", err);
      setError("Unable to load career paths right now.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMySkills = async () => {
    const response = await fetch(
      `${API_URL}/api/accounts/me/skills/`,
      {
        headers: authHeaders,
      }
    );

    if (response.status === 401) {
      handleUnauthorized();
      return [];
    }

    if (!response.ok) {
      throw new Error("Unable to load your saved skills.");
    }

    const data = await response.json();

    return Array.isArray(data) ? data : [];
  };

  const fetchResources = async () => {
    try {
      setResourcesLoading(true);
      setResourcesError("");

      const response = await fetch(
        `${API_URL}/api/resources/`,
        {
          headers: authHeaders,
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Unable to load learning resources."
        );
      }

      const data = await response.json();

      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Resources fetch error:", err);

      setResourcesError(
        "Learning resources are temporarily unavailable."
      );

      setResources([]);
    } finally {
      setResourcesLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
      return;
    }

    const loadMySkills = async () => {
      try {
        setMySkillsLoading(true);

        const response = await fetch(
          `${API_URL}/api/accounts/me/skills/`,
          {
            headers: authHeaders,
          }
        );

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Unable to load your saved skills."
          );
        }

        const data = await response.json();

        setMySkills(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "My skills fetch error:",
          err
        );
      } finally {
        setMySkillsLoading(false);
      }
    };

    fetchCareers();
    loadMySkills();
    fetchResources();
  }, [accessToken]);

  const getSkillGap = (
    career: Career
  ): SkillGap => {
    const userSkillNames = new Set(
      mySkills.map((skill) =>
        normalizeSkill(skill.name)
      )
    );

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    career.required_skills.forEach(
      (skill) => {
        const normalized =
          normalizeSkill(skill);

        if (userSkillNames.has(normalized)) {
          matchedSkills.push(skill);
        } else {
          missingSkills.push(skill);
        }
      }
    );

    return {
      matchedSkills,
      missingSkills,
    };
  };

  const getResourcesForSkill = (
    skillName: string
  ) => {
    const normalizedSkill =
      normalizeSkill(skillName);

    return resources
      .filter(
        (resource) =>
          normalizeSkill(
            resource.skill_name
          ) === normalizedSkill
      )
      .slice(0, 3);
  };

  const roadmapCareer = aiResults[0] ?? null;

  const roadmapGap = useMemo(() => {
    if (!roadmapCareer) {
      return {
        matchedSkills: [],
        missingSkills: [],
      };
    }

    return getSkillGap(roadmapCareer);
  }, [roadmapCareer, mySkills]);

  const roadmapResources = useMemo(() => {
    return roadmapGap.missingSkills.map(
      (skill) => ({
        skill,
        resources:
          getResourcesForSkill(skill),
      })
    );
  }, [roadmapGap.missingSkills, resources]);

  const runAICareerMatch = async () => {
    try {
      setAiLoading(true);
      setMySkillsLoading(true);
      setAiError("");

      const [
        skills,
        recommendationResponse,
      ] = await Promise.all([
        fetchMySkills(),
        fetch(
          `${API_URL}/api/career/recommendations/`,
          {
            headers: authHeaders,
          }
        ),
      ]);

      setMySkills(skills);
      setMySkillsLoading(false);

      if (
        recommendationResponse.status === 401
      ) {
        handleUnauthorized();
        return;
      }

      if (!recommendationResponse.ok) {
        throw new Error(
          "Unable to generate career recommendations."
        );
      }

      const data: CareerRecommendationResponse =
        await recommendationResponse.json();

      setAiResults(
        Array.isArray(data.recommendations)
          ? data.recommendations
          : []
      );

      setAiHasRun(true);
    } catch (err) {
      console.error(
        "AI career match error:",
        err
      );

      setAiError(
        err instanceof Error
          ? err.message
          : "Unable to generate career recommendations."
      );

      setAiResults([]);
      setAiHasRun(true);
    } finally {
      setAiLoading(false);
      setMySkillsLoading(false);
    }
  };

  const topAIMatches = aiResults.slice(0, 3);

  const averageMatch = useMemo(() => {
    if (!aiResults.length) return 0;

    const total = aiResults.reduce(
      (sum, career) =>
        sum +
        (career.match_percentage ?? 0),
      0
    );

    return Math.round(
      total / aiResults.length
    );
  }, [aiResults]);

  return (
    <div className="career-page">
      <style>{`
        .career-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(99, 102, 241, 0.08), transparent 30%),
            radial-gradient(circle at top right, rgba(16, 185, 129, 0.07), transparent 28%),
            var(--bg);
          color: var(--text);
        }

        .career-container {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
        }

        .career-header {
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(18px);
          background: color-mix(in srgb, var(--bg) 86%, transparent);
          border-bottom: 1px solid var(--border);
        }

        .career-nav {
          min-height: 74px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 11px;
          color: var(--text-heading);
          font-weight: 800;
          text-decoration: none;
          font-size: 1.1rem;
        }

        .brand-icon {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: linear-gradient(135deg, var(--primary), #8b5cf6);
          color: white;
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.22);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-link {
          color: var(--text);
          text-decoration: none;
          font-weight: 600;
          padding: 9px 13px;
          border-radius: 10px;
          transition: 0.2s ease;
        }

        .nav-link:hover {
          color: var(--primary);
          background: var(--primary-soft);
        }

        .hero {
          padding: 72px 0 45px;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 35px;
          align-items: center;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 13px;
          border-radius: 999px;
          background: var(--primary-soft);
          color: var(--primary);
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          margin-bottom: 18px;
        }

        .hero h1 {
          margin: 0;
          color: var(--text-heading);
          font-size: clamp(2.4rem, 5vw, 4.4rem);
          line-height: 1.03;
          letter-spacing: -0.045em;
          font-weight: 900;
        }

        .gradient-text {
          background: linear-gradient(135deg, var(--primary), #8b5cf6, #06b6d4);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero-description {
          max-width: 680px;
          margin: 22px 0 28px;
          font-size: 1.05rem;
          line-height: 1.8;
          opacity: 0.82;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 13px;
        }

        .primary-button,
        .secondary-button {
          border: 0;
          border-radius: 13px;
          padding: 13px 18px;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          text-decoration: none;
          transition: 0.2s ease;
        }

        .primary-button {
          color: white;
          background: linear-gradient(135deg, var(--primary), #7c3aed);
          box-shadow: 0 12px 28px rgba(99, 102, 241, 0.2);
        }

        .primary-button:hover {
          transform: translateY(-2px);
        }

        .primary-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .secondary-button {
          color: var(--text-heading);
          background: var(--surface);
          border: 1px solid var(--border);
        }

        .secondary-button:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .hero-visual {
          position: relative;
          min-height: 320px;
          border: 1px solid var(--border);
          border-radius: 30px;
          padding: 25px;
          background:
            linear-gradient(145deg, color-mix(in srgb, var(--surface) 95%, transparent), color-mix(in srgb, var(--primary-soft) 55%, var(--surface)));
          box-shadow: 0 25px 70px rgba(15, 23, 42, 0.08);
          overflow: hidden;
        }

        .orb {
          position: absolute;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.14));
          filter: blur(4px);
          top: -60px;
          right: -40px;
        }

        .visual-card {
          position: relative;
          z-index: 2;
          padding: 22px;
          border-radius: 21px;
          background: var(--surface);
          border: 1px solid var(--border);
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.07);
          margin-bottom: 14px;
        }

        .visual-card:last-child {
          margin-bottom: 0;
        }

        .visual-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 17px;
        }

        .visual-title {
          color: var(--text-heading);
          font-weight: 800;
        }

        .score-ring {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: conic-gradient(var(--primary) 82%, var(--border) 0);
          position: relative;
        }

        .score-ring::after {
          content: "";
          position: absolute;
          inset: 6px;
          background: var(--surface);
          border-radius: 50%;
        }

        .score-ring span {
          position: relative;
          z-index: 1;
          font-size: 0.8rem;
          font-weight: 900;
          color: var(--text-heading);
        }

        .mini-bars {
          display: grid;
          gap: 10px;
        }

        .mini-bar {
          height: 9px;
          border-radius: 999px;
          background: var(--border);
          overflow: hidden;
        }

        .mini-bar span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, var(--primary), #06b6d4);
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin: 15px 0 55px;
        }

        .stat-card {
          padding: 21px;
          border: 1px solid var(--border);
          border-radius: 18px;
          background: var(--surface);
        }

        .stat-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: var(--primary-soft);
          color: var(--primary);
          margin-bottom: 14px;
        }

        .stat-value {
          color: var(--text-heading);
          font-size: 1.45rem;
          font-weight: 900;
        }

        .stat-label {
          margin-top: 3px;
          opacity: 0.68;
          font-size: 0.88rem;
        }

        .section {
          padding: 15px 0 70px;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 20px;
          margin-bottom: 22px;
        }

        .section-heading h2 {
          margin: 0;
          color: var(--text-heading);
          font-size: clamp(1.65rem, 3vw, 2.25rem);
          font-weight: 900;
          letter-spacing: -0.025em;
        }

        .section-heading p {
          margin: 8px 0 0;
          max-width: 680px;
          line-height: 1.7;
          opacity: 0.7;
        }

        .ai-panel {
          border: 1px solid var(--border);
          border-radius: 27px;
          padding: 27px;
          background:
            linear-gradient(
              145deg,
              color-mix(in srgb, var(--primary-soft) 75%, var(--surface)),
              var(--surface)
            );
          box-shadow: 0 22px 55px rgba(15, 23, 42, 0.06);
          margin-bottom: 25px;
        }

        .ai-panel-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .ai-title-wrap {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }

        .ai-icon {
          width: 50px;
          height: 50px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background: linear-gradient(135deg, var(--primary), #8b5cf6);
          color: white;
          box-shadow: 0 12px 28px rgba(99, 102, 241, 0.2);
        }

        .ai-panel h3 {
          margin: 0;
          color: var(--text-heading);
          font-size: 1.25rem;
          font-weight: 900;
        }

        .ai-panel p {
          margin: 6px 0 0;
          line-height: 1.7;
          opacity: 0.72;
        }

        .refresh-button {
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text-heading);
          padding: 10px 13px;
          border-radius: 11px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
        }

        .refresh-button:hover {
          color: var(--primary);
          border-color: var(--primary);
        }

        .ai-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 13px;
          margin-top: 22px;
        }

        .summary-box {
          padding: 15px;
          border: 1px solid var(--border);
          border-radius: 15px;
          background: color-mix(in srgb, var(--surface) 78%, transparent);
        }

        .summary-box strong {
          display: block;
          color: var(--text-heading);
          font-size: 1.15rem;
        }

        .summary-box span {
          display: block;
          margin-top: 4px;
          font-size: 0.8rem;
          opacity: 0.65;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 17px;
          margin-top: 20px;
        }

        .career-card {
          position: relative;
          border: 1px solid var(--border);
          border-radius: 22px;
          padding: 21px;
          background: var(--surface);
          transition: 0.22s ease;
          overflow: hidden;
        }

        .career-card:hover {
          transform: translateY(-4px);
          border-color: color-mix(in srgb, var(--primary) 45%, var(--border));
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
        }

        .career-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .career-card h3 {
          margin: 0;
          color: var(--text-heading);
          font-size: 1.1rem;
          font-weight: 900;
        }

        .score-pill {
          flex: 0 0 auto;
          padding: 7px 10px;
          border-radius: 999px;
          background: var(--primary-soft);
          color: var(--primary);
          font-weight: 900;
          font-size: 0.82rem;
        }

        .match-label {
          margin-top: 6px;
          font-size: 0.78rem;
          font-weight: 700;
          opacity: 0.65;
        }

        .career-description {
          margin: 14px 0;
          font-size: 0.88rem;
          line-height: 1.7;
          opacity: 0.72;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .progress-track {
          height: 8px;
          border-radius: 999px;
          background: var(--border);
          overflow: hidden;
          margin: 14px 0 17px;
        }

        .progress-value {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, var(--primary), #06b6d4);
        }

        .alignment-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.78rem;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .alignment-title span:last-child {
          opacity: 0.6;
        }

        .skills-group {
          margin-top: 15px;
        }

        .skills-group-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.77rem;
          font-weight: 900;
          margin-bottom: 8px;
        }

        .skills-group-title.matched {
          color: #059669;
        }

        .skills-group-title.missing {
          color: #d97706;
        }

        .skill-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .skill-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
        }

        .skill-chip.matched {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
        }

        .skill-chip.missing {
          background: rgba(245, 158, 11, 0.11);
          color: #b45309;
        }

        .empty-skills {
          font-size: 0.76rem;
          opacity: 0.58;
        }

        .card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 17px;
        }

        .meta-pill {
          padding: 6px 9px;
          border-radius: 9px;
          background: var(--primary-soft);
          color: var(--text);
          font-size: 0.72rem;
          font-weight: 700;
        }

        .demand-high {
          color: #059669;
        }

        .demand-medium {
          color: #b45309;
        }

        .demand-low {
          color: var(--primary);
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 19px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .card-link {
          color: var(--primary);
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .card-link:hover {
          text-decoration: underline;
        }

        .gap-action {
          color: #b45309;
          text-decoration: none;
          font-size: 0.78rem;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .empty-state,
        .error-state {
          padding: 35px 20px;
          text-align: center;
          border: 1px dashed var(--border);
          border-radius: 21px;
          background: var(--surface);
        }

        .empty-state h3,
        .error-state h3 {
          margin: 12px 0 6px;
          color: var(--text-heading);
        }

        .empty-state p,
        .error-state p {
          max-width: 570px;
          margin: 0 auto 18px;
          line-height: 1.7;
          opacity: 0.7;
        }

        .error-state {
          border-color: rgba(239, 68, 68, 0.25);
        }

        .error-icon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          margin: 0 auto;
          border-radius: 12px;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .loading-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 17px;
        }

        .skeleton {
          height: 285px;
          border-radius: 22px;
          background:
            linear-gradient(
              90deg,
              var(--surface),
              var(--primary-soft),
              var(--surface)
            );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border: 1px solid var(--border);
        }

        /* =========================
           Learning Roadmap
        ========================= */

        .roadmap-section {
          margin-top: 42px;
        }

        .roadmap-shell {
          position: relative;
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 28px;
          padding: 28px;
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(139, 92, 246, 0.11),
              transparent 32%
            ),
            radial-gradient(
              circle at 0% 100%,
              rgba(6, 182, 212, 0.08),
              transparent 28%
            ),
            var(--surface);
          box-shadow: 0 24px 65px rgba(15, 23, 42, 0.07);
        }

        .roadmap-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 25px;
        }

        .roadmap-title-wrap {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .roadmap-icon {
          width: 50px;
          height: 50px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background: linear-gradient(
            135deg,
            #06b6d4,
            var(--primary)
          );
          color: white;
          box-shadow: 0 12px 28px rgba(6, 182, 212, 0.18);
        }

        .roadmap-header h3 {
          margin: 0;
          color: var(--text-heading);
          font-size: 1.3rem;
          font-weight: 900;
        }

        .roadmap-header p {
          margin: 6px 0 0;
          max-width: 690px;
          line-height: 1.7;
          opacity: 0.7;
        }

        .roadmap-career-pill {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 12px;
          border-radius: 999px;
          background: var(--primary-soft);
          color: var(--primary);
          font-size: 0.76rem;
          font-weight: 900;
        }

        .roadmap-progress {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 15px;
          margin-bottom: 28px;
          padding: 16px;
          border: 1px solid var(--border);
          border-radius: 17px;
          background: color-mix(
            in srgb,
            var(--primary-soft) 45%,
            var(--surface)
          );
        }

        .roadmap-progress-label {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 8px;
          font-size: 0.78rem;
          font-weight: 800;
        }

        .roadmap-progress-label span:last-child {
          color: var(--primary);
        }

        .roadmap-progress-track {
          height: 9px;
          overflow: hidden;
          border-radius: 999px;
          background: var(--border);
        }

        .roadmap-progress-value {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(
            90deg,
            #06b6d4,
            var(--primary),
            #8b5cf6
          );
        }

        .roadmap-step {
          position: relative;
          display: grid;
          grid-template-columns: 48px 1fr;
          gap: 17px;
          padding-bottom: 25px;
        }

        .roadmap-step:last-child {
          padding-bottom: 0;
        }

        .roadmap-step:not(:last-child)::after {
          content: "";
          position: absolute;
          left: 23px;
          top: 48px;
          bottom: 3px;
          width: 2px;
          background: linear-gradient(
            180deg,
            var(--primary),
            var(--border)
          );
        }

        .roadmap-number {
          position: relative;
          z-index: 2;
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          color: white;
          background: linear-gradient(
            135deg,
            var(--primary),
            #8b5cf6
          );
          font-size: 0.85rem;
          font-weight: 900;
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.2);
        }

        .roadmap-step-content {
          min-width: 0;
        }

        .roadmap-skill-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-heading);
          font-size: 1.05rem;
          font-weight: 900;
          margin: 3px 0 12px;
        }

        .roadmap-skill-title svg {
          color: #d97706;
        }

        .resource-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 11px;
        }

        .resource-card {
          display: flex;
          flex-direction: column;
          min-width: 0;
          padding: 15px;
          border: 1px solid var(--border);
          border-radius: 15px;
          background: color-mix(
            in srgb,
            var(--surface) 90%,
            var(--primary-soft)
          );
          transition: 0.2s ease;
        }

        .resource-card:hover {
          transform: translateY(-2px);
          border-color: color-mix(
            in srgb,
            var(--primary) 35%,
            var(--border)
          );
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
        }

        .resource-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 11px;
        }

        .resource-type {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          border-radius: 8px;
          background: var(--primary-soft);
          color: var(--primary);
          font-size: 0.67rem;
          font-weight: 800;
        }

        .resource-skill {
          font-size: 0.68rem;
          opacity: 0.55;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .resource-card h4 {
          margin: 0;
          color: var(--text-heading);
          font-size: 0.86rem;
          line-height: 1.45;
          font-weight: 850;
        }

        .resource-card p {
          margin: 8px 0 14px;
          font-size: 0.73rem;
          line-height: 1.6;
          opacity: 0.65;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .resource-open {
          margin-top: auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 10px;
          border-radius: 9px;
          background: var(--primary-soft);
          color: var(--primary);
          text-decoration: none;
          font-size: 0.72rem;
          font-weight: 850;
          transition: 0.2s ease;
        }

        .resource-open:hover {
          background: var(--primary);
          color: white;
        }

        .no-resource {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 15px;
          border: 1px dashed var(--border);
          border-radius: 14px;
          background: color-mix(
            in srgb,
            var(--surface) 92%,
            var(--primary-soft)
          );
        }

        .no-resource-text {
          display: flex;
          align-items: flex-start;
          gap: 9px;
        }

        .no-resource-text svg {
          flex: 0 0 auto;
          margin-top: 2px;
          color: var(--primary);
        }

        .no-resource strong {
          display: block;
          color: var(--text-heading);
          font-size: 0.78rem;
        }

        .no-resource span {
          display: block;
          margin-top: 3px;
          font-size: 0.7rem;
          opacity: 0.62;
        }

        .browse-resources {
          flex: 0 0 auto;
          color: var(--primary);
          text-decoration: none;
          font-size: 0.72rem;
          font-weight: 850;
        }

        .browse-resources:hover {
          text-decoration: underline;
        }

        .roadmap-success {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 19px;
          border-radius: 17px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.18);
        }

        .roadmap-success-icon {
          width: 43px;
          height: 43px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
        }

        .roadmap-success strong {
          color: #047857;
          display: block;
          font-size: 0.9rem;
        }

        .roadmap-success span {
          display: block;
          margin-top: 3px;
          font-size: 0.74rem;
          opacity: 0.7;
        }

        .roadmap-loading {
          display: grid;
          gap: 12px;
        }

        .roadmap-loading-line {
          height: 85px;
          border-radius: 15px;
          border: 1px solid var(--border);
          background:
            linear-gradient(
              90deg,
              var(--surface),
              var(--primary-soft),
              var(--surface)
            );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .roadmap-error {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 12px;
          font-size: 0.75rem;
          opacity: 0.62;
        }

        .roadmap-error svg {
          color: #d97706;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }

          100% {
            background-position: -200% 0;
          }
        }

        .cta {
          margin: 15px 0 70px;
          padding: 34px;
          border-radius: 25px;
          background: linear-gradient(135deg, var(--primary), #7c3aed);
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          box-shadow: 0 24px 55px rgba(99, 102, 241, 0.2);
        }

        .cta h2 {
          margin: 0 0 7px;
          font-size: 1.55rem;
          font-weight: 900;
        }

        .cta p {
          margin: 0;
          opacity: 0.88;
        }

        .cta-button {
          color: var(--primary);
          background: white;
          text-decoration: none;
          padding: 12px 16px;
          border-radius: 12px;
          font-weight: 900;
          white-space: nowrap;
        }

        .footer {
          padding: 25px 0 35px;
          border-top: 1px solid var(--border);
          opacity: 0.7;
          font-size: 0.82rem;
        }

        .spin {
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 950px) {
          .hero-grid {
            grid-template-columns: 1fr;
          }

          .results-grid,
          .loading-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .resource-list {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 700px) {
          .career-container {
            width: min(100% - 24px, 1180px);
          }

          .career-nav {
            min-height: 64px;
          }

          .nav-link {
            display: none;
          }

          .hero {
            padding-top: 45px;
          }

          .stats,
          .results-grid,
          .loading-grid,
          .ai-summary,
          .resource-list {
            grid-template-columns: 1fr;
          }

          .ai-panel-top,
          .section-heading,
          .cta,
          .roadmap-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-visual {
            min-height: auto;
          }

          .cta-button {
            width: 100%;
            text-align: center;
          }

          .roadmap-shell {
            padding: 20px;
          }

          .roadmap-progress {
            grid-template-columns: 1fr;
          }

          .no-resource {
            flex-direction: column;
            align-items: flex-start;
          }

          .browse-resources {
            margin-left: 28px;
          }
        }
      `}</style>

      {/* Header */}
      <header className="career-header">
        <div className="career-container career-nav">
          <Link to="/" className="brand">
            <span className="brand-icon">
              <BrainCircuit size={21} />
            </span>
            SkillBridge
          </Link>

          <div className="nav-actions">
            <Link to="/skills" className="nav-link">
              Skills
            </Link>

            <Link to="/career" className="nav-link">
              Career
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="hero">
          <div className="career-container hero-grid">
            <div>
              <div className="eyebrow">
                <Sparkles size={15} />
                Smart Career Intelligence
              </div>

              <h1>
                Find the career that
                <br />
                <span className="gradient-text">
                  fits your skills.
                </span>
              </h1>

              <p className="hero-description">
                Explore career paths and discover how closely your current
                SkillBridge skills align with the abilities employers look for.
                Get practical insight into what you already know and what you
                can learn next.
              </p>

              <div className="hero-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={runAICareerMatch}
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="spin"
                      />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BrainCircuit size={17} />
                      {aiHasRun
                        ? "Refresh Career Match"
                        : "Run Career Match"}
                    </>
                  )}
                </button>

                <Link
                  to="/skills"
                  className="secondary-button"
                >
                  Manage My Skills
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="hero-visual">
              <div className="orb" />

              <div className="visual-card">
                <div className="visual-top">
                  <div>
                    <div className="visual-title">
                      Career Match
                    </div>

                    <div
                      style={{
                        fontSize: "0.76rem",
                        opacity: 0.62,
                        marginTop: 3,
                      }}
                    >
                      Based on your saved skills
                    </div>
                  </div>

                  <div className="score-ring">
                    <span>
                      {aiHasRun
                        ? `${averageMatch}%`
                        : "AI"}
                    </span>
                  </div>
                </div>

                <div className="mini-bars">
                  <div className="mini-bar">
                    <span
                      style={{
                        width: `${
                          aiHasRun
                            ? averageMatch
                            : 82
                        }%`,
                      }}
                    />
                  </div>

                  <div className="mini-bar">
                    <span
                      style={{
                        width: "68%",
                      }}
                    />
                  </div>

                  <div className="mini-bar">
                    <span
                      style={{
                        width: "91%",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="visual-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Target
                    size={19}
                    color="var(--primary)"
                  />

                  <div>
                    <div className="visual-title">
                      Skill Gap Analysis
                    </div>

                    <div
                      style={{
                        fontSize: "0.76rem",
                        opacity: 0.62,
                        marginTop: 3,
                      }}
                    >
                      See exactly what to learn next
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="career-container">
          <div className="stats">
            <div className="stat-card">
              <div className="stat-icon">
                <Target size={19} />
              </div>

              <div className="stat-value">
                {careers.length}
              </div>

              <div className="stat-label">
                Career paths available
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Zap size={19} />
              </div>

              <div className="stat-value">
                {mySkillsLoading
                  ? "..."
                  : mySkills.length}
              </div>

              <div className="stat-label">
                Skills in your profile
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp size={19} />
              </div>

              <div className="stat-value">
                {aiHasRun
                  ? `${averageMatch}%`
                  : "—"}
              </div>

              <div className="stat-label">
                Average career match
              </div>
            </div>
          </div>
        </section>

        {/* AI Career Match */}
        <section className="section">
          <div className="career-container">
            <div className="section-heading">
              <div>
                <h2>AI Career Match</h2>

                <p>
                  Your recommendations use the skills currently saved to your
                  SkillBridge profile. The match percentage comes directly from
                  the career recommendation service.
                </p>
              </div>
            </div>

            <div className="ai-panel">
              <div className="ai-panel-top">
                <div className="ai-title-wrap">
                  <div className="ai-icon">
                    <BrainCircuit size={24} />
                  </div>

                  <div>
                    <h3>
                      Personalized Career Intelligence
                    </h3>

                    <p>
                      Compare your current skills against the requirements of
                      available career paths and identify the skills that could
                      strengthen your profile.
                    </p>
                  </div>
                </div>

                {aiHasRun && (
                  <button
                    type="button"
                    className="refresh-button"
                    onClick={runAICareerMatch}
                    disabled={aiLoading}
                  >
                    <RefreshCw
                      size={15}
                      className={
                        aiLoading
                          ? "spin"
                          : ""
                      }
                    />
                    Refresh
                  </button>
                )}
              </div>

              {aiHasRun && !aiError && (
                <div className="ai-summary">
                  <div className="summary-box">
                    <strong>
                      {aiResults.length}
                    </strong>
                    <span>
                      Career matches found
                    </span>
                  </div>

                  <div className="summary-box">
                    <strong>
                      {mySkills.length}
                    </strong>
                    <span>
                      Your saved skills analyzed
                    </span>
                  </div>

                  <div className="summary-box">
                    <strong>
                      {averageMatch}%
                    </strong>
                    <span>
                      Average match across results
                    </span>
                  </div>
                </div>
              )}
            </div>

            {aiError && (
              <div className="error-state">
                <div className="error-icon">
                  <AlertCircle size={21} />
                </div>

                <h3>
                  Career analysis unavailable
                </h3>

                <p>{aiError}</p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={runAICareerMatch}
                >
                  Try Again
                </button>
              </div>
            )}

            {aiLoading && (
              <div className="loading-grid">
                <div className="skeleton" />
                <div className="skeleton" />
                <div className="skeleton" />
              </div>
            )}

            {!aiLoading &&
              aiHasRun &&
              !aiError &&
              topAIMatches.length > 0 && (
                <div className="results-grid">
                  {topAIMatches.map(
                    (career) => {
                      const score =
                        career.match_percentage ??
                        0;

                      const gap =
                        getSkillGap(career);

                      return (
                        <article
                          className="career-card"
                          key={career.id}
                        >
                          <div className="career-card-header">
                            <div>
                              <h3>
                                {career.title}
                              </h3>

                              <div className="match-label">
                                {getMatchLabel(
                                  score
                                )}
                              </div>
                            </div>

                            <div className="score-pill">
                              {score}%
                            </div>
                          </div>

                          <p className="career-description">
                            {career.description}
                          </p>

                          <div className="alignment-title">
                            <span>
                              Skill Alignment
                            </span>

                            <span>
                              {career.matched_skills_count ??
                                gap.matchedSkills.length}{" "}
                              /{" "}
                              {career.required_skills_count ??
                                career.required_skills.length}
                            </span>
                          </div>

                          <div className="progress-track">
                            <div
                              className="progress-value"
                              style={{
                                width: `${Math.min(
                                  Math.max(
                                    score,
                                    0
                                  ),
                                  100
                                )}%`,
                              }}
                            />
                          </div>

                          {/* Matched Skills */}
                          <div className="skills-group">
                            <div className="skills-group-title matched">
                              <CheckCircle2 size={14} />
                              Skills you already have
                            </div>

                            {gap.matchedSkills
                              .length > 0 ? (
                              <div className="skill-chips">
                                {gap.matchedSkills.map(
                                  (skill) => (
                                    <span
                                      className="skill-chip matched"
                                      key={skill}
                                    >
                                      <CheckCircle2
                                        size={12}
                                      />
                                      {skill}
                                    </span>
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="empty-skills">
                                No required skills
                                matched yet.
                              </div>
                            )}
                          </div>

                          {/* Missing Skills */}
                          <div className="skills-group">
                            <div className="skills-group-title missing">
                              <AlertCircle size={14} />
                              Skills to strengthen
                            </div>

                            {gap.missingSkills
                              .length > 0 ? (
                              <div className="skill-chips">
                                {gap.missingSkills.map(
                                  (skill) => (
                                    <span
                                      className="skill-chip missing"
                                      key={skill}
                                    >
                                      <AlertCircle
                                        size={12}
                                      />
                                      {skill}
                                    </span>
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="empty-skills">
                                Great! You cover all
                                listed required skills.
                              </div>
                            )}
                          </div>

                          <div className="card-meta">
                            <span className="meta-pill">
                              {formatSalary(
                                career.average_salary
                              )}
                            </span>

                            <span
                              className={`meta-pill ${getDemandClass(
                                career.demand_level
                              )}`}
                            >
                              {getDemandLabel(
                                career.demand_level
                              )}
                            </span>
                          </div>

                          <div className="card-footer">
                            <Link
                              to="/skills"
                              className="gap-action"
                            >
                              Improve My Skills
                              <ArrowRight size={14} />
                            </Link>

                            {career.career_url ? (
                              <a
                                href={
                                  career.career_url
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="card-link"
                              >
                                Explore Career
                                <ArrowRight
                                  size={14}
                                />
                              </a>
                            ) : (
                              <span
                                style={{
                                  fontSize:
                                    "0.75rem",
                                  opacity: 0.5,
                                }}
                              >
                                Career details
                              </span>
                            )}
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              )}

            {!aiLoading &&
              aiHasRun &&
              !aiError &&
              topAIMatches.length === 0 && (
                <div className="empty-state">
                  <div
                    className="ai-icon"
                    style={{
                      margin: "0 auto",
                    }}
                  >
                    <Target size={22} />
                  </div>

                  <h3>
                    Build your skill profile first
                  </h3>

                  <p>
                    Add a few skills to your SkillBridge
                    profile and then run the career match
                    again. Your saved skills will be compared
                    with the requirements of available career
                    paths.
                  </p>

                  <Link
                    to="/skills"
                    className="primary-button"
                  >
                    Add Skills
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}

            {/* =========================================
                PERSONALIZED LEARNING ROADMAP
            ========================================= */}
            {aiHasRun &&
              !aiError &&
              roadmapCareer && (
                <section className="roadmap-section">
                  <div className="roadmap-shell">
                    <div className="roadmap-header">
                      <div className="roadmap-title-wrap">
                        <div className="roadmap-icon">
                          <Route size={23} />
                        </div>

                        <div>
                          <h3>
                            Personalized Learning Roadmap
                          </h3>

                          <p>
                            Based on your strongest career match,
                            here are the skills you can strengthen
                            next — along with learning resources
                            already available in SkillBridge.
                          </p>
                        </div>
                      </div>

                      <div className="roadmap-career-pill">
                        <Target size={14} />
                        {roadmapCareer.title}
                      </div>
                    </div>

                    {/* Roadmap Progress */}
                    <div className="roadmap-progress">
                      <div>
                        <div className="roadmap-progress-label">
                          <span>
                            Current career readiness
                          </span>

                          <span>
                            {roadmapCareer.match_percentage ??
                              0}
                            %
                          </span>
                        </div>

                        <div className="roadmap-progress-track">
                          <div
                            className="roadmap-progress-value"
                            style={{
                              width: `${Math.min(
                                Math.max(
                                  roadmapCareer.match_percentage ??
                                    0,
                                  0
                                ),
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div
                        style={{
                          textAlign: "right",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.72rem",
                            opacity: 0.58,
                          }}
                        >
                          Skills to strengthen
                        </div>

                        <strong
                          style={{
                            display: "block",
                            color: "var(--text-heading)",
                            fontSize: "1.15rem",
                            marginTop: 2,
                          }}
                        >
                          {
                            roadmapGap.missingSkills
                              .length
                          }
                        </strong>
                      </div>
                    </div>

                    {roadmapGap.missingSkills.length ===
                      0 ? (
                      <div className="roadmap-success">
                        <div className="roadmap-success-icon">
                          <CheckCircle2 size={22} />
                        </div>

                        <div>
                          <strong>
                            Excellent — no skill gaps detected
                          </strong>

                          <span>
                            Your current profile covers all
                            listed required skills for this career
                            path.
                          </span>
                        </div>
                      </div>
                    ) : resourcesLoading ? (
                      <div className="roadmap-loading">
                        <div className="roadmap-loading-line" />
                        <div className="roadmap-loading-line" />
                      </div>
                    ) : (
                      <div>
                        {roadmapResources.map(
                          (step, index) => (
                            <div
                              className="roadmap-step"
                              key={step.skill}
                            >
                              <div className="roadmap-number">
                                {String(
                                  index + 1
                                ).padStart(2, "0")}
                              </div>

                              <div className="roadmap-step-content">
                                <div className="roadmap-skill-title">
                                  <CircleDot
                                    size={16}
                                  />
                                  {step.skill}
                                </div>

                                {step.resources.length >
                                0 ? (
                                  <div className="resource-list">
                                    {step.resources.map(
                                      (resource) => {
                                        const ResourceIcon =
                                          getResourceIcon(
                                            resource.resource_type
                                          );

                                        return (
                                          <article
                                            className="resource-card"
                                            key={
                                              resource.id
                                            }
                                          >
                                            <div className="resource-card-top">
                                              <span className="resource-type">
                                                <ResourceIcon
                                                  size={
                                                    12
                                                  }
                                                />
                                                {getResourceTypeLabel(
                                                  resource
                                                )}
                                              </span>

                                              <span className="resource-skill">
                                                {resource.skill_name}
                                              </span>
                                            </div>

                                            <h4>
                                              {
                                                resource.title
                                              }
                                            </h4>

                                            <p>
                                              {resource.description ||
                                                `Learn ${step.skill} with this SkillBridge resource.`}
                                            </p>

                                            <a
                                              href={
                                                resource.url
                                              }
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="resource-open"
                                            >
                                              Open Resource
                                              <ExternalLink
                                                size={
                                                  12
                                                }
                                              />
                                            </a>
                                          </article>
                                        );
                                      }
                                    )}
                                  </div>
                                ) : (
                                  <div className="no-resource">
                                    <div className="no-resource-text">
                                      <BookOpen
                                        size={17}
                                      />

                                      <div>
                                        <strong>
                                          No learning resource
                                          available yet
                                        </strong>

                                        <span>
                                          Browse the Resources
                                          section for other
                                          learning material.
                                        </span>
                                      </div>
                                    </div>

                                    <Link
                                      to="/resources"
                                      className="browse-resources"
                                    >
                                      Browse Resources
                                      <ArrowRight
                                        size={13}
                                        style={{
                                          verticalAlign:
                                            "middle",
                                          marginLeft: 3,
                                        }}
                                      />
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        )}

                        {resourcesError && (
                          <div className="roadmap-error">
                            <AlertCircle size={15} />
                            {resourcesError}
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "flex-end",
                        marginTop: 25,
                        paddingTop: 20,
                        borderTop:
                          "1px solid var(--border)",
                      }}
                    >
                      <Link
                        to="/resources"
                        className="secondary-button"
                      >
                        Explore All Resources
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </section>
              )}
          </div>
        </section>

        {/* Career Paths */}
        <section className="section">
          <div className="career-container">
            <div className="section-heading">
              <div>
                <h2>
                  Explore Career Paths
                </h2>

                <p>
                  Browse the career opportunities available
                  in your SkillBridge ecosystem.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="loading-grid">
                <div className="skeleton" />
                <div className="skeleton" />
                <div className="skeleton" />
              </div>
            ) : error ? (
              <div className="error-state">
                <div className="error-icon">
                  <AlertCircle size={21} />
                </div>

                <h3>
                  Unable to load careers
                </h3>

                <p>{error}</p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={fetchCareers}
                >
                  Try Again
                </button>
              </div>
            ) : careers.length === 0 ? (
              <div className="empty-state">
                <Target
                  size={30}
                  style={{
                    color: "var(--primary)",
                  }}
                />

                <h3>
                  No career paths available yet
                </h3>

                <p>
                  Career paths will appear here once they
                  are added to SkillBridge.
                </p>
              </div>
            ) : (
              <div className="results-grid">
                {careers.map((career) => (
                  <article
                    className="career-card"
                    key={career.id}
                  >
                    <div className="career-card-header">
                      <div>
                        <h3>
                          {career.title}
                        </h3>

                        <div
                          className={`match-label ${getDemandClass(
                            career.demand_level
                          )}`}
                        >
                          {getDemandLabel(
                            career.demand_level
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="career-description">
                      {career.description}
                    </p>

                    <div className="skills-group">
                      <div className="skills-group-title">
                        <Target size={14} />
                        Required Skills
                      </div>

                      <div className="skill-chips">
                        {career.required_skills
                          .slice(0, 6)
                          .map((skill) => (
                            <span
                              className="skill-chip"
                              style={{
                                background:
                                  "var(--primary-soft)",
                                color:
                                  "var(--text)",
                              }}
                              key={skill}
                            >
                              {skill}
                            </span>
                          ))}
                      </div>
                    </div>

                    <div className="card-meta">
                      <span className="meta-pill">
                        {formatSalary(
                          career.average_salary
                        )}
                      </span>

                      <span
                        className={`meta-pill ${getDemandClass(
                          career.demand_level
                        )}`}
                      >
                        {getDemandLabel(
                          career.demand_level
                        )}
                      </span>
                    </div>

                    <div className="card-footer">
                      <span
                        style={{
                          fontSize: "0.76rem",
                          opacity: 0.58,
                        }}
                      >
                        Build relevant skills
                      </span>

                      {career.career_url ? (
                        <a
                          href={
                            career.career_url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="card-link"
                        >
                          Explore Career
                          <ArrowRight size={14} />
                        </a>
                      ) : (
                        <Link
                          to="/skills"
                          className="card-link"
                        >
                          View Skills
                          <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="career-container">
          <div className="cta">
            <div>
              <h2>
                Ready to close your skill gaps?
              </h2>

              <p>
                Keep improving your skills and discover
                stronger career matches as your profile grows.
              </p>
            </div>

            <Link
              to="/skills"
              className="cta-button"
            >
              Improve My Skills
              <ArrowRight
                size={15}
                style={{
                  verticalAlign: "middle",
                  marginLeft: 5,
                }}
              />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="career-container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 15,
              flexWrap: "wrap",
            }}
          >
            <span>
              © {new Date().getFullYear()} SkillBridge
            </span>

            <span>
              Build skills. Discover careers. Grow with
              confidence.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}