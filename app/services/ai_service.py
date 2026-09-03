import os
import time

from dotenv import load_dotenv
from google import genai

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY is not set")

client = genai.Client(api_key=API_KEY)

MODEL = "gemini-3.6-flash"


def generate_with_retry(prompt: str, retries: int = 2) -> str:
    """
    Send a prompt to Gemini and retry temporary server errors.
    """

    for attempt in range(retries):
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt
            )

            if not response.text:
                raise RuntimeError("Gemini returned an empty response")

            return response.text

        except Exception as e:
            error_message = str(e)

            # Retry temporary Gemini server errors
            if "503" in error_message or "UNAVAILABLE" in error_message:
                if attempt < retries - 1:
                    wait_time = 2 ** attempt
                    print("Gemini temporarily unavailable. Retrying...")
                    time.sleep(1)
                    continue

            raise e

    raise RuntimeError("Gemini request failed after multiple attempts")


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

    return generate_with_retry(prompt)


def generate_questions(text: str) -> str:

    prompt = f"""
Generate 3 short study questions from these notes.
Return only the questions.

NOTES:
{text[:5000]}
"""

    return generate_with_retry(prompt)


def generate_quiz(text: str) -> str:

    prompt = f"""
You are an AI study assistant.

Create a 10-question multiple-choice quiz from the following study material.

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

    return generate_with_retry(prompt)


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

    return generate_with_retry(prompt)