# DeepSeek API Documentation

DeepSeek is a company focused on large language models (LLMs), developing models such as DeepSeek-V3 and DeepSeek-R1. Their API allows developers to integrate these models into applications, supporting text generation, dialogue, and complex reasoning tasks. This documentation provides detailed information on how to use the DeepSeek API, including getting started, API methods, model selection, parameter configuration, cost management, and deployment considerations.

## Getting Started

### Obtaining an API Key

To use the DeepSeek API, you'll need an API key. Follow these steps:

1. Visit the DeepSeek platform.
2. Register or log in to your account.
3. Find the "API Keys" section in the left navigation bar.
4. Click "Create API Key," then immediately copy and securely store the generated key. **Note**: Once generated, the key cannot be viewed again; if lost, you'll need to generate a new one.

### Environment Setup

The DeepSeek API is compatible with the OpenAI API format, so you can use the OpenAI SDK or other compatible tools. We recommend installing the OpenAI Python library:

```bash
pip install openai
```

Additionally, ensure your development environment supports HTTPS requests and properly manages API keys (environment variables are recommended).

## API Usage Methods

The base URL for the DeepSeek API is `https://api.deepseek.com` (or `https://api.deepseek.com/v1`, compatible with OpenAI, where `v1` doesn't represent a model version). Below are two common methods for making API calls.

### Using curl

You can send HTTP requests directly using `curl`. Here's an example of calling the `chat/completions` endpoint:

```bash
curl https://api.deepseek.com/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_API_KEY" \
-d '{
    "model": "deepseek-chat",
    "messages": [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"}
    ],
    "stream": false
}'
```

- **Details**:
  - `model`: Specifies the model (here, `deepseek-chat`).
  - `messages`: Conversation history, including `role` (`system`, `user`, or `assistant`) and `content`.
  - `stream`: Set to `false` for complete responses at once; set to `true` for streaming responses.

### Using the OpenAI SDK

The OpenAI SDK provides a more convenient way to make API calls. Here's a Python example:

```python
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.deepseek.com"
)

response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "Hello"}
    ],
    stream=False
)

print(response.choices[0].message.content)
```

- **Installation**: Run `pip install openai`.
- **Streaming Responses**: Set `stream` to `True` to receive responses in chunks, suitable for real-time applications.
- **Error Handling**: We recommend adding try-except blocks to handle network or rate-limiting errors (see "Deployment Considerations").

### Using Other Tools

You can also use API testing tools like Apidog:

1. Create an HTTP project, setting the base URL to `https://api.deepseek.com`.
2. Configure `Authorization: Bearer YOUR_API_KEY`.
3. Paste the request body from the `curl` example above, send the request, and debug.

## Model Introduction

The DeepSeek API offers two main models:

| **Model** | **Description** | **Use Cases** |
| --- | --- | --- |
| `deepseek-chat` | DeepSeek-V3, a general conversation model trained on a 15 trillion token dataset | Daily conversations, text generation, simple tasks |
| `deepseek-reasoner` | DeepSeek-R1, designed for complex reasoning, supports Chain-of-Thought (CoT) | Mathematics, logical reasoning, complex problem-solving |

- **Selection Recommendations**:
  - For ordinary conversations or content generation, choose `deepseek-chat` (more cost-effective).
  - For tasks requiring step-by-step reasoning (such as mathematical or logical problems), choose `deepseek-reasoner`.

## Parameter Configuration

The API calls support the following key parameters:

| **Parameter** | **Type** | **Description** |
| --- | --- | --- |
| `model` | string | Specifies the model (`deepseek-chat` or `deepseek-reasoner`). |
| `messages` | array | Conversation history, including `role` (`system`, `user`, `assistant`) and `content`. |
| `stream` | boolean | Whether to enable streaming responses (`true` for chunk-by-chunk return, `false` for one-time return). |
| `temperature` | float | Controls output randomness (default 1.0, 0.0 for deterministic tasks, 1.5 for creative tasks). |
| `response_format` | object | Can be set to `{"type": "json_object"}` to force JSON format returns, reducing token usage. |

- **Example** (setting JSON output):

```python
response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "Return a greeting in JSON format"}],
    response_format={"type": "json_object"}
)
```

## Cost Management

The DeepSeek API is charged by token, with specific prices as follows (per million tokens):

| **Model** | **Input (Cache Hit)** | **Input (Cache Miss)** | **Output** |
| --- | --- | --- | --- |
| `deepseek-chat` | $0.07 | $0.27 | $1.10 |
| `deepseek-reasoner` | $0.14 | $0.55 | $2.19 |

### Context Caching

- **Feature**: Caching of repeated inputs, reducing input costs by approximately 74%.
- **Usage**: API responses include `prompt_cache_hit_tokens` and `prompt_cache_miss_tokens`, which can be used to monitor cache effectiveness.
- **Example** (checking cache usage):

```python
response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "You are a helpful assistant."}]
)
print(f"Cache hits: {response.usage.prompt_cache_hit_tokens}")
print(f"Cache misses: {response.usage.prompt_cache_miss_tokens}")
```

- **Limitations**: Caching requires at least 64 tokens, and cache validity ranges from several hours to several days.

### Cost Optimization Suggestions

1. **Optimize Prompts**: Use concise prompts to reduce token usage. For example, optimized prompts can reduce token consumption from 1165 to 496, lowering costs from $0.00255 to $0.00109.
2. **Choose the Appropriate Model**: Use `deepseek-chat` for simple tasks and `deepseek-reasoner` for complex reasoning.
3. **Enable Caching**: Utilize context caching for repeated queries.
4. **Set `max_tokens`**: Limit output length to control costs.
5. **Use JSON Format**: Reduce redundant output through `response_format`.

## Advanced Features

### Chain-of-Thought (CoT) Reasoning

- **Compatible Model**: `deepseek-reasoner`.
- **Feature**: Supports step-by-step reasoning, suitable for complex problems (such as mathematical or logical reasoning).
- **Cost**: Both reasoning process and final answer are charged at $2.19/million tokens, with a maximum CoT token count of 32k.
- **Optimization Suggestions**: Use clear prompts and limit reasoning steps to control costs.

### Streaming Responses

- **Feature**: By setting `stream=true`, receive responses in real-time, suitable for interactive applications.
- **Example** (streaming response):

```python
response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "Hello"}],
    stream=True
)
for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

## Deployment Considerations

When deploying the DeepSeek API in a production environment, consider the following factors:

### Security

- **Key Management**: Store API keys in environment variables, avoiding hardcoding.
- **Communication Security**: Always use HTTPS.
- **Rate Limiting Protection**: Implement client-side rate limiting to prevent abuse.

### Scalability

- **Asynchronous Processing**: Use asynchronous requests to handle high concurrency.
- **Caching Mechanism**: Combine context caching with local caching to optimize performance.
- **Retry Logic**: Add retry mechanisms for transient errors (such as network issues).

### Error Handling

- **Rate Limiting Errors (429)**: Catch and retry after a delay.
- **Example**:

```python
import time
try:
    response = client.chat.completions.create(...)
except Exception as e:
    if e.status_code == 429:
        print("Rate limiting error, retrying in 60 seconds...")
        time.sleep(60)
    else:
        print(f"Error: {e}")
```

### Monitoring

- **Metrics**: Track API latency, token usage, and error rates.
- **Tools**: Use logging or monitoring platforms (such as Prometheus) to analyze performance.

### Cost Optimization

- **Streaming Responses**: Reduce latency, potentially lowering costs.
- **Limited Output**: Set `max_tokens` to control response length.
- **Regular Reviews**: Monitor token usage, optimize prompts and model selection.

### Compliance

- **Data Processing**: Review DeepSeek's data processing protocols to ensure compliance with your privacy and legal requirements.
- **Data Storage**: Avoid sending sensitive information in API requests.

## Additional Resources

- DeepSeek Official API Documentation
- DeepSeek Platform
- DataCamp DeepSeek API Tutorial
- Medium DeepSeek API Developer Guide
