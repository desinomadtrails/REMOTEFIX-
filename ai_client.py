from openai import OpenAI
from dotenv import load_dotenv
import os

# Load .env
load_dotenv()

# Create the client
client = OpenAI(
    api_key=os.getenv("TOKENROUTER_API_KEY"),
    base_url="https://api.tokenrouter.com/v1"
)

def chat(prompt):
    try:
        response = client.chat.completions.create(
            model="moonshotai/kimi-k3-free",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content

    except Exception as e:
        print(f"Error: {type(e).__name__}")
        print(e)
        raise