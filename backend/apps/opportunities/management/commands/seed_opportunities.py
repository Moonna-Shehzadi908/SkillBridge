from django.core.management.base import BaseCommand
from apps.opportunities.models import Opportunity
from apps.skills.models import Skill


class Command(BaseCommand):
    help = "Seed SkillBridge with sample career-related opportunities."

    opportunities = [
        # ============================================================
        # FRONTEND
        # ============================================================
        {
            "title": "Frontend Developer Intern",
            "company": "TechVision Solutions",
            "description": (
                "Frontend development internship focused on React, "
                "JavaScript, TypeScript and responsive web development."
            ),
            "opportunity_type": Opportunity.OpportunityType.INTERNSHIP,
            "location": "Remote",
            "is_remote": True,
            "url": "https://example.com/frontend-intern",
            "skill": "React",
            "deadline": "2026-10-15",
        },
        {
            "title": "React Developer",
            "company": "WebCraft Technologies",
            "description": (
                "Junior React development opportunity involving reusable "
                "components, APIs and responsive interfaces."
            ),
            "opportunity_type": Opportunity.OpportunityType.JOB,
            "location": "Remote",
            "is_remote": True,
            "url": "https://example.com/react-developer",
            "skill": "React",
            "deadline": "2026-10-25",
        },
        {
            "title": "JavaScript Developer Intern",
            "company": "DigitalWorks",
            "description": (
                "Internship for developers interested in JavaScript, "
                "frontend development and REST API integration."
            ),
            "opportunity_type": Opportunity.OpportunityType.INTERNSHIP,
            "location": "Lahore, Pakistan",
            "is_remote": False,
            "url": "https://example.com/javascript-intern",
            "skill": "JavaScript",
            "deadline": "2026-10-10",
        },
        {
            "title": "TypeScript Frontend Intern",
            "company": "CodeSphere",
            "description": (
                "Frontend internship working with TypeScript, React and "
                "modern web application development."
            ),
            "opportunity_type": Opportunity.OpportunityType.INTERNSHIP,
            "location": "Remote",
            "is_remote": True,
            "url": "https://example.com/typescript-intern",
            "skill": "TypeScript",
            "deadline": "2026-10-20",
        },

        # ============================================================
        # BACKEND / FULL STACK
        # ============================================================
        {
            "title": "Django Backend Developer Intern",
            "company": "Backend Labs",
            "description": (
                "Backend internship focused on Django, Django REST Framework, "
                "authentication and API development."
            ),
            "opportunity_type": Opportunity.OpportunityType.INTERNSHIP,
            "location": "Remote",
            "is_remote": True,
            "url": "https://example.com/django-intern",
            "skill": "Django",
            "deadline": "2026-10-18",
        },
        {
            "title": "Python Backend Developer",
            "company": "SoftTech Solutions",
            "description": (
                "Backend development role involving Python, REST APIs, "
                "databases and server-side application development."
            ),
            "opportunity_type": Opportunity.OpportunityType.JOB,
            "location": "Islamabad, Pakistan",
            "is_remote": False,
            "url": "https://example.com/python-backend",
            "skill": "Python",
            "deadline": "2026-10-30",
        },
        {
            "title": "Full Stack Developer Intern",
            "company": "NextGen Technologies",
            "description": (
                "Full stack internship involving frontend applications, "
                "backend APIs and database integration."
            ),
            "opportunity_type": Opportunity.OpportunityType.INTERNSHIP,
            "location": "Remote",
            "is_remote": True,
            "url": "https://example.com/full-stack-intern",
            "skill": "Django",
            "deadline": "2026-10-22",
        },
        {
            "title": "Node.js Backend Developer",
            "company": "CloudCode Systems",
            "description": (
                "Backend role focused on Node.js, REST APIs and "
                "server-side JavaScript development."
            ),
            "opportunity_type": Opportunity.OpportunityType.JOB,
            "location": "Remote",
            "is_remote": True,
            "url": "https://example.com/node-backend",
            "skill": "Node.js",
            "deadline": "2026-11-05",
        },

        # ============================================================
        # AI / MACHINE LEARNING
        # ============================================================
        {
            "title": "Machine Learning Intern",
            "company": "AI Tech Labs",
            "description": (
                "Machine learning internship involving Python, data "
                "processing, model development and evaluation."
            ),
            "opportunity_type": Opportunity.OpportunityType.INTERNSHIP,
            "location": "Remote",
            "is_remote": True,
            "url": "https://example.com/ml-intern",
            "skill": "Machine Learning",
            "deadline": "2026-10-12",
        },
        {
            "title": "AI/ML Engineer Intern",
            "company": "Intelligent Systems",
            "description": (
                "AI and machine learning internship involving model "
                "development, experimentation and AI application development."
            ),
            "opportunity_type": Opportunity.OpportunityType.INTERNSHIP,
            "location": "Lahore, Pakistan",
            "is_remote": False,
            "url": "https://example.com/ai-ml-intern",
            "skill": "Machine Learning",
            "deadline": "2026-10-28",
        },
        {
            "title": "Junior Machine Learning Engineer",
            "company": "DataMind Technologies",
            "description": (
                "Junior role involving machine learning models, Python "
                "and data-driven application development."
            ),
            "opportunity_type": Opportunity.OpportunityType.JOB,
            "location": "Remote",
            "is_remote": True,
            "url": "https://example.com/junior-ml-engineer",
            "skill": "Machine Learning",
            "deadline": "2026-11-10",
        },
        {
            "title": "Deep Learning Intern",
            "company": "AI Research Labs",
            "description": (
                "Research-oriented internship involving deep learning, "
                "neural networks and AI model experimentation."
            ),
            "opportunity_type": Opportunity.OpportunityType.INTERNSHIP,
            "location": "Remote",
            "is_remote": True,
            "url": "https://example.com/deep-learning-intern",
            "skill": "Deep Learning",
            "deadline": "2026-10-20",
        },
        {
            "title": "AI Research Intern",
            "company": "Future Intelligence Lab",
            "description": (
                "AI research internship involving deep learning and "
                "intelligent application development."
            ),
            "opportunity_type": Opportunity.OpportunityType.INTERNSHIP,
            "location": "Islamabad, Pakistan",
            "is_remote": False,
            "url": "https://example.com/ai-research-intern",
            "skill": "Deep Learning",
            "deadline": "2026-11-02",
        },
        {
            "title": "Python AI Developer Intern",
            "company": "SmartAI Solutions",
            "description": (
                "Internship combining Python development with artificial "
                "intelligence and machine learning applications."
            ),
            "opportunity_type": Opportunity.OpportunityType.INTERNSHIP,
            "location": "Remote",
            "is_remote": True,
            "url": "https://example.com/python-ai-intern",
            "skill": "Python",
            "deadline": "2026-10-25",
        },

        # ============================================================
        # DATABASE
        # ============================================================
        {
            "title": "PostgreSQL Developer Intern",
            "company": "DataStack Technologies",
            "description": (
                "Database internship focused on PostgreSQL, SQL queries, "
                "database design and backend integration."
            ),
            "opportunity_type": Opportunity.OpportunityType.INTERNSHIP,
            "location": "Remote",
            "is_remote": True,
            "url": "https://example.com/postgresql-intern",
            "skill": "PostgreSQL",
            "deadline": "2026-10-17",
        },
        {
            "title": "SQL Database Intern",
            "company": "DataWorks",
            "description": (
                "Internship involving SQL, relational databases, "
                "queries and data management."
            ),
            "opportunity_type": Opportunity.OpportunityType.INTERNSHIP,
            "location": "Lahore, Pakistan",
            "is_remote": False,
            "url": "https://example.com/sql-intern",
            "skill": "SQL",
            "deadline": "2026-10-24",
        },

        # ============================================================
        # API / WEB DEVELOPMENT
        # ============================================================
        {
            "title": "REST API Developer Intern",
            "company": "APIWorks",
            "description": (
                "Internship focused on REST API development, backend "
                "integration and web application services."
            ),
            "opportunity_type": Opportunity.OpportunityType.INTERNSHIP,
            "location": "Remote",
            "is_remote": True,
            "url": "https://example.com/rest-api-intern",
            "skill": "REST APIs",
            "deadline": "2026-10-19",
        },
        {
            "title": "Web Development Intern",
            "company": "Digital Future",
            "description": (
                "Web development internship involving frontend interfaces, "
                "APIs and responsive web applications."
            ),
            "opportunity_type": Opportunity.OpportunityType.INTERNSHIP,
            "location": "Remote",
            "is_remote": True,
            "url": "https://example.com/web-development-intern",
            "skill": "HTML",
            "deadline": "2026-10-29",
        },
    ]

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0
        skipped_count = 0

        for data in self.opportunities:
            data = data.copy()
            skill_name = data.pop("skill")

            try:
                skill = Skill.objects.get(
                    name__iexact=skill_name
                )
            except Skill.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(
                        f"Skipped: skill '{skill_name}' "
                        f"does not exist."
                    )
                )
                skipped_count += 1
                continue

            opportunity, created = Opportunity.objects.update_or_create(
                title=data["title"],
                company=data["company"],
                defaults={
                    **data,
                    "skill": skill,
                },
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created: {opportunity.title}"
                    )
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Updated: {opportunity.title}"
                    )
                )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Created: {created_count}, "
                f"Updated: {updated_count}, "
                f"Skipped: {skipped_count}"
            )
        )