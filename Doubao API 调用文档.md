# 豆包 API 调用文档

## 关键点

- **豆包 API 概述**：豆包（Doubao）是字节跳动开发的大型语言模型，API 支持文本生成和对话任务。
- **获取密钥**：在火山引擎平台注册，创建 API 密钥和推理接入点。
- **调用方式**：使用火山引擎 SDK 或 OpenAI SDK（需调整基础 URL 和密钥）。
- **成本**：按令牌计费，提供免费额度（每模型 50 万令牌，额外 5 亿令牌至 2024 年 8 月）。
- **限制**：信息基于第三方指南，可能不完整，建议查阅官方文档。

## 简介

豆包 API 允许开发者将字节跳动的 AI 模型集成到应用中，支持文本生成、对话等功能。它通过火山引擎平台提供，与 OpenAI API 格式兼容，易于使用。本文档介绍如何开始使用豆包 API，包括获取密钥、设置环境和调用方法。

## 获取 API 密钥

1. 访问 [火山引擎控制台](https://console.volcengine.com/ark/)，注册并完成实名认证。
2. 进入 [API 密钥管理](https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey)，创建密钥。
3. 在 [模型推理](https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint) 创建接入点，记录接入点 ID（如 `ep-xxxxxxxxxxx`）。

## 基本 API 调用

以下是使用 OpenAI SDK 的示例，需调整基础 URL 和密钥：

```python
from openai import OpenAI
client = OpenAI(api_key="您的API密钥", base_url="https://ark.cn-beijing.volces.com/api/v3")
response = client.chat.completions.create(
    model="您的接入点ID",  # 例如 "ep-xxxxxxxxxxx"
    messages=[
        {"role": "system", "content": "你是一个有用的助手。"},
        {"role": "user", "content": "你好！"}
    ]
)
print(response.choices[0].message.content)
```

## 更多信息

由于信息可能不完整，建议访问 [火山引擎文档](https://www.volcengine.com/docs/82379/1298454) 获取详细指南。

---

# 豆包 API 调用文档

## 1. 简介

豆包（Doubao）是字节跳动旗下火山引擎（Volcengine）提供的大型语言模型，旨在为开发者提供强大的自然语言处理能力。豆包 API 支持文本生成、对话和复杂推理任务，广泛应用于内容创作、客户服务和数据分析等领域。API 设计与 OpenAI API 兼容，开发者可使用熟悉的工具（如 OpenAI SDK）或火山引擎官方 SDK 进行集成。本文档基于火山引擎官网和第三方指南（如 CSDN 博客）整理，涵盖从入门到高级功能的使用方法。由于无法直接访问完整官方文档，建议参考 [火山引擎官方文档](https://www.volcengine.com/docs/82379/1298454) 获取最新信息。

### 1.1 可用模型

豆包提供多种模型，适用于不同场景：

| **模型** | **描述** | **适用场景** |
|----------|----------|--------------|
| `Doubao-pro-4k` | 高性能模型，4k 令牌上下文 | 复杂任务、短文本处理 |
| `Doubao-pro-8k` | 高性能模型，8k 令牌上下文 | 复杂任务、中长文本 |
| `Doubao-pro-32k` | 高性能模型，32k 令牌上下文 | 超长文本处理 |
| `Doubao-lite-4k` | 轻量级模型，4k 令牌上下文 | 简单任务、成本敏感 |
| `Doubao-lite-8k` | 轻量级模型，8k 令牌上下文 | 简单任务、成本敏感 |
| `Doubao-lite-32k` | 轻量级模型，32k 令牌上下文 | 超长文本、成本敏感 |

- **选择建议**：对于复杂推理或长文本处理，选择 `Doubao-pro-32k`；对于简单任务，选择 `Doubao-lite-4k` 或 `Doubao-lite-8k` 以降低成本。

## 2. 入门指南

### 2.1 获取 API 密钥

要使用豆包 API，您需要一个 API 密钥。请按照以下步骤操作：

1. 访问 [火山引擎控制台](https://console.volcengine.com/ark/)，注册账户并完成实名认证。
2. 进入 [API 密钥管理](https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey)。
3. 点击 **创建 API 密钥**，填写名称（如"豆包测试"），生成密钥并妥善保存。
4. **注意**：密钥生成后无法再次查看，若丢失需重新生成。

### 2.2 创建推理接入点

豆包模型需通过推理接入点调用：

1. 进入 [模型推理](https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint)。
2. 选择模型（如 `Doubao-pro-32k`）和版本（通常为日期格式，如 `240515`）。
3. 点击 **添加**，命名接入点（建议使用模型名称，如 `Doubao-pro-32k-240515`）。
4. 记录接入点 ID（格式如 `ep-xxxxxxxxxxx`），用于 API 调用。

### 2.3 设置开发环境

豆包 API 支持以下开发方式：

- **OpenAI SDK**：通过调整基础 URL 和密钥，兼容 OpenAI 的调用格式。
  - 安装：`pip install openai`
- **火山引擎 SDK**：官方推荐，提供更原生的支持。
  - 安装：`pip install --upgrade 'volcengine-python-sdk[ark]'`
- **环境变量**：建议将 API 密钥存储为环境变量（如 `ARK_API_KEY`）以提高安全性：

  ```python
  import os
  os.environ["ARK_API_KEY"] = "your_api_key"
  ```

## 3. API 调用方法

豆包 API 的基础 URL 为 `https://ark.cn-beijing.volces.com/api/v3`。以下介绍几种调用方式。

### 3.1 使用 OpenAI SDK

由于豆包 API 与 OpenAI API 兼容，您可以使用 OpenAI SDK：

```python
from openai import OpenAI

client = OpenAI(
    api_key="your_api_key",
    base_url="https://ark.cn-beijing.volces.com/api/v3"
)

response = client.chat.completions.create(
    model="your_endpoint_id",  # 例如 "ep-xxxxxxxxxxx"
    messages=[
        {"role": "system", "content": "你是一个有用的助手。"},
        {"role": "user", "content": "你好！"}
    ],
    stream=False
)

print(response.choices[0].message.content)
```

- **说明**：
  - `model`：使用推理接入点的 ID（如 `ep-xxxxxxxxxxx`），而非模型名称。
  - `messages`：对话历史，包含 `role`（`system`、`user`、`assistant`）和 `content`。
  - `stream`：设为 `False` 表示一次性返回；设为 `True` 启用流式响应。

### 3.2 使用火山引擎 SDK

火山引擎提供官方 SDK（volcengine-python-sdk），以下是一个假设的调用示例（具体方法需参考官方文档）：

```python
from volcengine.ark import ArkClient

client = ArkClient(api_key="your_api_key")

response = client.chat_completions.create(
    model="your_endpoint_id",
    messages=[
        {"role": "system", "content": "你是一个有用的助手。"},
        {"role": "user", "content": "你好！"}
    ]
)

print(response.choices[0].message.content)
```

- **注意**：实际 SDK 方法可能不同，请查阅 [火山引擎 SDK 文档](https://github.com/volcengine/volcengine-java-sdk) 或 Python SDK 指南。

### 3.3 使用 Python requests 库

对于底层控制，可直接使用 HTTP 请求：

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
        {"role": "system", "content": "你是一个有用的助手。"},
        {"role": "user", "content": "你好！"}
    ],
    "temperature": 0.7,
    "stream": False
}

response = requests.post(url, headers=headers, json=data)
print(json.loads(response.content)["choices"][0]["message"]["content"])
```

## 4. 参数配置

API 调用支持以下关键参数：

| **参数** | **类型** | **描述** |
|----------|----------|----------|
| `model` | 字符串 | 推理接入点 ID（如 `ep-xxxxxxxxxxx`）。 |
| `messages` | 列表 | 对话历史，包含 `role`（`system`、`user`、`assistant`）和 `content`。 |
| `temperature` | 浮点数 | 控制输出随机性（0.0 到 2.0，默认 1.0）。 |
| `max_tokens` | 整数 | 最大输出令牌数。 |
| `stream` | 布尔值 | 是否启用流式响应（`True` 或 `False`）。 |
| `response_format` | 对象 | 可设为 `{"type": "json_object"}`，强制返回 JSON 格式。 |

**示例**（设置 JSON 输出）：

```python
response = client.chat.completions.create(
    model="your_endpoint_id",
    messages=[{"role": "user", "content": "返回 JSON 格式的问候"}],
    response_format={"type": "json_object"}
)
```

## 5. 认证

API 请求需在 `Authorization` 头中包含密钥，格式为 `Bearer YOUR_API_KEY`。或者，将密钥设为环境变量 `ARK_API_KEY`。

## 6. 速率限制

- **限制**：
  - 每秒 1 个请求。
  - 每小时 60 或 1,200 个请求（视模型而定）。
- **处理建议**：捕获 429 错误（请求过多），延迟重试。

## 7. 错误处理

常见错误代码：

| **错误代码** | **描述** | **处理方法** |
|--------------|----------|--------------|
| 403 | 禁止访问 | 检查 API 密钥是否正确。 |
| 404 | 未找到 | 确认接入点 ID 和端点是否正确。 |
| 429 | 请求过多 | 延迟后重试。 |
| 500 | 内部服务器错误 | 联系火山引擎支持。 |

**示例**（错误处理）：

```python
import time
try:
    response = client.chat.completions.create(...)
except Exception as e:
    if e.status_code == 429:
        print("请求过多，60秒后重试...")
        time.sleep(60)
    else:
        print(f"错误: {e}")
```

## 8. 成本管理

### 8.1 定价

按令牌计费，具体价格如下（每百万令牌）：

| **模型** | **输入** | **输出** |
|----------|----------|----------|
| `Doubao-lite-4k/8k/32k` | 0.3 CNY | 0.6 CNY |
| `Doubao-pro-4k/8k/32k` | 0.8 CNY | 2.0 CNY |

### 8.2 免费额度

- **基础额度**：每个模型 500,000 令牌，无到期日。
- **促销额度**：每个模型额外 500,000,000 令牌，截止 2024 年 8 月 30 日。
- **领取方式**：在 [开放管理](https://console.volcengine.com/ark/region:ark+cn-beijing/openManagement) 点击"参与"并授权模型。

### 8.3 优化建议

1. 使用简洁提示词减少令牌使用。
2. 选择轻量级模型（如 `Doubao-lite-4k`）处理简单任务。
3. 设置 `max_tokens` 限制输出长度。
4. 利用免费额度测试和开发。

## 9. 高级功能

### 9.1 流式响应

通过设置 `stream=True`，实时接收响应，适合交互式应用：

```python
response = client.chat.completions.create(
    model="your_endpoint_id",
    messages=[{"role": "user", "content": "你好"}],
    stream=True
)
for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### 9.2 多模态支持

豆包未来可能支持图像或音频处理，但当前主要为文本处理。有关多模态功能，请关注官方更新。

## 10. 部署注意事项

- **安全性**：
  - 将 API 密钥存储在环境变量中，避免硬编码。
  - 使用 HTTPS 确保通信安全。
- **可扩展性**：
  - 使用异步请求处理高并发。
  - 实现本地缓存优化性能。
- **监控**：
  - 跟踪 API 延迟、令牌使用量和错误率。
  - 使用日志或监控工具（如 Prometheus）分析性能。
- **合规性**：
  - 审查火山引擎的数据处理协议，确保符合隐私和法律要求。
  - 避免在请求中发送敏感信息。
