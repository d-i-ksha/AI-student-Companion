import os

from dotenv import load_dotenv
from google import genai


load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY is not set")


client = genai.Client(api_key=API_KEY)


def generate_summary(text: str) -> str:
    prompt = f"""
You are an AI study assistant.

Summarize the following study material for a college student.

Requirements:
- Give a clear overall summary.
- Identify the most important concepts.
- Use simple language.
- Use headings and bullet points where useful.
- Do not invent information that is not present in the provided material.

STUDY MATERIAL:

{text}
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return response.text


def generate_questions(text: str) -> list[str]:
    prompt = f"""
You are an AI study assistant.

Generate 10 useful study questions from the following study material.

Requirements:
- Questions must be based ONLY on the provided material.
- Mix easy, medium, and difficult questions.
- Focus on important concepts.
- Do not provide answers.
- Return ONLY the questions as a numbered list.

STUDY MATERIAL:

{text}
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return response.text

def generate_quiz(text: str) -> str:
    prompt = f"""
You are an AI study assistant.

Create a 10-question multiple-choice quiz from the following
study material.

Requirements:
- Questions must be based ONLY on the provided material.
- Each question must have exactly 4 options: A, B, C, D.
- Include the correct answer.
- Mix easy, medium, and difficult questions.
- Focus on important concepts.
- Format clearly.

Use this format:

1. Question
A. Option
B. Option
C. Option
D. Option
Correct Answer: A

STUDY MATERIAL:

{text}
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return response.text

def answer_question(text: str, question: str) -> str:
    prompt = f"""
You are an AI study assistant.

Answer the student's question using ONLY the provided study material.

Rules:
- Use the study material as your primary and only source.
- Explain the answer clearly and simply.
- If the answer cannot be found in the study material, say:
  "This topic is not covered in the uploaded notes."
- Do not invent information.

STUDY MATERIAL:
{text}

STUDENT QUESTION:
{question}
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return response.text