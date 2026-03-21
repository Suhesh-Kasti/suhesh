import os
import sys
import json
import re
import argparse
import frontmatter
from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel, Field

# Load env
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY not found in .env")
    sys.exit(1)

client = genai.Client(api_key=api_key)
MODEL_ID = 'gemini-3.1-flash-lite-preview'

BLOG_DIR = "content/english/blog"
QUIZ_OUT = "static/questions/quiz"
WORD_OUT = "static/questions/wordfill"

os.makedirs(QUIZ_OUT, exist_ok=True)
os.makedirs(WORD_OUT, exist_ok=True)

class QuizQuestion(BaseModel):
    question: str
    options: list[str] = Field(min_length=4, max_length=4)
    correctAnswer: str

class WordfillQuestion(BaseModel):
    question: str
    correctAnswer: str

def optimize_text(text):
    text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
    text = re.sub(r'!\[.*?\]\(.*?\)', '', text)
    text = re.sub(r'\{\{<.*?>\}\}', '', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def generate_quiz(text, append_count=None, existing=None):
    count = append_count if append_count else "15-20"
    prompt = f"Create {count} highly technical multiple-choice questions.\n"
    prompt += "Make sure the questions are technical. Generate exactly 5 questions OUTSIDE of the blog text requiring external research by the user on the same topic.\n"
    if existing:
        prompt += f"\nEnsure you do NOT generate any of these existing questions:\n{json.dumps([q['question'] for q in existing])}\n"
    prompt += f"\nBlog Text:\n{text}"

    response = client.models.generate_content(
        model=MODEL_ID,
        contents=prompt,
        config=genai.types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=list[QuizQuestion],
            temperature=0.7
        ),
    )
    return json.loads(response.text)

def generate_wordfill(text, append_count=None, existing=None):
    count = append_count if append_count else "15-20"
    prompt = f"Create {count} highly technical scenario-based challenges.\n"
    prompt += "Instead of simple blanks, present a practical technical scenario (e.g., 'If you have to scan port 80 99 443 in a network 192.168.1.0/24 in low speed what command will you use?').\n"
    prompt += "The correctAnswer must be the exact command, flag, or precise terminology.\n"
    prompt += "Generate exactly 5 questions OUTSIDE of the blog text requiring external research by the user on the same topic.\n"
    if existing:
        prompt += f"\nEnsure you do NOT generate any of these existing questions:\n{json.dumps([q['question'] for q in existing])}\n"
    prompt += f"\nBlog Text:\n{text}"

    response = client.models.generate_content(
        model=MODEL_ID,
        contents=prompt,
        config=genai.types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=list[WordfillQuestion],
            temperature=0.7
        ),
    )
    return json.loads(response.text)

def process_blog(filepath, append_target=None, append_count=5):
    try:
        post = frontmatter.load(filepath)
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return

    raw_content = post.content.strip()
    text_content = optimize_text(raw_content)

    quiz_code = post.metadata.get('quiz', {}).get('code')
    wordfill_code = post.metadata.get('wordfill', {}).get('code')

    # If appending, only process files that match the requested code
    if append_target:
        if str(quiz_code) != append_target and str(wordfill_code) != append_target:
            return  # Skip unrelated blogs

    # Quiz processing
    if not quiz_code or str(quiz_code).lower() in ['none', 'skip']:
        pass
    else:
        quiz_path = os.path.join(QUIZ_OUT, f"{quiz_code}.json")
        existing_quiz = []
        if os.path.exists(quiz_path):
            with open(quiz_path, 'r') as f:
                try:
                    existing_quiz = json.load(f)
                except:
                    existing_quiz = []
                    
        if os.path.exists(quiz_path) and not append_target:
            print(f"[EXISTS] Skipping {quiz_code} Quiz")
        elif not text_content:
             print(f"[SKIPPED] Quiz for {quiz_code} (No text content)")
        else:
            try:
                new_quiz_data = generate_quiz(
                    text_content, 
                    append_count=append_count if append_target else None, 
                    existing=existing_quiz if append_target else None
                )
                if append_target:
                    existing_quiz.extend(new_quiz_data)
                    quiz_data = existing_quiz
                    print(f"[APPENDED] Added {len(new_quiz_data)} Quiz questions to {quiz_code}")
                else:
                    quiz_data = new_quiz_data
                    print(f"[NEW] Generated Quiz for {quiz_code}")
                    
                with open(quiz_path, 'w') as f:
                    json.dump(quiz_data, f, indent=2)
            except Exception as e:
                print(f"[ERROR] Failed to generate Quiz for {quiz_code}: {e}")

    # Wordfill processing
    if not wordfill_code or str(wordfill_code).lower() in ['none', 'skip']:
        pass
    else:
        wordfill_path = os.path.join(WORD_OUT, f"{wordfill_code}.json")
        existing_wordfill = []
        if os.path.exists(wordfill_path):
            with open(wordfill_path, 'r') as f:
                try:
                    existing_wordfill = json.load(f)
                except:
                    existing_wordfill = []

        if os.path.exists(wordfill_path) and not append_target:
            print(f"[EXISTS] Skipping {wordfill_code} Wordfill")
        elif not text_content:
             print(f"[SKIPPED] Wordfill for {wordfill_code} (No text content)")
        else:
            try:
                new_wordfill_data = generate_wordfill(
                    text_content, 
                    append_count=append_count if append_target else None, 
                    existing=existing_wordfill if append_target else None
                )
                if append_target:
                    existing_wordfill.extend(new_wordfill_data)
                    wordfill_data = existing_wordfill
                    print(f"[APPENDED] Added {len(new_wordfill_data)} Wordfill questions to {wordfill_code}")
                else:
                    wordfill_data = new_wordfill_data
                    print(f"[NEW] Generated Wordfill for {wordfill_code}")

                with open(wordfill_path, 'w') as f:
                    json.dump(wordfill_data, f, indent=2)
            except Exception as e:
                print(f"[ERROR] Failed to generate Wordfill for {wordfill_code}: {e}")

def main():
    parser = argparse.ArgumentParser(description="Generate questions for blog posts.")
    parser.add_argument('--append', type=str, help='Provide the blog code (e.g. nmap101) to append questions to an existing file.')
    parser.add_argument('--count', type=int, default=5, help='Number of questions to append when --append is used.')
    args = parser.parse_args()

    if not os.path.exists(BLOG_DIR):
        print(f"Directory not found: {BLOG_DIR}")
        return

    for filename in os.listdir(BLOG_DIR):
        if filename.startswith("_") or not filename.endswith(".md"):
            continue
            
        filepath = os.path.join(BLOG_DIR, filename)
        process_blog(filepath, append_target=args.append, append_count=args.count)

if __name__ == "__main__":
    main()
