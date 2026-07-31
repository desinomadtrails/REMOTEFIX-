import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration constants
BASE_URL = os.getenv("TOKENROUTER_BASE_URL", "https://api.tokenrouter.com/v1")
DEFAULT_MODEL = os.getenv("TOKENROUTER_MODEL", "moonshotai/kimi-k3-free")


def get_ai_client() -> OpenAI:
    """
    Initializes and returns an OpenAI client configured for TokenRouter.
    Reads TOKENROUTER_API_KEY from environment variables.
    """
    api_key = os.getenv("TOKENROUTER_API_KEY")
    if not api_key:
        raise ValueError(
            "TOKENROUTER_API_KEY environment variable is missing. "
            "Please set TOKENROUTER_API_KEY in your environment or .env file."
        )

    return OpenAI(
        api_key=api_key,
        base_url=BASE_URL,
    )


def chat(prompt: str, model: str = DEFAULT_MODEL) -> str:
    """
    Reusable chat function that accepts a user prompt and returns the model's text response.
    
    :param prompt: User input text message.
    :param model: LLM model name (defaults to moonshotai/kimi-k3-free).
    :return: Generated text response string.
    """
    client = get_ai_client()
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        print(f"TokenRouter API Error ({type(e).__name__}): {e}")
        raise

if __name__ == "__main__":
    # Quick sanity check test
    test_prompt = "Hello! Briefly introduce yourself as RemoteFix AI Copilot powered by TokenRouter."
    try:
        reply = chat(test_prompt)
        print("Model Response:\n", reply)
    except Exception as err:
        print("Initialization test completed with status:", err)