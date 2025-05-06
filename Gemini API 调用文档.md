# Gemini API 调用文档

## 关键点

- **Gemini API 概述**：Gemini 是谷歌开发的大型语言模型，API 支持文本生成、多模态任务（如图像处理）和流式响应。
- **获取密钥**：通过 Google AI Studio 或 Google Cloud 控制台获取 API 密钥。
- **调用方式**：支持 Python、JavaScript、Go 和 REST API，兼容 OpenAI SDK。
- **成本**：按使用量计费，需在 Google Cloud 平台查看具体定价。
- **限制**：信息基于公开资料，可能不涵盖最新功能，建议参考官方文档。

## 简介

Gemini API 允许开发者将谷歌的 Gemini AI 模型集成到应用程序中，支持文本生成、对话、多模态任务（如图像分析）和流式响应。API 可通过 Google Cloud 的 Vertex AI 或 Google AI Studio 访问，兼容多种编程语言和工具。本文档提供多种调用示例，包括 Python、JavaScript、Go 和 REST API。

## 获取 API 密钥

1. **Google AI Studio**：访问 [Google AI Studio](https://aistudio.google.com/app/apikey)，登录 Google 账户，生成 API 密钥。
2. **Google Cloud Vertex AI**：
   - 访问 [Google Cloud 控制台](https://cloud.google.com/)，创建项目。
   - 启用 Vertex AI API，生成服务账户密钥或 OAuth 令牌。
3. **安全存储**：将密钥存储在环境变量中，避免硬编码。

## 基本 API 调用示例

以下是使用 Python（Gen AI SDK）调用 Gemini API 的示例：

```python
from google import genai
from google.genai.types import HttpOptions

client = genai.Client(http_options=HttpOptions(api_version="v1"))
response = client.models.generate_content(model="gemini-2.0-flash-001", contents="你好！")
print(response.text)
```

## 更多信息

更多示例和详细文档，请访问 [Google AI 开发者文档](https://ai.google.dev/gemini-api/docs) 或 [Vertex AI Gemini API](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference)。

---

# 详细的 Gemini API 调用文档

## 1. 简介

Gemini 是谷歌开发的多模态大型语言模型，支持文本生成、对话、图像处理等任务。Gemini API 通过 Google Cloud 的 Vertex AI 或 Google AI Studio 提供，允许开发者将这些功能集成到应用程序中。API 设计灵活，支持多种编程语言（Python、JavaScript、Go 等）和调用方式（SDK、REST API）。本文档基于官方文档和 GitHub 示例整理，涵盖从入门到高级功能的调用示例。由于信息可能不完整，建议参考 [Google AI 开发者文档](https://ai.google.dev/gemini-api/docs) 获取最新信息。

### 1.1 可用模型

Gemini API 支持以下主要模型：

| **模型** | **描述** | **适用场景** |
|----------|----------|--------------|
| `gemini-2.0-flash-001` | 轻量级模型，快速响应 | 简单文本生成、实时应用 |
| `gemini-2.0-pro-001` | 高性能模型，支持多模态 | 复杂推理、图像分析 |
| `gemini-1.5-flash` | 优化版，平衡性能和成本 | 通用任务、多模态 |
| `gemini-1.5-pro` | 高级模型，超长上下文 | 长文本处理、复杂任务 |

- **选择建议**：对于简单任务，选择 `gemini-2.0-flash-001`；对于多模态或复杂推理，选择 `gemini-2.0-pro-001` 或 `gemini-1.5-pro`。

## 2. 入门指南

### 2.1 获取 API 密钥

要使用 Gemini API，您需要一个 API 密钥或服务账户凭据：

1. **Google AI Studio**：
   - 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)。
   - 登录 Google 账户，点击“创��� API 密钥”。
   - 复制密钥并存储在安全位置。
2. **Google Cloud Vertex AI**：
   - 登录 [Google Cloud 控制台](https://cloud.google.com/)，创建或选择项目。
   - 启用 Vertex AI API（导航至“API 和服务” > “启用 API”）。
   - 创建服务账户，生成密钥（JSON 格式）或使用 OAuth 令牌。
3. **环境变量**：将密钥存储为环境变量（如 `GOOGLE_API_KEY` 或 `GOOGLE_CLOUD_CREDENTIALS`）：

   ```python
   import os
   os.environ["GOOGLE_API_KEY"] = "your_api_key"
   ```

### 2.2 设置开发环境

Gemini API 支持以下开发工具：

- **Google Gen AI SDK**：官方 Python SDK，推荐用于大多数任务。
  - 安装：`pip install google-generativeai`
- **OpenAI SDK**：兼容 Vertex AI 的 OpenAI 格式端点。
  - 安装：`pip install openai`
- **Google AI JavaScript SDK**：用于 Web 应用。
  - 安装：`npm install @google/generative-ai`
- **Go SDK**：用于 Go 开发。
  - 安装：`go get google.golang.org/genai`
- **REST API**：直接通过 HTTP 请求调用。

## 3. API 调用示例

以下是 Gemini API 的多种调用示例，涵盖文本生成、多模态任务和流式响应。

### 3.1 文本生成

#### Python (Gen AI SDK)

```python
from google import genai
from google.genai.types import HttpOptions

client = genai.Client(http_options=HttpOptions(api_version="v1"))
response = client.models.generate_content(
    model="gemini-2.0-flash-001",
    contents="人工智能是如何工作的？"
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
    messages=[{"role": "user", "content": "为什么天空是蓝色的？"}]
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
    resp, err := client.Models.GenerateContent(ctx, "gemini-2.0-flash-001", genai.Text("人工智能是如何工作的？"), nil)
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
        contents: "人工智能是如何工作的？"
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
    -d '{"contents":[{"parts":[{"text":"人工智能是如何工作的？"}]}]}'
```

### 3.2 多模态提示

#### Python (Gen AI SDK)

```python
from google import genai
from google.genai.types import HttpOptions, Part

client = genai.Client(http_options=HttpOptions(api_version="v1"))
response = client.models.generate_content(
    model="gemini-2.0-flash-001",
    contents=["这张图片显示了什么？", Part.from_uri(file_uri="gs://cloud-samples-data/generative-ai/image/scones.jpg", mime_type="image/jpeg")]
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
            {"type": "text", "text": "描述以下图片："},
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
    client, err := gen—this is a truncated line, please complete it
    if err != nil {
        return err
    }
    contents := []*genai.Content{{
        Parts: []*genai.Part{
            {Text: "这张图片显示了什么？"},
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

### 3.3 流式响应

#### Python (Gen AI SDK)

```python
from google import genai
from google.genai.types import HttpOptions

client = genai.Client(http_options=HttpOptions(api_version="v1"))
for chunk in client.models.generate_content_stream(model="gemini-2.0-flash-001", contents="为什么天空是蓝色的？"):
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
    messages=[{"role": "user", "content": "为什么天空是蓝色的？"}],
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
    stream, err := client.Models.GenerateContentStream(ctx, "gemini-2.0-flash-001", genai.Text("为什么天空是蓝色的？"), nil)
    if err != nil {
        return err
    }
    for stream.Next() {
        fmt.Fprint(w, stream.Current.Text())
    }
    return stream.Err()
}
```

### 3.4 Web 应用（JavaScript SDK）

```javascript
import { GoogleGenAI } from "@google/generative-ai";

const genAI = new GoogleGenAI("YOUR_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function run() {
    const prompt = "生成一个简短的故事。";
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
}
run();
```

## 4. 参数配置

API 调用支持以下关键参数：

| **参数** | **类型** | **描述** |
|----------|----------|----------|
| `model` | 字符串 | 指定模型（如 `gemini-2.0-flash-001`）。 |
| `contents` | 字符串/列表 | 输入内容，支持文本或多模态（文本+图像）。 |
| `temperature` | 浮点数 | 控制输出随机性（0.0 到 1.0，默认 0.7）。 |
| `max_tokens` | 整数 | 最大输出令牌数。 |
| `stream` | 布尔值 | 是否启用流式响应（`True` 或 `False`）。 |

**示例**（设置 JSON 输出）：

```python
response = client.models.generate_content(
    model="gemini-2.0-flash-001",
    contents="返回 JSON 格式的问候",
    generation_config={"response_mime_type": "application/json"}
)
```

## 5. 认证

- **Google AI Studio**：使用 API 密钥，格式为 `Authorization: Bearer YOUR_API_KEY`。
- **Vertex AI**：使用 Google Cloud 凭据（服务账户密钥或 OAuth 令牌）。
- **环境变量**：推荐设置 `GOOGLE_API_KEY` 或 `GOOGLE_CLOUD_CREDENTIALS`。

## 6. 速率限制

- **限制**：视账户类型和区域而定，通常为每秒 1-10 个请求。
- **处理建议**：捕获 429 错误，延迟重试（例如 60 秒）。

## 7. 错误处理

常见错误代码：

| **错误代码** | **描述** | **处理方法** |
|--------------|----------|--------------|
| 401 | 未授权 | 检查 API 密钥或凭据是否正确。 |
| 404 | 未找到 | 确认模型名称和端点是否正确。 |
| 429 | 请求过多 | 延迟后重试。 |
| 500 | 服务器错误 | 联系 Google Cloud 支持。 |

**示例**（Python 错误处理）：

```python
import time
try:
    response = client.models.generate_content(...)
except Exception as e:
    if e.code == 429:
        print("请求过多，60秒后重试...")
        time.sleep(60)
    else:
        print(f"错误: {e}")
```

## 8. 成本管理

- **定价**：按令牌计费，具体价格需在 [Google Cloud 定价页面](https://cloud.google.com/vertex-ai/pricing) 查看。
- **免费额度**：Google AI Studio 提供有限免费调用，Vertex AI 可能提供试用额度。
- **优化建议**：
  - 使用简洁提示词减少令牌使用。
  - 选择轻量级模型（如 `gemini-2.0-flash-001`）处理简单任务。
  - 设置 `max_tokens` 限制输出长度。
  - 监控使用量，避免超支。

## 9. 高级功能

### 9.1 多模态支持

Gemini 支持文本、图像等输入，未来可能支持音频。示例见“多模态提示”部分。

### 9.2 流式响应

通过设置 `stream=True`，实时接收响应，适合交互式应用。示例见“流式响应”部分。

### 9.3 函数调用

Gemini 支持函数调用，允许模型调用外部工具。需参考 [函数调用指南](https://ai.google.dev/gemini-api/docs/function-calling)。

## 10. 部署注意事项

- **安全性**：
  - 将 API 密钥存储在环境变量中，避免硬编码。
  - 使用 HTTPS 确保通信安全。
- **可扩展性**：
  - 使用异步请求处理高并发。
  - 实现本地缓存优化性能。
- **监控**：
  - 跟踪 API 延迟、令牌使用量和错误率。
  - 使用 Google Cloud Monitoring 或 Prometheus 分析性能。
- **合规性**：
  - 审查 Google 的数据处理协议，确保符合隐私和法律要求。
  - 避免在请求中发送敏感信息。

## 11. 局限性

- **信息不完整**：本文档基于公开信息，可能未涵盖最新功能。
- **价格变化**：需在 Google Cloud 平台确认最新定价。
- **模型可用性**：某些模型可能需要特定权限或区域支持。
