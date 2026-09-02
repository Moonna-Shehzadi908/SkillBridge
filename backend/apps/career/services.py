from .models import Career


def get_career_recommendations(user, limit=5):
    """
    Generate career recommendations based on the
    authenticated user's skills.
    """

    user_skills = set(
        user.skills.values_list("id", flat=True)
    )

    if not user_skills:
        return []

    careers = Career.objects.prefetch_related(
        "required_skills"
    ).all()

    recommendations = []

    for career in careers:
        required_skill_ids = set(
            career.required_skills.values_list("id", flat=True)
        )

        if not required_skill_ids:
            continue

        matched_skills = user_skills.intersection(
            required_skill_ids
        )

        match_percentage = round(
            (len(matched_skills) / len(required_skill_ids)) * 100
        )

        recommendations.append(
            {
                "career": career,
                "match_percentage": match_percentage,
                "matched_skills_count": len(matched_skills),
                "required_skills_count": len(required_skill_ids),
            }
        )

    recommendations.sort(
        key=lambda item: item["match_percentage"],
        reverse=True,
    )

    return recommendations[:limit]