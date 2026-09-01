
from apps.resources.models import Resource


def get_recommended_resources(user, limit=6):
    """
    Return learning resources recommended for the current user.

    Recommendation logic:
    1. Get the user's selected skills.
    2. Find resources connected to those skills.
    3. Give each resource a relevance score.
    4. Return the highest-scoring resources.

    We keep this logic inside services.py so that the existing
    Resource model and normal CRUD API remain unchanged.
    """

    # Get all skills selected by the authenticated user.
    user_skills = user.skills.all()

    # A user without selected skills does not have enough information
    # for personalized resource recommendations.
    if not user_skills.exists():
        return []

    # Store the selected skill IDs so we can query related resources.
    skill_ids = list(
        user_skills.values_list("id", flat=True)
    )

    # Get resources belonging to the user's selected skills.
    resources = (
        Resource.objects
        .select_related("skill")
        .filter(skill_id__in=skill_ids)
    )

    recommendations = []

    for resource in resources:
        # Every resource connected to one of the user's skills
        # starts with a basic relevance score.
        score = 50

        # Give a small bonus when the resource has a description.
        # Resources with descriptions provide more useful information
        # to the user when displayed in the learning section.
        if resource.description:
            score += 10

        # Documentation is especially useful as a reference resource,
        # so give it a small relevance bonus.
        if resource.resource_type == Resource.ResourceType.DOCUMENTATION:
            score += 10

        # Videos and courses are useful for structured learning.
        elif resource.resource_type in [
            Resource.ResourceType.VIDEO,
            Resource.ResourceType.COURSE,
        ]:
            score += 5

        # Never allow the score to exceed 99.
        score = min(score, 99)

        recommendations.append(
            {
                "resource": resource,
                "match_score": score,
                "reason": (
                    f"This resource helps you learn "
                    f"{resource.skill.name}."
                ),
            }
        )

    # Highest relevance first.
    recommendations.sort(
        key=lambda item: item["match_score"],
        reverse=True,
    )

    # Return only the requested number of recommendations.
    return recommendations[:limit]
