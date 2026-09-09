from apps.career.models import Career


def generate_chatbot_response(user, message):
    """
    Generate a SkillBridge assistant response
    using the user's skills and available career data.
    """

    message_lower = message.lower().strip()

    # Get user's skills
    user_skills = list(user.skills.all())
    skill_names = [skill.name for skill in user_skills]

    # No skills added yet
    if not skill_names:
        return (
            "You haven't added any skills yet. "
            "Go to the Skills page and add your current skills first. "
            "Then I can recommend careers, learning resources, "
            "and identify your skill gaps."
        )

    # Career-related questions
    if any(word in message_lower for word in [
        "career",
        "job",
        "profession",
        "become",
    ]):
        careers = Career.objects.prefetch_related("required_skills").all()

        recommendations = []

        for career in careers:
            required = list(career.required_skills.all())

            if not required:
                continue

            matched = sum(
                1
                for skill in required
                if skill.name.lower() in [
                    name.lower() for name in skill_names
                ]
            )

            percentage = round((matched / len(required)) * 100)

            recommendations.append(
                {
                    "title": career.title,
                    "percentage": percentage,
                }
            )

        recommendations.sort(
            key=lambda item: item["percentage"],
            reverse=True,
        )

        if recommendations:
            top = recommendations[:3]

            result = "Based on your current skills, these careers may suit you:\n\n"

            for career in top:
                result += (
                    f"• {career['title']} — "
                    f"{career['percentage']}% skill match\n"
                )

            result += (
                "\nYou can open the Career page in SkillBridge "
                "to see detailed recommendations."
            )

            return result

    # Skills questions
    if any(word in message_lower for word in [
        "skill",
        "learn",
        "learning",
        "what should i learn",
        "seekhna",
    ]):
        skills_text = ", ".join(skill_names)

        return (
            f"Your current skills are: {skills_text}.\n\n"
            "A good next step is to strengthen the skills you already "
            "have and then learn related technologies. "
            "You can use the Skill Gap page to identify missing skills "
            "and the Resources page to find learning material."
        )

    # React/frontend questions
    if any(word in message_lower for word in [
        "react",
        "frontend",
        "front end",
        "typescript",
        "javascript",
    ]):
        return (
            "For a Frontend Developer path, focus on:\n\n"
            "• HTML & CSS\n"
            "• JavaScript\n"
            "• TypeScript\n"
            "• React.js\n"
            "• React Router\n"
            "• REST APIs\n"
            "• Git & GitHub\n\n"
            "After these, build real projects to strengthen your portfolio."
        )

    # Django/backend questions
    if any(word in message_lower for word in [
        "django",
        "backend",
        "back end",
        "api",
        "python",
    ]):
        return (
            "For a Backend / Full-Stack path, focus on:\n\n"
            "• Python\n"
            "• Django\n"
            "• Django REST Framework\n"
            "• REST APIs\n"
            "• PostgreSQL\n"
            "• JWT Authentication\n"
            "• Git & GitHub\n\n"
            "Building complete frontend + backend projects "
            "will make your portfolio stronger."
        )

    # Internship questions
    if any(word in message_lower for word in [
        "internship",
        "intern",
        "opportunity",
        "opportunities",
    ]):
        return (
            "You can check the Opportunities page for internships, "
            "jobs and freelance opportunities. "
            "SkillBridge uses your skills to show relevant opportunities "
            "and match scores."
        )

    # Skill gap questions
    if any(word in message_lower for word in [
        "gap",
        "missing",
        "improve",
        "weak",
    ]):
        return (
            "Your Skill Gap analysis can help identify which skills "
            "you should learn next. Open the Skill Gap page to see "
            "matched skills, missing skills and recommended resources."
        )

    # Default response
    return (
        "I'm your SkillBridge Assistant 🤖\n\n"
        "I can help you with:\n"
        "• Career recommendations\n"
        "• Skills to learn\n"
        "• Skill gap improvement\n"
        "• React / Frontend development\n"
        "• Django / Backend development\n"
        "• Internships and opportunities\n\n"
        "Try asking: \"Which career is best for my skills?\""
    )