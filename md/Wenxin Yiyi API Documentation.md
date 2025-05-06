# Wenxin Yiyi API Documentation

## Key Points
- **Wenxin Yiyi API Overview**: Wenxin Yiyi is Baidu's ERNIE series large language model API, accessible through the Qianfan platform.
- **Model Features**: Offers multiple model variants, from lightweight to high-performance, supporting various context lengths (8K to 128K).
- **Obtaining Keys**: Register through the Baidu Intelligent Cloud Qianfan platform and obtain API keys.
- **Authentication Flow**: Use API Key and Secret Key to obtain an access token for authentication.
- **Limitations**: Compiled based on public information, recommend referring to official documentation for the latest details.

## Introduction
The Wenxin Yiyi (ERNIE Bot) API is an interface service based on Baidu's ERNIE (Enhanced Representation through Knowledge Integration) series models, allowing developers to integrate advanced natural language processing capabilities into applications. Wenxin Yiyi supports various application scenarios from general conversations to high-performance reasoning, offering models with different performance levels and context lengths. The API is provided through the Baidu Intelligent Cloud Qianfan platform.

## Model List
Wenxin Yiyi offers the following main models:

| **Model Name** | **Description** | **Use Cases** |
|--------------|----------|--------------|
| `ERNIE-Bot` | General conversation model | Conversations, Q&A |
| `ERNIE-Bot-turbo` | Fast response model | Real-time applications |
| `ERNIE-Bot-4` | Advanced conversation model | Complex tasks |
| `ERNIE-Speed-8K` | Speed-optimized, 8K tokens | Fast tasks |
| `ERNIE-Speed-128K` | Speed-optimized, 128K tokens | Long context tasks |
| `ERNIE-4.0-8K` | High-performance model, 8K tokens | High-precision tasks |
| `ERNIE-4.0-8K-Preview` | High-performance preview version | Testing new features |
| `ERNIE-3.5-8K` | Balanced performance, 8K tokens | General tasks |
| `ERNIE-3.5-8K-Preview` | Balanced performance preview version | Testing new features |
| `ERNIE-Lite-8K` | Lightweight model | Simple tasks |
| `ERNIE-Tiny-8K` | Ultra-lightweight model | Low-resource environments |
| `ERNIE-Character-8K` | Character conversation model | Personalized conversations |
| `ERNIE Speed-AppBuilder` | Application development model | Custom applications |

## Obtaining API Keys
1. Visit the [Baidu Intelligent Cloud Qianfan Platform](https://cloud.baidu.com/), register and create an application.
2. Obtain the AppID, API Key, and Secret Key.
3. Use the API Key and Secret Key to obtain an access token.

## Authentication Flow
Wenxin Yiyi API uses access tokens for authentication, obtained as follows:

```python
import requests

# Get access_token
def get_access_token(api_key, secret_key):
    url = f"https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id={api_key}&client_secret={secret_key}"
    response = requests.post(url)
    return response.json().get("access_token")

access_token = get_access_token("YOUR_API_KEY", "YOUR_SECRET_KEY")
```

## API Call Example
Here's an example of calling the Wenxin Yiyi API using Python:

```python
import requests

# Using the previously obtained access_token
access_token = "YOUR_ACCESS_TOKEN"

url = f"https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie_bot?access_token={access_token}"
headers = {"Content-Type": "application/json"}
data = {
    "messages": [
        {"role": "user", "content": "Hello!"}
    ]
}
response = requests.post(url, headers=headers, json=data)
print(response.json()["result"])
```

## Model Selection Guide

### Performance Levels
- **High Performance**: `ERNIE-4.0-8K`, `ERNIE-Bot-4`
- **Balanced Performance**: `ERNIE-3.5-8K`, `ERNIE-Bot`
- **Lightweight**: `ERNIE-Lite-8K`, `ERNIE-Tiny-8K`, `ERNIE-Bot-turbo`

### Context Length
- **Standard Context**: Most models support 8K tokens
- **Long Context**: `ERNIE-Speed-128K` supports 128K tokens

### Specialization
- **Role Playing**: `ERNIE-Character-8K`
- **Application Development**: `ERNIE Speed-AppBuilder`

## Cost Management
- **Pricing**: Charged by token, for specific prices please refer to the [Baidu Intelligent Cloud Qianfan Platform](https://cloud.baidu.com/).
- **Optimization Suggestions**:
  - Use `ERNIE-Lite-8K` or `ERNIE-Tiny-8K` for simple tasks to reduce costs.
  - Only use `ERNIE-Speed-128K` when processing long documents.
  - Control conversation turns to reduce unnecessary token usage.
  - Optimize prompts to improve response efficiency.

## Best Practices
1. **Model Selection**:
   - Choose appropriate model versions based on task complexity.
   - Use ERNIE-4.0 series for high-performance reasoning.
   - For real-time applications, prioritize models with Speed designation.

2. **Security**:
   - Securely store API Key and Secret Key.
   - Regularly update access tokens, avoid using the same token for extended periods.
   - Use HTTPS to ensure communication security.

3. **Performance Optimization**:
   - Implement access_token caching (typically valid for 30 days).
   - Locally cache frequently requested content.
   - Implement error retry mechanisms for handling network exceptions.

## Multi-functional Templates
Wenxin Yiyi supports setting system prompts to control model behavior:

```python
data = {
    "messages": [
        {"role": "system", "content": "You are a professional customer service assistant, please provide concise answers."},
        {"role": "user", "content": "When will my order be delivered?"}
    ]
}
```

## Important Notes
- Access tokens have a limited validity period and need to be refreshed before expiration.
- Some advanced models may require additional permission applications.
- API usage is subject to Baidu Intelligent Cloud's service agreements.
- Model versions may update over time, recommend checking the official documentation regularly.

## More Resources
For more information, visit the [Baidu Intelligent Cloud Qianfan Platform](https://cloud.baidu.com/) or refer to the [Wenxin Yiyi API Documentation](https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html). 