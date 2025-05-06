# Grok API Documentation

## Key Points
- **Grok API Overview**: The Grok API is provided by xAI, allowing developers to access Grok models (such as Grok 3) for text generation and conversation tasks.
- **Compatibility**: The API is compatible with the OpenAI SDK, making it easy to integrate into existing projects.
- **Obtaining Keys**: Registration and API key generation required through the xAI console.
- **Cost**: Charged by token, with $25 of free credits provided monthly during the public beta.
- **Limitations**: Information based on public resources, may be incomplete, recommend referring to official documentation.

## Introduction
The Grok API is an interface provided by xAI for integrating Grok AI models into applications. Grok aims to provide helpful responses and supports text generation and conversation tasks. The API is compatible with the OpenAI SDK, allowing developers to use it by simply changing the base URL and API key.

## Obtaining API Keys
1. Visit the [xAI homepage](https://x.ai/) and click on the "API" tab.
2. Click "Start building now" to enter the login page.
3. Log in or register using email, Twitter, or Google account.
4. In the console, select "Manage API keys" to create and save your key.

## Basic API Call Example
Here's a simple example of calling the Grok API using the OpenAI SDK:

```python
from openai import OpenAI

client = OpenAI(api_key="YOUR_XAI_API_KEY", base_url="https://api.x.ai/v1")
response = client.chat.completions.create(
    model="grok-3-beta",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"}
    ]
)
print(response.choices[0].message.content)
```

## More Information
As the information may be incomplete, it's recommended to visit the [xAI documentation](https://docs.x.ai/docs/overview) for the latest details.

---

# Detailed Grok API Documentation

## 1. Introduction
The Grok API is a powerful interface provided by xAI that allows developers to integrate Grok series models (such as Grok 3 and Grok 2) into applications. Grok is an AI model designed to help users, supporting text generation, conversation, and complex reasoning tasks. The API design is compatible with OpenAI and Anthropic SDKs, making it easy for developers to migrate existing projects. This documentation is compiled based on public information and third-party guides, covering usage instructions from entry-level to advanced features. As direct access to complete official documentation may be limited, it's recommended to refer to the [xAI official documentation](https://docs.x.ai/docs/overview) for the latest information.

### 1.1 Available Models
Here are the main models supported by the Grok API:

| **Model** | **Description** | **Use Cases** |
|----------|----------|--------------|
| `grok-3-beta` | Grok 3, the latest model with advanced reasoning capabilities and extensive pretrained knowledge | Complex reasoning, data analysis, text generation |
| `grok-2` | Earlier version, slightly lower performance but more cost-effective | Simple conversations, content generation |
| Other models | Includes multimodal models (supporting image processing, with more to come in the future) | Data extraction, programming, image analysis |

- **Selection Recommendation**: For tasks requiring high accuracy and complex reasoning, choose `grok-3-beta`; for simple tasks, `grok-2` is more economical.

## 2. Getting Started

### 2.1 Obtaining an API Key
To use the Grok API, you need an API key. Follow these steps:
1. Visit the [xAI homepage](https://x.ai/) and click on the "API" tab.
2. Click "Start building now" to go to the login page.
3. Create or log in to an xAI account using email/password, Twitter, or Google OAuth.
4. After logging in, find "Manage API keys" in the console (located below the welcome message).
5. Create an API key: name the key, select endpoints, choose models, preview, and generate. You can edit, disable, delete, or create new keys.

**Note**: API keys are used for authentication, so store them securely and avoid exposure.

### 2.2 Setting Up the Development Environment
The Grok API is compatible with the OpenAI SDK, and it's recommended to use the OpenAI Python library:
- Install the OpenAI library: `pip install openai`
- Configure environment variables (optional): Store the API key in environment variables to enhance security, for example:
  ```python
  import os
  os.environ["XAI_API_KEY"] = "YOUR_XAI_API_KEY"
  ```

## 3. API Call Methods

The base URL for the Grok API is `https://api.x.ai/v1`, compatible with the OpenAI API format. Here are several common calling methods.

### 3.1 Using the OpenAI SDK
The OpenAI SDK is the simplest method. Here's an example of calling `grok-3-beta`:

```python
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_XAI_API_KEY",
    base_url="https://api.x.ai/v1"
)

response = client.chat.completions.create(
    model="grok-3-beta",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"}
    ],
    stream=False
)

print(response.choices[0].message.content)
```

- **Parameter Description**:
  - `model`: Specifies the model (e.g., "grok-3-beta").
  - `messages`: Conversation history, containing `role` (`system`, `user`, `assistant`) and `content`.
  - `stream`: Set to `False` to return a complete response at once; set to `True` to enable streaming responses.

### 3.2 Using the Anthropic SDK
The Grok API also supports the Anthropic SDK:

```python
import anthropic

client = anthropic.Anthropic(
    api_key="YOUR_XAI_API_KEY",
    base_url="https://api.x.ai"
)

response = client.completions.create(
    model="grok-beta",
    prompt="How do I differentiate between an adverb and an adjective?",
    max_tokens=128
)

print(response.completion)
```

### 3.3 Using LangChain
LangChain is an AI application development framework that can easily integrate with the Grok API:

```python
from langchain_openai import ChatOpenAI
import os

os.environ["OPENAI_API_KEY"] = "YOUR_XAI_API_KEY"
os.environ["OPENAI_API_BASE"] = "https://api.x.ai/v1"

llm = ChatOpenAI(model="grok-beta", max_tokens=50)
response = llm.predict("Write a story about a brave knight.")
print(response)
```

### 3.4 Using Python requests Library
For scenarios requiring low-level control, you can use the requests library to directly call the API:

```python
import requests
import json

url = "https://api.x.ai/v1/chat/completions"
headers = {
    "Authorization": "Bearer YOUR_XAI_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "model": "grok-3-beta",
    "messages": [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain intonations to me"}
    ],
    "temperature": 0,
    "stream": False
}

response = requests.post(url, headers=headers, json=data)
print(json.loads(response.content)["choices"][0]["message"]["content"])
```

## 4. Parameter Configuration

API calls support the following key parameters:

| **Parameter** | **Type** | **Description** |
|----------|----------|----------|
| `model` | string | Specifies the model (e.g., "grok-3-beta"). |
| `messages` | list | Conversation history, containing `role` (`system`, `user`, `assistant`) and `content`. |
| `temperature` | float | Controls output randomness (0.0 to 2.0, default 1.0). |
| `max_tokens` | integer | Maximum output token count. |
| `stream` | boolean | Whether to enable streaming responses (`True` or `False`). |
| `response_format` | object | Can be set to `{"type": "json_object"}` to force JSON format returns. |

**Example** (setting JSON output):

```python
response = client.chat.completions.create(
    model="grok-3-beta",
    messages=[{"role": "user", "content": "Return a greeting in JSON format"}],
    response_format={"type": "json_object"}
)
```

## 5. Authentication

All API requests must include the API key in the `Authorization` header, in the format `Bearer YOUR_XAI_API_KEY`.

## 6. Rate Limits

- **Limits**:
  - 1 request per second.
  - 60 or 1,200 requests per hour (depending on the model).
- **Handling Suggestion**: Implement retry logic, catch 429 (too many requests) errors and retry after a delay.

## 7. Error Handling

Common error codes include:

| **Error Code** | **Description** | **Handling Method** |
|--------------|----------|--------------|
| 403 | Forbidden access | Check if the API key is correct. |
| 404 | Not found | Confirm the endpoint and model name are correct. |
| 429 | Too many requests | Retry after a delay. |
| 500 | Internal server error | Contact the support team. |

**Example** (error handling):

```python
import time
try:
    response = client.chat.completions.create(...)
except Exception as e:
    if e.status_code == 429:
        print("Too many requests, retrying in 60 seconds...")
        time.sleep(60)
    else:
        print(f"Error: {e}")
```

## 8. Cost Management

- **Pricing** (per million tokens):
  - Grok 2: $2
  - Grok Beta: $5
- **Free Trial**: During the public beta, $25 of free API credits are provided monthly.
- **Optimization Suggestions**:
  - Use concise prompts to reduce token usage.
  - Choose appropriate models (e.g., Grok 2 for simple tasks).
  - Enable streaming responses to reduce latency.
  - Set `max_tokens` to limit output length.

## 9. Advanced Features

### 9.1 Multimodal Support
Grok supports text and image processing, with more modalities (such as audio) to be supported in the future. Currently, the multimodal version of `grok-3-beta` can process image inputs.

### 9.2 Streaming Responses
By setting `stream=True`, you can receive responses in real-time, suitable for interactive applications:

```python
response = client.chat.completions.create(
    model="grok-3-beta",
    messages=[{"role": "user", "content": "Hello"}],
    stream=True
)
for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

## 10. Deployment Considerations

- **Security**:
  - Store API keys in environment variables, avoid hardcoding.
  - Use HTTPS to ensure communication security.
- **Scalability**:
  - Use asynchronous requests to handle high concurrency.
  - Implement local caching to optimize performance.
- **Monitoring**:
  - Track API latency, token usage, and error rates.
  - Use logging or monitoring tools (such as Prometheus) to analyze performance.

## 11. Limitations

As this documentation is based on public information and third-party guides, it may have the following limitations:
- **Incomplete Information**: Official documentation may contain more endpoints or the latest features.
- **Price Changes**: It's recommended to confirm the latest pricing on the xAI platform.
- **Model Availability**: Some models may require specific permissions.

## 12. Additional Resources

- [xAI Official Documentation](https://docs.x.ai/docs/overview)
- [The Hitchhiker's Guide to Grok](https://docs.x.ai/docs/tutorial)
- [Getting Started with xAI's Grok API](https://lablab.ai/t/xai-beginner-tutorial)
- Support email: support@x.ai

## 13. Conclusion

The Grok API provides a powerful and easy-to-use interface that allows developers to integrate Grok's AI capabilities into applications. This documentation covers everything from obtaining API keys to advanced features, including code examples and best practices. As the information may be incomplete, it's recommended to regularly visit the [xAI official documentation](https://docs.x.ai/docs/overview) for the latest information.

## Key References
- [xAI API Official Documentation](https://docs.x.ai/docs/overview)
- [How to Get a Grok API Key](https://www.merge.dev/blog/grok-api-key)
- [Grok API Beginner Tutorial](https://lablab.ai/t/xai-beginner-tutorial) 