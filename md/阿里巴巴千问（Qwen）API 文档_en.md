# Alibaba Qwen API Documentation

## Introduction

Tongyi Qwen is an advanced large language model series developed by Alibaba Cloud, providing powerful text generation, conversation capabilities, and multimodal processing features. This documentation explains how to call Qwen services via API.

> **Note**: This documentation is compiled based on public information. Please refer to the [Alibaba Cloud official documentation](https://dashscope.aliyun.com) for the most accurate information.

## Key Features

- High-quality text generation and conversation capabilities
- Multimodal support (image understanding and generation)
- Long context understanding
- Code generation and analysis capabilities
- OpenAI compatible interface

## Available Models

| **Model Name** | **Characteristics** | **Suitable Scenarios** |
|----------------|---------------------|------------------------|
| `qwen-turbo` | Fast response, low latency | Real-time conversations, simple Q&A |
| `qwen-plus` | Stronger understanding and reasoning capabilities | Complex reasoning, professional tasks |
| `qwen-max` | Highest performance, supports longer context | High-requirement tasks, complex analysis |

> Model versions and parameters are updated regularly. Please refer to the [official documentation](https://dashscope.aliyun.com) for the latest information.

## Getting Started

### 1. Obtain API Key

1. Visit the [Alibaba Cloud website](https://www.alibabacloud.com/), register and complete identity verification
2. Go to the [Model Studio console](https://www.alibabacloud.com/help/en/model-studio) to activate the service
3. Create and save your key on the "API Keys" page
4. Set up environment variables (recommended):

   ```bash
   export DASHSCOPE_API_KEY="your_api_key"
   ```

### 2. Choose Call Method

Qwen API supports two main calling methods:

#### Method One: Using DashScope SDK (Officially Recommended)

**Install Python SDK**:

```bash
pip install dashscope
```

**Basic Usage Example**:

```python
import dashscope
from dashscope import Generation

# Set API key (can also be set via environment variables)
dashscope.api_key = "your_api_key"

# Call API
response = Generation.call(
    model=Generation.Models.qwen_turbo,
    messages=[
        {'role': 'system', 'content': 'You are a helpful assistant.'},
        {'role': 'user', 'content': 'Please introduce natural language processing technology.'}
    ]
)

# Process response
if response.status_code == 200:
    print(response.output.choices[0].message.content)
else:
    print(f"Error: {response.code}, {response.message}")
```

#### Method Two: Using OpenAI Compatible Interface

**Install OpenAI SDK**:

```bash
pip install openai
```

**Basic Usage Example**:

```python
from openai import OpenAI

client = OpenAI(
    api_key="your_dashscope_api_key",
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
)

response = client.chat.completions.create(
    model="qwen-turbo",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Please introduce natural language processing technology."}
    ]
)

print(response.choices[0].message.content)
```

## API Parameter Description

### Basic Parameters

| **Parameter** | **Type** | **Description** | **Default Value** |
|---------------|----------|-----------------|-------------------|
| `model` | string | Model name, e.g., `qwen-turbo` | - |
| `messages` | array | Conversation history, containing role and content | - |
| `temperature` | float | Controls randomness, range 0-2 | 1.0 |
| `max_tokens` | integer | Maximum number of tokens to generate | Model dependent |
| `top_p` | float | Controls diversity, range 0-1 | 1.0 |
| `stream` | boolean | Whether to enable streaming response | `false` |
| `seed` | integer | Random seed, for result reproducibility | Random |

### Message Format

Each object in the message array must contain the following fields:

```json
{
  "role": "user", // Possible values: "system", "user", "assistant"
  "content": "Hello, please introduce yourself."
}
```

## Advanced Features

### Streaming Response

Streaming response allows real-time reception of generated content, suitable for chat interfaces:

```python
# Using DashScope SDK
response = Generation.call(
    model=Generation.Models.qwen_turbo,
    messages=[{"role": "user", "content": "Tell a story"}],
    stream=True
)

for chunk in response:
    if chunk.status_code == 200:
        print(chunk.output.choices[0].message.content, end="")

# Using OpenAI compatible interface
response = client.chat.completions.create(
    model="qwen-turbo",
    messages=[{"role": "user", "content": "Tell a story"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### Multimodal Input

Qwen supports processing image inputs, requires using a multimodal model:

```python
response = client.chat.completions.create(
    model="qwen-vl-plus",  # Use a vision-supported model
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What's in this image?"},
                {
                    "type": "image_url",
                    "image_url": {"url": "https://example.com/image.jpg"}
                }
            ]
        }
    ]
)
```

### JSON Format Response

Request the model to output structured JSON:

```python
response = client.chat.completions.create(
    model="qwen-turbo",
    messages=[{"role": "user", "content": "Generate a list containing three fruits and their prices"}],
    response_format={"type": "json_object"}
)
```

## Error Handling

### Common Error Codes

| **Status Code** | **Description** | **Solution** |
|-----------------|-----------------|--------------|
| 401 | Authentication failed | Check API key |
| 404 | Resource does not exist | Check model name and API path |
| 429 | Too many requests | Reduce request frequency |
| 500 | Server error | Try again later |

### Error Handling Example

```python
import time

def call_with_retry(max_retries=3):
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="qwen-turbo",
                messages=[{"role": "user", "content": "Hello"}]
            )
            return response
        except Exception as e:
            if hasattr(e, 'status_code') and e.status_code == 429:
                wait_time = (attempt + 1) * 2  # Exponential backoff
                print(f"Rate limit reached, waiting {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                print(f"Error: {str(e)}")
                break
    return None
```

## Cost and Limitations

- **Billing Method**: Charged based on token usage
- **Rates**: Pricing varies by model, with `qwen-turbo` < `qwen-plus` < `qwen-max`
- **Rate Limits**: Depends on account level, generally ranging from dozens to hundreds of requests per minute
- **Context Length**: Supports context windows ranging from 8K to 128K tokens depending on the model

## Best Practices

1. **Streamline Prompts**: Reduce unnecessary descriptions to lower token consumption
2. **Batch Processing**: Combine requests to reduce the number of API calls
3. **Error Retry**: Implement exponential backoff retry mechanisms
4. **Local Caching**: Cache common query responses
5. **Security Handling**:
   - Do not hardcode API keys in client-side code
   - Set request timeouts
   - Do not transmit sensitive personal information

## Additional Resources

- [Alibaba Cloud DashScope Platform](https://dashscope.aliyun.com)
- [Qwen GitHub Repository](https://github.com/QwenLM/Qwen)
- [Qwen API Pricing](https://www.alibabacloud.com/help/en/model-studio)
- [Alibaba Cloud Technical Support](https://www.alibabacloud.com/contact)
