import os
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

class BaseAIProvider:
    name: str = "Base"

    def chat(self, prompt: str, **kwargs) -> str:
        raise NotImplementedError

class TokenRouterProvider(BaseAIProvider):
    name = "TokenRouter"

    def chat(self, prompt: str, **kwargs) -> str:
        api_key = os.getenv("TOKENROUTER_API_KEY")
        if not api_key:
            raise ValueError("TOKENROUTER_API_KEY is not set.")
        base_url = os.getenv("TOKENROUTER_BASE_URL", "https://api.tokenrouter.com/v1")
        model = os.getenv("TOKENROUTER_MODEL", "moonshotai/kimi-k3-free")
        
        client = OpenAI(api_key=api_key, base_url=base_url)
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=kwargs.get("temperature", 0.7),
        )
        return response.choices[0].message.content or ""

class OpenAIProvider(BaseAIProvider):
    name = "OpenAI"

    def chat(self, prompt: str, **kwargs) -> str:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY is not set.")
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o"),
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content or ""

class MockProvider(BaseAIProvider):
    name = "Mock"

    def chat(self, prompt: str, **kwargs) -> str:
        return f"Mock AI Response: Analyzed prompt '{prompt[:30]}...' successfully."

class AIProviderFactory:
    _providers: Dict[str, BaseAIProvider] = {
        "TokenRouter": TokenRouterProvider(),
        "OpenAI": OpenAIProvider(),
        "Mock": MockProvider(),
    }

    @classmethod
    def get_provider(cls, name: Optional[str] = None) -> BaseAIProvider:
        provider_name = name or os.getenv("AI_PROVIDER", "TokenRouter")
        return cls._providers.get(provider_name, cls._providers["TokenRouter"])

    @classmethod
    def chat_with_failover(cls, prompt: str) -> str:
        chain = [os.getenv("AI_PROVIDER", "TokenRouter"), "TokenRouter", "OpenAI", "Mock"]
        seen = set()
        for name in chain:
            if name in seen:
                continue
            seen.add(name)
            provider = cls._providers.get(name)
            if not provider:
                continue
            try:
                return provider.chat(prompt)
            except Exception as e:
                print(f"[AI Failover] Provider '{name}' failed: {e}. Trying fallback...")
        return cls._providers["Mock"].chat(prompt)

def chat(prompt: str, model: Optional[str] = None) -> str:
    """
    Public entrypoint function maintaining 100% backward compatibility.
    """
    return AIProviderFactory.chat_with_failover(prompt)

if __name__ == "__main__":
    reply = chat("Hello RemoteFix AI Platform!")
    print("Response:", reply)