from .models import Skill


# Skill relationships used by the smart recommendation engine.
# This is intentionally kept separate from the Skill model so
# existing database structure and admin functionality remain unchanged.

SKILL_RELATIONSHIPS = {
    "html": ["css", "javascript", "react", "frontend development"],
    "css": ["html", "javascript", "tailwind css", "responsive web design"],
    "javascript": [
        "typescript",
        "react",
        "node.js",
        "next.js",
        "frontend development",
    ],
    "typescript": ["react", "next.js", "node.js"],
    "react": ["typescript", "next.js", "node.js"],
    "node.js": ["express.js", "rest api", "postgresql", "mongodb"],
    "python": ["django", "fastapi", "machine learning", "data science"],
    "django": ["django rest framework", "python", "postgresql", "rest api"],
    "django rest framework": ["rest api", "postgresql", "react"],
    "postgresql": ["django", "node.js", "rest api", "database management"],
    "rest api": ["django rest framework", "node.js", "react"],
    "git": ["github", "gitlab", "version control"],
    "github": ["git", "version control", "open source"],
}


def normalize(value):
    """
    Normalize skill names/categories for reliable matching.
    """
    return value.strip().lower()


def get_recommendations(user, limit=6):
    """
    Generate smart skill recommendations for the authenticated user.

    The recommendation engine:
    1. Gets the user's existing skills.
    2. Excludes already-selected skills.
    3. Finds related skills.
    4. Considers category relationships.
    5. Calculates a match score.
    6. Returns the highest-scoring recommendations.
    """

    user_skills = list(user.skills.all())

    if not user_skills:
        return []

    selected_names = {
        normalize(skill.name)
        for skill in user_skills
    }

    selected_categories = {
        normalize(skill.category)
        for skill in user_skills
        if skill.category
    }

    available_skills = Skill.objects.exclude(
        id__in=[skill.id for skill in user_skills]
    )

    recommendations = []

    for skill in available_skills:
        skill_name = normalize(skill.name)
        skill_category = normalize(skill.category)

        score = 0
        matched_skill = None

        # -------------------------------------------------
        # Match against relationships of user's skills
        # -------------------------------------------------
        for user_skill in user_skills:
            user_skill_name = normalize(user_skill.name)

            related_skills = SKILL_RELATIONSHIPS.get(
                user_skill_name,
                [],
            )

            if skill_name in related_skills:
                score += 45

                if not matched_skill:
                    matched_skill = user_skill.name

        # -------------------------------------------------
        # Category match
        # -------------------------------------------------
        if skill_category and skill_category in selected_categories:
            score += 25

        # -------------------------------------------------
        # Partial name/category relationship
        # -------------------------------------------------
        for user_skill in user_skills:
            user_skill_name = normalize(user_skill.name)

            if (
                user_skill_name in skill_name
                or skill_name in user_skill_name
            ):
                score += 10

        # -------------------------------------------------
        # Give a small relevance score to uncategorized
        # related skills rather than hiding everything.
        # -------------------------------------------------
        if score == 0 and skill_category in selected_categories:
            score = 20

        # Only return meaningful recommendations.
        if score > 0:
            score = min(score, 99)

            if matched_skill:
                reason = (
                    f"Recommended because it builds naturally "
                    f"on your {matched_skill} skill."
                )
            elif skill_category:
                reason = (
                    f"This skill matches the {skill.category} "
                    f"area you are already exploring."
                )
            else:
                reason = (
                    "This skill may be a useful next step "
                    "in your learning journey."
                )

            recommendations.append(
                {
                    "skill": skill,
                    "match_score": score,
                    "reason": reason,
                }
            )

    # Highest match first
    recommendations.sort(
        key=lambda item: item["match_score"],
        reverse=True,
    )

    return recommendations[:limit]