from apps.career.models import Career


def is_roman_urdu(message):
    """
    Detect whether the user's message is written in
    Roman Urdu or contains common Roman Urdu words.
    """

    roman_urdu_words = {
        "mujhe",
        "mujhy",
        "mera",
        "meri",
        "mere",
        "hum",
        "ham",
        "ap",
        "aap",
        "apko",
        "aapko",
        "kya",
        "kia",
        "kyun",
        "kio",
        "kaise",
        "kesy",
        "kesi",
        "konsa",
        "konsi",
        "konse",
        "chahiye",
        "chahta",
        "chahti",
        "seekhna",
        "seekhon",
        "seekhu",
        "krna",
        "karna",
        "karo",
        "kru",
        "karun",
        "batao",
        "btao",
        "btaye",
        "hai",
        "ha",
        "hain",
        "ho",
        "hoga",
        "hogi",
        "sakta",
        "sakti",
        "skta",
        "skti",
        "ati",
        "aati",
        "ata",
        "aata",
        "rha",
        "raha",
        "rhi",
        "rahi",
        "ka",
        "ki",
        "ke",
        "mein",
        "main",
        "me",
        "se",
        "par",
        "aur",
        "bhi",
        "phir",
        "ab",
        "acha",
        "achha",
        "theek",
        "thek",
        "wala",
        "wali",
        "liye",
        "lia",
        "dena",
        "do",
        "mil",
        "milega",
        "mujh",
    }

    words = set(
        message.lower()
        .strip()
        .replace("?", " ")
        .replace(",", " ")
        .replace(".", " ")
        .replace("!", " ")
        .split()
    )

    # If at least one common Roman Urdu word exists,
    # treat the message as Roman Urdu / mixed language.
    return bool(words.intersection(roman_urdu_words))


