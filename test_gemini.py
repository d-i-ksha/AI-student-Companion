from app.services.ai_service import generate_summary


text = """
Normalization is a database design technique used to
reduce data redundancy and improve data integrity.

The first normal form requires atomic values.
The second normal form removes partial dependencies.
The third normal form removes transitive dependencies.
"""


result = generate_summary(text)

print("\n===== GEMINI RESPONSE =====\n")
print(result)