from apps.opportunities.models import Opportunity


def get_recommended_opportunities(user, limit=10):
    user_skills = user.skills.all()

    if not user_skills.exists():
        return []

    user_skill_ids = set(
        user_skills.values_list("id", flat=True)
    )

    opportunities = (
        Opportunity.objects
        .select_related("skill")
        .all()
    )

    recommendations = []

    for opportunity in opportunities:
        score = 50

        if opportunity.skill_id in user_skill_ids:
            score += 40

        if opportunity.is_remote:
            score += 5

        if opportunity.description:
            score += 5

        score = min(score, 100)

        if opportunity.skill_id in user_skill_ids:
            reason = (
                f"This opportunity matches your "
                f"{opportunity.skill.name} skill."
            )
        else:
            reason = (
                f"This opportunity may help you develop "
                f"{opportunity.skill.name}."
            )

        recommendations.append(
            {
                "opportunity": opportunity,
                "match_score": score,
                "match_reason": reason,
            }
        )

    recommendations.sort(
        key=lambda item: item["match_score"],
        reverse=True,
    )

    return recommendations[:limit]