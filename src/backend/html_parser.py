import os
from bs4 import BeautifulSoup
import json

# Folder containing your HTML files
folder_path = "./examview"  # Update this to your actual folder

all_questions = []
question_number = 1

# Loop through all HTML files
for filename in sorted(os.listdir(folder_path)):
    if filename.endswith(".html"):
        with open(os.path.join(folder_path, filename), "r", encoding="utf-8") as f:
            soup = BeautifulSoup(f, "html.parser")

        for card in soup.select('.exam-question-card'):
            question_text = card.select_one('.card-text').get_text(strip=True, separator=' ')
            options = {}
            for li in card.select('li.multi-choice-item'):
                letter = li.select_one('.multi-choice-letter').get('data-choice-letter').strip()
                text = li.get_text(strip=True)[3:].strip()  # Remove "A. " prefix
                options[letter] = text

            correct = card.select_one('span.correct-answer')
            correct_answer = correct.get_text(strip=True) if correct else ""

            all_questions.append({
                "number": question_number,
                "question": question_text,
                "options": options,
                "correct_answer": correct_answer,
                "explanation": "",
                "reference": ""
            })
            question_number += 1

# Save to one JSON file
with open("src/quiz-app/src/data/practice-exam-24.json", "w", encoding="utf-8") as f:
    json.dump(all_questions, f, indent=4)
