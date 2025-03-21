import re
import json
import os


def parse_markdown_questions(md_text):
    question_blocks = re.split(r"\n(?=\d+\.\s)", md_text.strip())  # split on new question number
    questions = []

    for block in question_blocks:
        # Match question number and text
        question_match = re.match(r"(\d+)\.\s+(.*?)\n", block, re.DOTALL)
        if not question_match:
            continue

        number = int(question_match.group(1))
        question_text = question_match.group(2).strip()

        # Extract options (A, B, C, ...)
        options = dict(re.findall(r"- ([A-Z])\. (.+)", block))

        # Match correct answer (allowing multiline spacing)
        answer_match = re.search(r"Correct Answer:\s*([A-Z]+)", block, re.IGNORECASE)
        correct_answer = answer_match.group(1).strip() if answer_match else None

        # Match explanation
        explanation_match = re.search(r"Explanation:\s*(.*?)(?:\n\s*(Reference|</details>))", block, re.DOTALL | re.IGNORECASE)
        explanation = explanation_match.group(1).strip() if explanation_match else ""

        # Match reference URL
        reference_match = re.search(r"Reference:\s*<?(https?://[^\s>]+)>?", block, re.IGNORECASE)
        reference = reference_match.group(1).strip() if reference_match else ""

        questions.append({
            "number": number,
            "question": question_text,
            "options": options,
            "correct_answer": correct_answer,
            "explanation": explanation,
            "reference": reference
        })

    return questions


if __name__ == '__main__':

    file_paths = []
    for root, dirs, files in os.walk('./practice-exam'):
        for file in files:
            if file.startswith('practice-exam') and file.endswith('.md'):
                file_path = os.path.join(root, file)
                file_paths.append(file_path)

    for p in file_paths:
        _base_name = os.path.basename(p).split('.')[0]
        content = open(p, 'r').read()
        parsed_data = parse_markdown_questions(content)
        with open(f'src/quiz-app/src/data/{_base_name}.json', 'w') as f:
            f.write(json.dumps(parsed_data, indent=4))