def generate_chatbot_response(user, message):
    """
    Generate a SkillBridge assistant response using
    the user's skills and available career data.

    Supports:
    - English
    - Roman Urdu
    - Mixed English + Roman Urdu
    """

    message_lower = message.lower().strip()
    roman_urdu = is_roman_urdu(message)

    # --------------------------------------------------
    # Get user's skills
    # --------------------------------------------------

    user_skills = list(user.skills.all())
    skill_names = [skill.name for skill in user_skills]

    # --------------------------------------------------
    # No skills added yet
    # --------------------------------------------------

    if not skill_names:
        if roman_urdu:
            return (
                "Aap ne abhi koi skills add nahi ki hain.\n\n"
                "Skills page par ja kar apni current skills add karein. "
                "Us ke baad main aapko suitable careers recommend kar sakta hoon, "
                "learning resources suggest kar sakta hoon aur aapke skill gaps "
                "identify kar sakta hoon."
            )

        return (
            "You haven't added any skills yet.\n\n"
            "Go to the Skills page and add your current skills first. "
            "Then I can recommend careers, learning resources, "
            "and identify your skill gaps."
        )

    # --------------------------------------------------
    # Career-related questions
    # --------------------------------------------------

    if any(word in message_lower for word in [
        "career",
        "job",
        "profession",
        "become",
        "naukri",
        "nokri",
        "kam",
        "kaam",
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

            percentage = round(
                (matched / len(required)) * 100
            )

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

            if roman_urdu:
                result = (
                    "Aapki current skills ko dekhte hue "
                    "ye careers aapke liye suitable ho sakte hain:\n\n"
                )

                for career in top:
                    result += (
                        f"• {career['title']} — "
                        f"{career['percentage']}% skill match\n"
                    )

                result += (
                    "\nDetailed recommendations dekhne ke liye "
                    "SkillBridge ki Career page open karein."
                )

                return result

            result = (
                "Based on your current skills, these careers may suit you:\n\n"
            )

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

    # --------------------------------------------------
    # Skills / Learning questions
    # --------------------------------------------------

    if any(word in message_lower for word in [
        "skill",
        "skills",
        "learn",
        "learning",
        "what should i learn",
        "seekhna",
        "seekhon",
        "seekhu",
        "kya seekhun",
        "kia seekhun",
    ]):
        skills_text = ", ".join(skill_names)

        if roman_urdu:
            return (
                f"Aapki current skills hain: {skills_text}.\n\n"
                "Next step ke liye pehle apni existing skills ko strong karein "
                "aur phir un se related technologies seekhein.\n\n"
                "Skill Gap page par ja kar aap dekh sakte hain ke "
                "aapko kaunsi skills next learn karni chahiye. "
                "Resources page par learning material bhi available hai."
            )

        return (
            f"Your current skills are: {skills_text}.\n\n"
            "A good next step is to strengthen the skills you already "
            "have and then learn related technologies.\n\n"
            "You can use the Skill Gap page to identify missing skills "
            "and the Resources page to find learning material."
        )

    # --------------------------------------------------
    # React / Frontend questions
    # --------------------------------------------------

    if any(word in message_lower for word in [
        "react",
        "frontend",
        "front end",
        "typescript",
        "javascript",
    ]):
        if roman_urdu:
            return (
                "Agar aap Frontend Developer banna chahte hain "
                "to in skills par focus karein:\n\n"
                "• HTML & CSS\n"
                "• JavaScript\n"
                "• TypeScript\n"
                "• React.js\n"
                "• React Router\n"
                "• REST APIs\n"
                "• Git & GitHub\n\n"
                "In skills ke baad real projects banayein taake "
                "aapka portfolio strong ho."
            )

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

    # --------------------------------------------------
    # Django / Backend questions
    # --------------------------------------------------

    if any(word in message_lower for word in [
        "django",
        "backend",
        "back end",
        "api",
        "python",
    ]):
        if roman_urdu:
            return (
                "Agar aap Backend ya Full-Stack development karna "
                "chahte hain to in skills par focus karein:\n\n"
                "• Python\n"
                "• Django\n"
                "• Django REST Framework\n"
                "• REST APIs\n"
                "• PostgreSQL\n"
                "• JWT Authentication\n"
                "• Git & GitHub\n\n"
                "Frontend aur backend dono ko use karke complete projects "
                "banana aapke portfolio ko aur strong karega."
            )

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

    # --------------------------------------------------
    # Internship / Opportunities questions
    # --------------------------------------------------

    if any(word in message_lower for word in [
        "internship",
        "intern",
        "opportunity",
        "opportunities",
        "internship",
        "opportunity",
    ]):
        if roman_urdu:
            return (
                "Aap Opportunities page check kar sakte hain jahan "
                "internships, jobs aur freelance opportunities available hain.\n\n"
                "SkillBridge aapki skills ko use karke relevant opportunities "
                "show karta hai aur match scores provide karta hai."
            )

        return (
            "You can check the Opportunities page for internships, "
            "jobs and freelance opportunities.\n\n"
            "SkillBridge uses your skills to show relevant opportunities "
            "and match scores."
        )

    # --------------------------------------------------
    # Skill Gap questions
    # --------------------------------------------------

    if any(word in message_lower for word in [
        "gap",
        "missing",
        "improve",
        "weak",
        "kami",
        "missing skill",
        "skill gap",
        "improvement",
    ]):
        if roman_urdu:
            return (
                "Aapka Skill Gap analysis ye identify karne mein help karta hai "
                "ke aapko next kaunsi skills seekhni chahiye.\n\n"
                "Skill Gap page open karein jahan aap matched skills, "
                "missing skills aur recommended resources dekh sakte hain."
            )

        return (
            "Your Skill Gap analysis can help identify which skills "
            "you should learn next.\n\n"
            "Open the Skill Gap page to see matched skills, missing skills "
            "and recommended resources."
        )

    # --------------------------------------------------
    # Default response
    # --------------------------------------------------

    if roman_urdu:
        return (
            "Main aapka SkillBridge Assistant hoon 🤖\n\n"
            "Main aapki in cheezon mein help kar sakta hoon:\n"
            "• Career recommendations\n"
            "• Skills to learn\n"
            "• Skill gap improvement\n"
            "• React / Frontend development\n"
            "• Django / Backend development\n"
            "• Internships and opportunities\n\n"
            'Example: "meri skills ke liye konsi career best hai?"'
        )

    return (
        "I'm your SkillBridge Assistant 🤖\n\n"
        "I can help you with:\n"
        "• Career recommendations\n"
        "• Skills to learn\n"
        "• Skill gap improvement\n"
        "• React / Frontend development\n"
        "• Django / Backend development\n"
        "• Internships and opportunities\n\n"
        'Try asking: "Which career is best for my skills?"'
    )