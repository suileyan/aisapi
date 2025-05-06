# Doubao API Documentation

## Key Points

- **Doubao API Overview**: Doubao is a large language model developed by ByteDance, with API support for text generation and conversation tasks.
- **Obtaining Keys**: Register on the Volcano Engine platform to create API keys and inference endpoints.
- **Usage Methods**: Use Volcano Engine SDK or OpenAI SDK (with adjusted base URL and keys).
- **Cost**: Charged by token, with free quotas (500,000 tokens per model, plus an additional 500 million tokens until August 2024).
- **Limitations**: Information based on third-party guides, may be incomplete; refer to official documentation for details.

## Introduction

The Doubao API allows developers to integrate ByteDance's AI models into applications, supporting text generation, conversation, and other functions. It's provided through the Volcano Engine platform and is compatible with the OpenAI API format, making it easy to use. This documentation explains how to get started with the Doubao API, including obtaining keys, setting up the environment, and usage methods.

## Obtaining API Keys

1. Visit the [Volcano Engine Console](https://console.volcengine.com/ark/), register, and complete identity verification.
2. Navigate to [API Key Management](https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey) and create a key.
3. Create an endpoint in [Model Inference](https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint) and record the endpoint ID (e.g., `ep-xxxxxxxxxxx`).

## Basic API Call

Here's an example using the OpenAI SDK, requiring adjustment to the base URL and key:

```python
from openai import OpenAI
client = OpenAI(api_key="YOUR_API_KEY", base_url="https://ark.cn-beijing.volces.com/api/v3")
response = client.chat.completions.create(
    model="YOUR_ENDPOINT_ID",  # e.g., "ep-xxxxxxxxxxx"
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"}
    ]
)
print(response.choices[0].message.content)
```

## More Information

As the information may be incomplete, visit the [Volcano Engine Documentation](https://www.volcengine.com/docs/82379/1298454) for detailed guides.

---

# Doubao API Documentation

## 1. Introduction

Doubao is a large language model provided by ByteDance's Volcano Engine (Volcengine), designed to offer powerful natural language processing capabilities to developers. The Doubao API supports text generation, conversation, and complex reasoning tasks, widely used in content creation, customer service, and data analysis. The API design is compatible with the OpenAI API, allowing developers to use familiar tools (such as the OpenAI SDK) or the official Volcano Engine SDK for integration. This documentation is compiled based on the Volcano Engine official website and third-party guides (such as CSDN blogs), covering usage methods from entry-level to advanced features. As direct access to complete official documentation may be limited, we recommend referring to the [Volcano Engine Official Documentation](https://www.volcengine.com/docs/82379/1298454) for the latest information.

### 1.1 Available Models

Doubao offers multiple models suitable for different scenarios:

| **Model** | **Description** | **Use Cases** |
|-----------|-----------------|---------------|
| `Doubao-pro-4k` | High-performance model, 4k token context | Complex tasks, short text processing |
| `Doubao-pro-8k` | High-performance model, 8k token context | Complex tasks, medium-length text |
| `Doubao-pro-32k` | High-performance model, 32k token context | Ultra-long text processing |
| `Doubao-lite-4k` | Lightweight model, 4k token context | Simple tasks, cost-sensitive |
| `Doubao-lite-8k` | Lightweight model, 8k token context | Simple tasks, cost-sensitive |
| `Doubao-lite-32k` | Lightweight model, 32k token context | Ultra-long text, cost-sensitive |

- **Selection Recommendation**: For complex reasoning or long text processing, choose `Doubao-pro-32k`; for simple tasks, choose `Doubao-lite-4k` or `Doubao-lite-8k` to reduce costs.

## 2. Getting Started

### 2.1 Obtaining an API Key

To use the Doubao API, you need an API key. Follow these steps:

1. Visit the [Volcano Engine Console](https://console.volcengine.com/ark/), register an account, and complete identity verification.
2. Go to [API Key Management](https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey).
3. Click **Create API Key**, enter a name (such as "Doubao Test"), generate the key, and store it securely.
4. **Note**: Once generated, the key cannot be viewed again; if lost, you'll need to generate a new one.

### 2.2 Creating an Inference Endpoint

Doubao models need to be called through inference endpoints:

1. Go to [Model Inference](https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint).
2. Select a model (such as `Doubao-pro-32k`) and version (usually in date format, like `240515`).
3. Click **Add**, name the endpoint (recommended to use the model name, like `Doubao-pro-32k-240515`).
4. Record the endpoint ID (in format like `ep-xxxxxxxxxxx`), used for API calls.

### 2.3 Setting Up the Development Environment

The Doubao API supports the following development methods:

- **OpenAI SDK**: Compatible with OpenAI's call format by adjusting the base URL and key.
  - Installation: `pip install openai`
- **Volcano Engine SDK**: Officially recommended, providing more native support.
  - Installation: `pip install --upgrade 'volcengine-python-sdk[ark]'`
- **Environment Variables**: It's recommended to store the API key as an environment variable (such as `ARK_API_KEY`) to enhance security:

  ```python
  import os
  os.environ["ARK_API_KEY"] = "your_api_key"
  ```

## 3. API Call Methods

The base URL for the Doubao API is `https://ark.cn-beijing.volces.com/api/v3`. Here are several calling methods.

### 3.1 Using the OpenAI SDK

Since the Doubao API is compatible with the OpenAI API, you can use the OpenAI SDK:

```python
from openai import OpenAI

client = OpenAI(
    api_key="your_api_key",
    base_url="https://ark.cn-beijing.volces.com/api/v3"
)

response = client.chat.completions.create(
    model="your_endpoint_id",  # e.g., "ep-xxxxxxxxxxx"
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"}
    ],
    stream=False
)

print(response.choices[0].message.content)
```

- **Details**:
  - `model`: Use the ID of the inference endpoint (like `ep-xxxxxxxxxxx`), not the model name.
  - `messages`: Conversation history, containing `role` (`system`, `user`, `assistant`) and `content`.
  - `stream`: Set to `False` for one-time return; set to `True` to enable streaming responses.

### 3.2 Using the Volcano Engine SDK

Volcano Engine provides an official SDK (volcengine-python-sdk). Here's a hypothetical call example (specific methods need to reference the official documentation):

```python
from volcengine.ark import ArkClient

client = ArkClient(api_key="your_api_key")

response = client.chat_completions.create(
    model="your_endpoint_id",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)
```

- **Note**: Actual SDK methods may differ; please refer to the [Volcano Engine SDK Documentation](https://github.com/volcengine/volcengine-java-sdk) or Python SDK guide.

### 3.3 Using the Python requests Library

For lower-level control, you can use HTTP requests directly:

```python
import requests
import json

url = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
headers = {
    "Authorization": "Bearer your_api_key",
    "Content-Type": "application/json"
}
data = {
    "model": "your_endpoint_id",
    "messages": [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"}
    ],
    "temperature": 0.7,
    "stream": False
}

response = requests.post(url, headers=headers, json=data)
print(json.loads(response.content)["choices"][0]["message"]["content"])
```

## 4. Parameter Configuration

API calls support the following key parameters:

| **Parameter** | **Type** | **Description** |
|---------------|----------|-----------------|
| `model` | string | Inference endpoint ID (like `ep-xxxxxxxxxxx`). |
| `messages` | array | Conversation history, containing `role` (`system`, `user`, `assistant`) and `content`. |
| `temperature` | float | Controls output randomness (0.0 to 2.0, default 1.0). |
| `max_tokens` | integer | Maximum output token count. |
| `stream` | boolean | Whether to enable streaming responses (`True` or `False`). |
| `response_format` | object | Can be set to `{"type": "json_object"}` to force JSON format returns. |

**Example** (setting JSON output):

```python
response = client.chat.completions.create(
    model="your_endpoint_id",
    messages=[{"role": "user", "content": "Return a greeting in JSON format"}],
    response_format={"type": "json_object"}
)
```

## 5. Authentication

API requests require the key in the `Authorization` header, in the format `Bearer YOUR_API_KEY`. Alternatively, set the key as the environment variable `ARK_API_KEY`.

## 6. Rate Limits

- **Limits**:
  - 1 request per second.
  - 60 or 1,200 requests per hour (depending on the model).
- **Handling Suggestion**: Catch 429 errors (too many requests) and retry after a delay.

## 7. Error Handling

Common error codes:

| **Error Code** | **Description** | **Handling Method** |
|----------------|-----------------|---------------------|
| 403 | Forbidden access | Check if the API key is correct. |
| 404 | Not found | Confirm the endpoint ID and endpoint are correct. |
| 429 | Too many requests | Retry after a delay. |
| 500 | Internal server error | Contact Volcano Engine support. |

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

### 8.1 Pricing

Charged by token, with specific prices as follows (per million tokens):

| **Model** | **Input** | **Output** |
|-----------|-----------|------------|
| `Doubao-lite-4k/8k/32k` | 0.3 CNY | 0.6 CNY |
| `Doubao-pro-4k/8k/32k` | 0.8 CNY | 2.0 CNY |

### 8.2 Free Quotas

- **Basic Quota**: 500,000 tokens per model, no expiration date.
- **Promotional Quota**: Additional 500,000,000 tokens per model, until August 30, 2024.
- **Claiming Method**: Click "Participate" in [Open Management](https://console.volcengine.com/ark/region:ark+cn-beijing/openManagement) and authorize the model.

### 8.3 Optimization Suggestions

1. Use concise prompts to reduce token usage.
2. Choose lightweight models (like `Doubao-lite-4k`) for simple tasks.
3. Set `max_tokens` to limit output length.
4. Utilize free quotas for testing and development.

## 9. Advanced Features

### 9.1 Streaming Responses

By setting `stream=True`, receive responses in real-time, suitable for interactive applications:

```python
response = client.chat.completions.create(
    model="your_endpoint_id",
    messages=[{"role": "user", "content": "Hello"}],
    stream=True
)
for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### 9.2 Multimodal Support

Doubao may support image or audio processing in the future, but currently primarily focuses on text processing. For information about multimodal features, please follow official updates.

## 10. Deployment Considerations

- **Security**:
  - Store API keys in environment variables, avoiding hardcoding.
  - Use HTTPS to ensure communication security.
- **Scalability**:
  - Use asynchronous requests to handle high concurrency.
  - Implement local caching to optimize performance.
- **Monitoring**:
  - Track API latency, token usage, and error rates.
  - Use logging or monitoring tools (such as Prometheus) to analyze performance.
- **Compliance**:
  - Review Volcano Engine's data processing protocols to ensure compliance with privacy and legal requirements.
  - Avoid sending sensitive information in requests.
  