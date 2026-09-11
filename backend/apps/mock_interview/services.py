
from .models import Interview, InterviewQuestion


def generate_questions_for_career(career, number_of_questions=5):
    """
    Generate mock interview questions based on the
    skills required by a career.

    Questions are distributed across the required skills
    instead of generating all questions from the first skill.
    """

    required_skills = list(career.required_skills.all())

    if not required_skills:
        return []

    question_templates = [
        "What do you know about {skill}?",
        "How would you use {skill} in a real-world project?",
        "What are the important concepts of {skill}?",
        "What common challenges can occur when using {skill}?",
        "How would you improve your knowledge of {skill}?",
    ]

    questions = []

    # Generate questions in a round-robin manner
    # so different skills are covered.
    template_index = 0

    while (
        len(questions) < number_of_questions
        and template_index < len(question_templates)
    ):
        for skill in required_skills:
            if len(questions) >= number_of_questions:
                break

            template = question_templates[template_index]

            questions.append(
                {
                    "question": template.format(
                        skill=skill.name
                    ),
                    "expected_answer": (
                        f"The candidate should demonstrate "
                        f"a basic understanding of {skill.name}."
                    ),
                }
            )

        template_index += 1

    return questions


def create_interview(user, career, number_of_questions=5):
    """
    Create a new mock interview and generate questions.
    """

    generated_questions = generate_questions_for_career(
        career,
        number_of_questions,
    )

    interview = Interview.objects.create(
        user=user,
        career=career,
        total_questions=len(generated_questions),
    )

    question_objects = []

    for item in generated_questions:
        question_objects.append(
            InterviewQuestion(
                interview=interview,
                question=item["question"],
                expected_answer=item["expected_answer"],
            )
        )

    InterviewQuestion.objects.bulk_create(
        question_objects
    )

    return interview


def calculate_interview_score(interview):
    """
    Calculate final interview score based on
    individual question scores.
    """

    questions = interview.questions.all()

    if not questions.exists():
        return 0

    total_score = sum(
        question.score
        for question in questions
    )

    max_score = questions.count() * 100

    if max_score == 0:
        return 0

    percentage = round(
        (total_score / max_score) * 100
    )

    interview.score = percentage
    interview.completed = True

    interview.save(
        update_fields=[
            "score",
            "completed",
        ]
    )

    return percentage
