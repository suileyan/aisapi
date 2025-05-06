# Gemini API Documentation

## Key Points

- **Gemini API Overview**: Gemini is a large language model developed by Google, with API support for text generation, multimodal tasks (such as image processing), and streaming responses.
- **Obtaining Keys**: API keys can be obtained through Google AI Studio or Google Cloud Console.
- **Usage Methods**: Supports Python, JavaScript, Go, and REST API, compatible with OpenAI SDK.
- **Cost**: Charged based on usage, specific pricing available on the Google Cloud platform.
- **Limitations**: Information based on public resources, may not cover the latest features, recommend referring to official documentation.

## Introduction

The Gemini API allows developers to integrate Google's Gemini AI models into applications, supporting text generation, conversation, multimodal tasks (such as image analysis), and streaming responses. The API can be accessed through Google Cloud's Vertex AI or Google AI Studio, compatible with various programming languages and tools. This documentation provides multiple usage examples, including Python, JavaScript, Go, and REST API.

## Obtaining API Keys

1. **Google AI Studio**: Visit [Google AI Studio](https://aistudio.google.com/app/apikey), sign in to your Google account, and generate an API key.
2. **Google Cloud Vertex AI**:
   - Visit [Google Cloud Console](https://cloud.google.com/), create a project.
   - Enable Vertex AI API, generate service account keys or OAuth tokens.
3. **Secure Storage**: Store the key in environment variables to avoid hardcoding.

## Basic API Call Example

Here's an example using Python (Gen AI SDK) to call the Gemini API:

```python
from google import genai
from google.genai.types import HttpOptions

client = genai.Client(http_options=HttpOptions(api_version="v1"))
response = client.models.generate_content(model="gemini-2.0-flash-001", contents="Hello!")
print(response.text)
```

## More Information

For more examples and detailed documentation, visit [Google AI Developer Documentation](https://ai.google.dev/gemini-api/docs) or [Vertex AI Gemini API](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference).

---

# Detailed Gemini API Documentation

## 1. Introduction

Gemini is a multimodal large language model developed by Google, supporting text generation, conversation, image processing, and other tasks. The Gemini API is provided through Google Cloud's Vertex AI or Google AI Studio, allowing developers to integrate these features into applications. The API design is flexible, supporting multiple programming languages (Python, JavaScript, Go, etc.) and calling methods (SDK, REST API). This documentation is compiled based on official documents and GitHub examples, covering usage examples from entry-level to advanced features. As information may be incomplete, it's recommended to refer to the [Google AI Developer Documentation](https://ai.google.dev/gemini-api/docs) for the latest information.

### 1.1 Available Models

Gemini API supports the following main models:

| **Model** | **Description** | **Use Cases** |
|----------|----------|--------------|
| `gemini-2.0-flash-001` | Lightweight model, fast response | Simple text generation, real-time applications |
| `gemini-2.0-pro-001` | High-performance model, supports multimodal | Complex reasoning, image analysis |
| `gemini-1.5-flash` | Optimized version, balance of performance and cost | General tasks, multimodal |
| `gemini-1.5-pro` | Advanced model, extra-long context | Long text processing, complex tasks |

- **Selection Recommendation**: For simple tasks, choose `gemini-2.0-flash-001`; for multimodal or complex reasoning, choose `gemini-2.0-pro-001` or `gemini-1.5-pro`.

## 2. Getting Started

### 2.1 Obtaining API Keys

To use the Gemini API, you need an API key or service account credentials:

1. **Google AI Studio**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
   - Sign in to your Google account, click "Create API Key".
   - Copy the key and store it in a secure location.
2. **Google Cloud Vertex AI**:
   - Sign in to the [Google Cloud Console](https://cloud.google.com/), create or select a project.
   - Enable Vertex AI API (navigate to "APIs & Services" > "Enable APIs").
   - Create a service account, generate keys (JSON format) or use OAuth tokens.
3. **Environment Variables**: Store the key as an environment variable (such as `GOOGLE_API_KEY` or `GOOGLE_CLOUD_CREDENTIALS`):

   ```python
   import os
   os.environ["GOOGLE_API_KEY"] = "your_api_key"
   ```

### 2.2 Setting Up the Development Environment

Gemini API supports the following development tools:

- **Google Gen AI SDK**: Official Python SDK, recommended for most tasks.
  - Installation: `pip install google-generativeai`
- **OpenAI SDK**: Compatible with Vertex AI's OpenAI-format endpoints.
  - Installation: `pip install openai`
- **Google AI JavaScript SDK**: For web applications.
  - Installation: `npm install @google/generative-ai`
- **Go SDK**: For Go development.
  - Installation: `go get google.golang.org/genai`
- **REST API**: Direct calls through HTTP requests.

## 3. API Call Examples

The following are various examples of calling the Gemini API, covering text generation, multimodal tasks, and streaming responses.

### 3.1 Text Generation

#### Python (Gen AI SDK)

```python
from google import genai
from google.genai.types import HttpOptions

client = genai.Client(http_options=HttpOptions(api_version="v1"))
response = client.models.generate_content(
    model="gemini-2.0-flash-001",
    contents="How does artificial intelligence work?"
)
print(response.text)
```

#### Python (OpenAI-Compatible)

```python
from google.auth import default
import google.auth.transport.requests
import openai

credentials, _ = default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
credentials.refresh(google.auth.transport.requests.Request())
client = openai.OpenAI(
    base_url=f"https://us-central1-aiplatform.googleapis.com/v1/projects/your-project-id/locations/us-central1/endpoints/openapi",
    api_key=credentials.token
)
response = client.chat.completions.create(
    model="google/gemini-2.0-flash-001",
    messages=[{"role": "user", "content": "Why is the sky blue?"}]
)
print(response.choices[0].message.content)
```

#### Go

```go
package main

import (
    "context"
    "fmt"
    "io"
    "google.golang.org/genai"
)

func generateWithText(w io.Writer) error {
    ctx := context.Background()
    client, err := genai.NewClient(ctx, &genai.ClientConfig{
        HTTPOptions: genai.HTTPOptions{APIVersion: "v1"},
    })
    if err != nil {
        return err
    }
    resp, err := client.Models.GenerateContent(ctx, "gemini-2.0-flash-001", genai.Text("How does artificial intelligence work?"), nil)
    if err != nil {
        return err
    }
    fmt.Fprintln(w, resp.Text())
    return nil
}
```

#### JavaScript

```javascript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "YOUR_API_KEY" });

async function main() {
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "How does artificial intelligence work?"
    });
    console.log(response.text);
}
await main();
```

#### REST (curl)

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY" \
    -H 'Content-Type: application/json' \
    -X POST \
    -d '{"contents":[{"parts":[{"text":"How does artificial intelligence work?"}]}]}'
```

### 3.2 Multimodal Prompts

#### Python (Gen AI SDK)

```python
from google import genai
from google.genai.types import HttpOptions, Part

client = genai.Client(http_options=HttpOptions(api_version="v1"))
response = client.models.generate_content(
    model="gemini-2.0-flash-001",
    contents=["What does this image show?", Part.from_uri(file_uri="gs://cloud-samples-data/generative-ai/image/scones.jpg", mime_type="image/jpeg")]
)
print(response.text)
```

#### Python (OpenAI-Compatible)

```python
from google.auth import default
import google.auth.transport.requests
import openai

credentials, _ = default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
credentials.refresh(google.auth.transport.requests.Request())
client = openai.OpenAI(
    base_url=f"https://us-central1-aiplatform.googleapis.com/v1/projects/your-project-id/locations/us-central1/endpoints/openapi",
    api_key=credentials.token
)
response = client.chat.completions.create(
    model="google/gemini-2.0-flash-001",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Describe the following image:"},
            {"type": "image_url", "image_url": "gs://cloud-samples-data/generative-ai/image/scones.jpg"}
        ]
    }]
)
print(response.choices[0].message.content)
```

#### Go

```go
package main

import (
    "context"
    "fmt"
    "io"
    "google.golang.org/genai"
)

func generateWithTextImage(w io.Writer) error {
    ctx := context.Background()
    client, err := genai.NewClient(ctx, &genai.ClientConfig{
        HTTPOptions: genai.HTTPOptions{APIVersion: "v1"},
    })
    if err != nil {
        return err
    }
    contents := []*genai.Content{{
        Parts: []*genai.Part{
            {Text: "What does this image show?"},
            {FileData: &genai.FileData{FileURI: "gs://cloud-samples-data/generative-ai/image/scones.jpg", MIMEType: "image/jpeg"}},
        },
    }}
    resp, err := client.Models.GenerateContent(ctx, "gemini-2.0-flash-001", contents, nil)
    if err != nil {
        return err
    }
    fmt.Fprintln(w, resp.Text())
    return nil
}
```

### 3.3 Streaming Responses

#### Python (Gen AI SDK)

```python
from google import genai
from google.genai.types import HttpOptions

client = genai.Client(http_options=HttpOptions(api_version="v1"))
for chunk in client.models.generate_content_stream(model="gemini-2.0-flash-001", contents="Why is the sky blue?"):
    print(chunk.text, end="")
```

#### Python (OpenAI-Compatible)

```python
from google.auth import default
import google.auth.transport.requests
import openai

credentials, _ = default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
credentials.refresh(google.auth.transport.requests.Request())
client = openai.OpenAI(
    base_url=f"https://us-central1-aiplatform.googleapis.com/v1/projects/your-project-id/locations/us-central1/endpoints/openapi",
    api_key=credentials.token
)
response = client.chat.completions.create(
    model="google/gemini-2.0-flash-001",
    messages=[{"role": "user", "content": "Why is the sky blue?"}],
    stream=True
)
for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")
```

#### Go

```go
package main

import (
    "context"
    "fmt"
    "io"
    "google.golang.org/genai"
)

func generateWithTextStream(w io.Writer) error {
    ctx := context.Background()
    client, err := genai.NewClient(ctx, &genai.ClientConfig{
        HTTPOptions: genai.HTTPOptions{APIVersion: "v1"},
    })
    if err != nil {
        return err
    }
    stream, err := client.Models.GenerateContentStream(ctx, "gemini-2.0-flash-001", genai.Text("Why is the sky blue?"), nil)
    if err != nil {
        return err
    }
    for stream.Next() {
        fmt.Fprint(w, stream.Current.Text())
    }
    return stream.Err()
}
```

### 3.4 Web Applications (JavaScript SDK)

```javascript
import { GoogleGenAI } from "@google/generative-ai";

const genAI = new GoogleGenAI("YOUR_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function run() {
    const prompt = "Generate a short story.";
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
}
run();
```

## 4. Parameter Configuration

API calls support the following key parameters:

| **Parameter** | **Type** | **Description** |
|----------|----------|----------|
| `model` | string | Specifies the model (e.g., `gemini-2.0-flash-001`). |
| `contents` | string/list | Input content, supports text or multimodal (text+image). |
| `temperature` | float | Controls output randomness (0.0 to 1.0, default 0.7). |
| `max_tokens` | integer | Maximum output token count. |
| `stream` | boolean | Whether to enable streaming responses (`True` or `False`). |

**Example** (setting JSON output):

```python
response = client.models.generate_content(
    model="gemini-2.0-flash-001",
    contents="Return a greeting in JSON format",
    generation_config={"response_mime_type": "application/json"}
)
```

## 5. Authentication

- **Google AI Studio**: Use API key, in the format `Authorization: Bearer YOUR_API_KEY`.
- **Vertex AI**: Use Google Cloud credentials (service account key or OAuth token).
- **Environment Variables**: Recommended to set `GOOGLE_API_KEY` or `GOOGLE_CLOUD_CREDENTIALS`.

## 6. Rate Limits

- **Limits**: Varies by account type and region, typically 1-10 requests per second.
- **Handling Suggestion**: Catch 429 errors, retry after delay (e.g., 60 seconds).

## 7. Error Handling

Common error codes:

| **Error Code** | **Description** | **Handling Method** |
|--------------|----------|--------------|
| 401 | Unauthorized | Check if API key or credentials are correct. |
| 404 | Not Found | Confirm model name and endpoint are correct. |
| 429 | Too Many Requests | Retry after delay. |
| 500 | Server Error | Contact Google Cloud support. |

**Example** (Python error handling):

```python
import time
try:
    response = client.models.generate_content(...)
except Exception as e:
    if e.code == 429:
        print("Too many requests, retrying in 60 seconds...")
        time.sleep(60)
    else:
        print(f"Error: {e}")
```

## 8. Cost Management

- **Pricing**: Charged by token, specific prices can be found on the [Google Cloud Pricing Page](https://cloud.google.com/vertex-ai/pricing).
- **Free Quota**: Google AI Studio provides limited free calls, Vertex AI may offer trial credits.
- **Optimization Suggestions**:
  - Use concise prompts to reduce token usage.
  - Choose lightweight models (such as `gemini-2.0-flash-001`) for simple tasks.
  - Set `max_tokens` to limit output length.
  - Monitor usage to avoid overspending.

## 9. Advanced Features

### 9.1 Multimodal Support

Gemini supports text, image, and other inputs, with potential future support for audio. See the "Multimodal Prompts" section for examples.

### 9.2 Streaming Responses

By setting `stream=True`, receive responses in real-time, suitable for interactive applications. See the "Streaming Responses" section for examples.

### 9.3 Function Calling

Gemini supports function calling, allowing the model to call external tools. Refer to the [Function Calling Guide](https://ai.google.dev/gemini-api/docs/function-calling).

## 10. Deployment Considerations

- **Security**:
  - Store API keys in environment variables, avoid hardcoding.
  - Use HTTPS to ensure communication security.
- **Scalability**:
  - Use asynchronous requests to handle high concurrency.
  - Implement local caching to optimize performance.
- **Monitoring**:
  - Track API latency, token usage, and error rates.
  - Use Google Cloud Monitoring or Prometheus to analyze performance.
- **Compliance**:
  - Review Google's data processing protocols to ensure compliance with privacy and legal requirements.
  - Avoid sending sensitive information in requests.

## 11. Limitations

- **Incomplete Information**: This documentation is based on public information and may not cover the latest features.
- **Price Changes**: Confirm the latest pricing on the Google Cloud platform.
- **Model Availability**: Some models may require specific permissions or regional support. 