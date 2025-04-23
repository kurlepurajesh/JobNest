

import google.generativeai as genai

# Initialize Gemini
genai.configure(api_key="AIzaSyA9JuNvXQ9W58c4SabeeiH0aGHrKwuLErI")

# Load Gemini model (e.g., "gemini-1.5-flash" or "gemini-pro")
model = genai.GenerativeModel("gemini-1.5-flash")  # or "gemini-pro"

def classify_email_status_with_gemini(email_body):
    
    try:
        prompt = f"""
You are a helpful assistant that classifies job application emails.

Based on the following email content, classify the job application status as one of these:
- rejection
- interview
- offer
- unknown
- online assessment
- group discussion
- case study challenge

Email:
\"\"\"
{email_body}
\"\"\"

Reply with only one word: rejection, interview, offer, or unknown.
"""
        
        response = model.generate_content(prompt)
        status = response.text.strip().lower()

        if status not in ['rejection', 'interview', 'offer','online assessment','group discussion','case study challenge']:
            return 'unknownnn'
        return status
    except Exception as e:
        print(f"Gemini error: {e}")
        return 'unknownnn'