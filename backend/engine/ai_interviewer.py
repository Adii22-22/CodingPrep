import os
from decouple import config
import google.generativeai as genai

# Configure API Key
api_key = config("GEMINI_API_KEY", default="")
if api_key:
    genai.configure(api_key=api_key)

# The system prompt instructs Gemini on its persona
SYSTEM_PROMPT = """
You are a friendly but rigorous technical interviewer at a top tech company. 
You are conducting a coding interview with the user.
Your goals:
1. Always keep responses conversational, concise, and to the point (no long essays).
2. FIRST, ask the user to explain their approach to solving the problem in their own words. Do NOT let them start coding until their approach is solid.
3. If their approach is completely wrong or inefficient, guide them with small hints. Do NOT give them the direct answer or the full code.
4. Once they have a correct approach, explicitly tell them to go ahead and start writing the code.
5. The user will periodically send you their current code along with their messages. If they ask for feedback on their code, review it.
6. Once their code is correct and handles edge cases, ask them to explain the Time and Space Complexity.
7. End the interview warmly when all criteria are met.
8. IMPORTANT: When the candidate has completely finished the problem (correct code and complexity explained), you MUST include the exact string [[NEXT]] at the end of your response to signal the system to proceed.

Format your responses using Markdown. NEVER write the full solution for them.
"""

def start_interview(problem):
    """
    Starts an interview by returning the first message from the AI.
    """
    return (
        f"Hi! We'll keep this conversational: I'll ask one question at a time, and we'll work through the problem. "
        f"For this one, we're looking at **{problem.title}**. \n\n"
        f"Before you write any code, can you tell me in your own words what your approach will be for solving this?"
    )

def generate_chat_response(problem, chat_history, current_code, new_message):
    """
    chat_history: list of dicts like [{"role": "user"|"model", "content": "..."}]
    """
    if not api_key:
        return " *Gemini API Key is missing. Please configure GEMINI_API_KEY in the backend .env file to enable the AI Interviewer.*"

    # Construct the model
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction=SYSTEM_PROMPT
    )
    
    # Convert chat history to Gemini's expected format
    formatted_history = []
    for msg in chat_history:
        # Gemini expects 'user' and 'model'
        role = "user" if msg["role"] == "user" else "model"
        formatted_history.append({"role": role, "parts": [msg["content"]]})
        
    # Start a chat session
    chat_session = model.start_chat(history=formatted_history)
    
    # Construct the next prompt, incorporating the user's current code
    prompt = f"User's message: {new_message}\n\n"
    if current_code and current_code.strip():
        prompt += f"User's current code in editor:\n```python\n{current_code}\n```\n"
        
    try:
        response = chat_session.send_message(prompt)
        return response.text
    except Exception as e:
        return f"Error communicating with AI: {str(e)}"

def generate_interview_grade(transcript):
    """
    Takes the full interview transcript and generates a grade and feedback.
    """
    if not api_key:
        return "*Gemini API Key is missing.*"

    grading_prompt = f"""
    You are an expert technical interviewer evaluating a candidate's performance across one or more coding problems.
    Please review the following interview transcript and provide a final grading report.
    
    Structure your response as follows:
    1. Overall Score: [Score out of 5]
    2. Strengths: [What they did well]
    3. Areas for Improvement: [Where they struggled]
    4. Recommendations: [Actionable advice for next time]
    
    Transcript:
    {transcript}
    """
    
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(grading_prompt)
        return response.text
    except Exception as e:
        return f"Error generating grade: {str(e)}"

