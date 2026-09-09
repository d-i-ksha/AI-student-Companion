import os
import time
import json

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
                raise RuntimeError(
                    "Gemini returned an empty response"
                )

            return response.text

        except Exception as e:
            error_message = str(e)

            if "503" in error_message or "UNAVAILABLE" in error_message:
                if attempt < retries - 1:
                    wait_time = 2 ** attempt

                    print(
                        "Gemini temporarily unavailable. "
                        "Retrying..."
                    )

                    time.sleep(wait_time)
                    continue

            raise e

    raise RuntimeError(
        "Gemini request failed after multiple attempts"
    )


def clean_json_response(raw_text: str) -> str:
    """
    Remove Markdown code fences if Gemini returns JSON
    inside ```json ... ``` blocks.
    """

    cleaned = raw_text.strip()

    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]

    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]

    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]

    return cleaned.strip()


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


def generate_questions(text: str) -> list:
    """
    Generate structured study questions.
    """

    print("=== QUESTIONS TEXT ===")
    print(text[:1000])
    print("======================")

    prompt = f"""
You are an AI study assistant.

Generate exactly 3 short study questions from the
provided study material.

Return ONLY valid JSON.

Do not include Markdown.
Do not include ```json.
Do not include explanations outside the JSON.

Use exactly this format:

[
  {{
    "id": 1,
    "question": "Question here",
    "answer": "Answer here"
  }},
  {{
    "id": 2,
    "question": "Question here",
    "answer": "Answer here"
  }},
  {{
    "id": 3,
    "question": "Question here",
    "answer": "Answer here"
  }}
]

Rules:

- Questions must be based ONLY on the provided material.
- Answers must be based ONLY on the provided material.
- Do not invent information.
- Keep questions concise.

STUDY MATERIAL:

{text[:5000]}
"""

    raw_response = generate_with_retry(prompt)
    cleaned_response = clean_json_response(raw_response)

    try:
        questions = json.loads(cleaned_response)

        if not isinstance(questions, list):
            raise ValueError("Gemini did not return a JSON list")

        return questions

    except json.JSONDecodeError as e:
        print("Failed to parse questions JSON:")
        print(raw_response)

        raise RuntimeError(
            "Gemini returned invalid question format"
        ) from e


def generate_quiz(text: str) -> list:
    """
    Generate a structured 10-question multiple-choice quiz.
    """

    print("=== QUIZ TEXT ===")
    print(text[:1000])
    print("================")

    prompt = f"""
You are an AI study assistant.

Create a 10-question multiple-choice quiz from the
following study material.

Return ONLY valid JSON.

Do not include Markdown.
Do not include ```json.
Do not include explanations outside the JSON.

Use exactly this structure:

[
  {{
    "id": 1,
    "question": "Question here",
    "options": [
      {{
        "key": "A",
        "text": "Option A"
      }},
      {{
        "key": "B",
        "text": "Option B"
      }},
      {{
        "key": "C",
        "text": "Option C"
      }},
      {{
        "key": "D",
        "text": "Option D"
      }}
    ],
    "correctKey": "A",
    "explanation": "Short explanation."
  }}
]

Rules:

- Generate exactly 10 questions.
- Each question must have exactly 4 options.
- Options must be A, B, C and D.
- There must be exactly one correct answer.
- correctKey must be exactly A, B, C or D.
- Questions must be based ONLY on the provided study material.
- Do not use outside information.
- Do not invent facts.
- Mix easy, medium and difficult questions.
- Focus on important concepts.
- Keep explanations short and clear.

STUDY MATERIAL:

{text}
"""

    raw_response = generate_with_retry(prompt)
    cleaned_response = clean_json_response(raw_response)

    try:
        quiz = json.loads(cleaned_response)

        if not isinstance(quiz, list):
            raise ValueError("Gemini did not return a JSON list")

        if len(quiz) == 0:
            raise ValueError("Gemini returned an empty quiz")

        return quiz

    except json.JSONDecodeError as e:
        print("Failed to parse quiz JSON:")
        print(raw_response)

        raise RuntimeError(
            "Gemini returned invalid quiz format"
        ) from e


def answer_question(text: str, question: str) -> str:
    print("=== ASK AI TEXT ===")
    print(text[:1000])
    print("===================")

    prompt = f"""
You are an AI study assistant.

Answer the student's question using ONLY the provided
study material.

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