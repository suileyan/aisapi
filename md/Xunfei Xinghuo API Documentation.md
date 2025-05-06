# Xunfei Xinghuo API Documentation

## Key Points
- **Xunfei Xinghuo API Overview**: Developed by iFLYTEK, offering a range of models from lightweight to high-performance applications.
- **Model Features**: Supports various context lengths (4K to 128K), suitable for scenarios from simple conversations to complex reasoning.
- **Obtaining Keys**: Register through the iFLYTEK Open Platform to obtain AppID, API Key, and Secret Key.
- **Cost**: Charged by token usage, with 500,000 free tokens provided for each model.
- **Limitations**: Compiled based on public information, recommend referring to official documentation for the latest details.

## Introduction
The Xunfei Xinghuo (Spark) API is a large language model interface provided by iFLYTEK, allowing developers to integrate advanced natural language processing capabilities into their applications. The Spark series models support various scenarios from lightweight applications to high-performance needs, offering multiple context length variants. The API is accessible through Python SDK and RESTful interfaces.

## Model List
Xunfei Xinghuo API supports the following models:

| **Model Name** | **Description** | **Use Cases** |
|--------------|----------|--------------|
| `Lite` | Lightweight model, 4k token context | Simple conversations, quick responses |
| `Pro` | General-purpose model, 8k token context | General tasks, conversations |
| `Pro-128K` | Long context model, 128k tokens | Long document processing |
| `Max` | High-performance model, 8k tokens | Complex reasoning, generation |
| `Max-32K` | Extra-long context model, 32k tokens | Extra-long document analysis |
| `4.0 Ultra` | Top-tier performance model, 8k tokens | High-precision tasks, multimodal |
| `kjwx` | Scientific literature model | Academic document processing |

## Obtaining API Keys
1. Visit the [iFLYTEK Open Platform](https://www.xfyun.cn/), register and complete real-name verification.
2. Apply for API permissions in the console to obtain AppID, API Key, and Secret Key.
3. Use the keys to generate signatures for authentication.

## API Call Example
Here's an example of calling the Xunfei Xinghuo API using the Python SDK:

```python
from spark_ai_python import SparkClient

client = SparkClient(app_id="YOUR_APP_ID", api_key="YOUR_API_KEY", secret_key="YOUR_SECRET_KEY")
response = client.chat.completions.create(
    model="generalv3.5",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"}
    ]
)
print(response.choices[0].message.content)
```

## Cost Management
- **Pricing**: Charged by token, for specific prices please refer to the [iFLYTEK Open Platform](https://www.xfyun.cn/).
- **Free Quota**: 500,000 tokens provided free for each model.
- **Optimization Suggestions**:
  - Use the `Lite` model for simple tasks to reduce costs.
  - Control context length to avoid unnecessary token usage.
  - Develop effective prompts to improve model response efficiency.

## Best Practices
1. **Model Selection**:
   - For simple conversations and low-latency requirements, choose the `Lite` model.
   - For general tasks, use the `Pro` model.
   - For high-precision and complex reasoning, select the `Max` or `4.0 Ultra` models.
   - When processing long documents, choose either `Pro-128K` or `Max-32K` based on text length.
   - For academic literature processing, prefer the `kjwx` model.

2. **Security**:
   - Securely store your AppID, API Key, and Secret Key.
   - Implement secure signature verification mechanisms.
   - Use HTTPS to ensure communication security.

3. **Performance Optimization**:
   - Utilize concurrent requests for multi-tasking.
   - Implement caching mechanisms to reduce repeated requests.
   - Set appropriate timeout and retry policies.

## Important Notes
- Models require real-name verification before use.
- Some advanced features may require additional application or payment.
- API usage is subject to the terms of service of the iFLYTEK Open Platform.
- Model versions may update over time, recommend checking the official documentation regularly.

## More Resources
For more information, visit the [iFLYTEK Open Platform](https://www.xfyun.cn/) or refer to the [API Documentation](https://www.xfyun.cn/doc/spark). 