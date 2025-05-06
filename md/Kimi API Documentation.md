# Kimi API Documentation

## Key Points
- **Kimi API Overview**: Kimi is a large language model developed by Moonshot AI, with API support for text generation, conversation, and long-text processing.
- **Model Highlights**: Supports ultra-long context (up to 128K tokens), excels at long text processing and complex reasoning.
- **Obtaining Keys**: Register through the Moonshot AI platform and create API keys.
- **Cost**: Charged by token usage, supports dynamic context length selection to optimize costs.
- **Limitations**: Compiled based on public information, recommend referring to official documentation for the latest details.

## Introduction
The Kimi API is an interface provided by Moonshot AI that allows developers to integrate the Kimi large language model into applications. Kimi is known for its powerful long-text processing and reasoning capabilities, supporting multiple context length variants. The API is compatible with the OpenAI SDK, allowing developers to use it by simply adjusting the base URL and API key.

## Model List
Kimi API supports the following models:

| **Model Name** | **Description** | **Use Cases** |
|--------------|----------|--------------|
| `moonshot-v1-8k` | Supports 8k token context | Short text dialogues, quick tasks |
| `moonshot-v1-32k` | Supports 32k token context | Medium-length document processing |
| `moonshot-v1-128k` | Supports 128k token context | Long document analysis, complex reasoning |
| `moonshot-v1-auto` | Automatically selects context length | Dynamic tasks, cost optimization |

## Obtaining API Keys
1. Visit the [Moonshot AI Platform](https://www.moonshot.cn/), register an account.
2. Create a key on the "API Keys" page in the console.
3. Save the key and set it as an environment variable (e.g., `MOONSHOT_API_KEY`).

## API Call Example
Here's an example of calling the Kimi API using Python and the OpenAI SDK:

```python
from openai import OpenAI

client = OpenAI(api_key="YOUR_MOONSHOT_API_KEY", base_url="https://api.moonshot.cn/v1")
response = client.chat.completions.create(
    model="moonshot-v1-128k",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"}
    ]
)
print(response.choices[0].message.content)
```

## Cost Management
- **Pricing**: Charged by token, for specific prices please refer to the [Moonshot AI Platform](https://www.moonshot.cn/).
- **Optimization Suggestions**:
  - Use the `moonshot-v1-auto` model to dynamically select context length, optimizing costs.
  - Simplify prompts to reduce unnecessary token usage.
  - Only use high-context models when long text processing is needed.

## Best Practices
1. **Model Selection**:
   - For simple dialogues and quick response tasks, choose `moonshot-v1-8k`.
   - When processing long documents or requiring complex reasoning, use `moonshot-v1-128k`.
   - When task context length is uncertain, use `moonshot-v1-auto` for automatic optimization.

2. **Security**:
   - Store API keys in environment variables, avoid hardcoding.
   - Use HTTPS to ensure communication security.

3. **Performance Optimization**:
   - Utilize asynchronous requests to handle concurrent tasks.
   - Implement local caching mechanisms to reduce repeated requests.

## Important Notes
- Model versions may update over time, recommend checking the official documentation regularly.
- Some advanced features may require specific permissions or additional configuration.
- API usage is subject to the terms and policies of the Moonshot AI platform.

## More Resources
For more information, visit the [Moonshot AI Official Website](https://www.moonshot.cn/) or refer to the [API Documentation](https://platform.moonshot.cn/docs). 