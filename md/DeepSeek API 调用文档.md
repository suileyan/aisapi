# DeepSeek API 调用文档

DeepSeek 是一家专注于人工智能大语言模型的公司，开发了如 DeepSeek-V3 和 DeepSeek-R1 等模型。其 API 允许开发者将这些模型集成到应用程序中，支持文本生成、对话和复杂推理任务。本文档详细介绍了如何调用 DeepSeek API，包括入门步骤、API 调用方法、模型选择、参数配置、成本管理和部署注意事项。

## 入门指南

### 获取 API 密钥

要使用 DeepSeek API，您需要一个 API 密钥。请按照以下步骤操作：

1. 访问 DeepSeek 平台。
2. 注册或登录账户。
3. 在左侧导航栏中找到“API Keys”部分。
4. 点击“创建 API 密钥”，生成密钥后立即复制并安全存储。**注意**：密钥生成后无法再次查看，若丢失需重新生成。

### 环境准备

DeepSeek API 与 OpenAI API 格式兼容，因此您可以使用 OpenAI SDK 或其他兼容工具。推荐安装 OpenAI Python 库：

```bash
pip install openai
```

此外，确保您的开发环境支持 HTTPS 请求，并妥善管理 API 密钥（建议使用环境变量）。

## API 调用方法

DeepSeek API 的基础 URL 为 `https://api.deepseek.com`（或 `https://api.deepseek.com/v1`，与 OpenAI 兼容，`v1` 不代表模型版本）。以下介绍两种常见的调用方式。

### 使用 curl

您可以通过 `curl` 直接发送 HTTP 请求。以下是一个调用 `chat/completions` 端点的示例：

```bash
curl https://api.deepseek.com/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer 您的API密钥" \
-d '{
    "model": "deepseek-chat",
    "messages": [
        {"role": "system", "content": "你是一个有用的助手。"},
        {"role": "user", "content": "你好！"}
    ],
    "stream": false
}'
```

- **说明**：
  - `model`：指定模型（此处为 `deepseek-chat`）。
  - `messages`：对话历史，包含 `role`（`system`、`user` 或 `assistant`）和 `content`。
  - `stream`：设为 `false` 表示一次性返回完整响应；设为 `true` 启用流式响应。

### 使用 OpenAI SDK

OpenAI SDK 提供更便捷的调用方式。以下是一个 Python 示例：

```python
from openai import OpenAI

client = OpenAI(
    api_key="您的API密钥",
    base_url="https://api.deepseek.com"
)

response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[
        {"role": "system", "content": "你是一个有用的助手"},
        {"role": "user", "content": "你好"}
    ],
    stream=False
)

print(response.choices[0].message.content)
```

- **安装**：运行 `pip install openai`。
- **流式响应**：将 `stream` 设为 `True`，逐块接收响应，适合实时应用。
- **错误处理**：建议添加 try-except 块处理网络或限流错误（见“部署注意事项”）。

### 使用其他工具

您还可以使用如 Apidog 的 API 测试工具：

1. 创建 HTTP 项目，设置基础 URL 为 `https://api.deepseek.com`。
2. 配置 `Authorization: Bearer 您的API密钥`。
3. 粘贴上述 `curl` 示例的请求体，发送请求并调试。

## 模型介绍

DeepSeek API 提供两种主要模型：

| **模型** | **描述** | **适用场景** |
| --- | --- | --- |
| `deepseek-chat` | DeepSeek-V3，通用对话模型，训练于 15 万亿 token 数据集 | 日常对话、文本生成、简单任务 |
| `deepseek-reasoner` | DeepSeek-R1，专为复杂推理设计，支持链式推理（CoT） | 数学、逻辑推理、复杂问题解决 |

- **选择建议**：
  - 对于普通对话或内容生成，选择 `deepseek-chat`（更便宜）。
  - 对于需要逐步推理的任务（如数学或逻辑问题），选择 `deepseek-reasoner`。

## 参数配置

API 调用支持以下关键参数：

| **参数** | **类型** | **描述** |
| --- | --- | --- |
| `model` | 字符串 | 指定模型（`deepseek-chat` 或 `deepseek-reasoner`）。 |
| `messages` | 列表 | 对话历史，包含 `role`（`system`、`user`、`assistant`）和 `content`。 |
| `stream` | 布尔值 | 是否启用流式响应（`true` 为逐块返回，`false` 为一次性返回）。 |
| `temperature` | 浮点数 | 控制输出随机性（默认 1.0，0.0 适合确定性任务，1.5 适合创意任务）。 |
| `response_format` | 对象 | 可设为 `{"type": "json_object"}`，强制返回 JSON 格式，减少 token 使用。 |

- **示例**（设置 JSON 输出）：

```python
response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "返回 JSON 格式的问候"}],
    response_format={"type": "json_object"}
)
```

## 成本管理

DeepSeek API 按 token 计费，具体价格如下（每百万 token）：

| **模型** | **输入（缓存命中）** | **输入（缓存未命中）** | **输出** |
| --- | --- | --- | --- |
| `deepseek-chat` | $0.07 | $0.27 | $1.10 |
| `deepseek-reasoner` | $0.14 | $0.55 | $2.19 |

### 上下文缓存

- **功能**：缓存重复输入，降低约 74% 的输入成本。
- **使用方法**：API 响应中包含 `prompt_cache_hit_tokens` 和 `prompt_cache_miss_tokens`，可用于监控缓存效果。
- **示例**（检查缓存使用）：

```python
response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "你是一个有用的助手。"}]
)
print(f"缓存命中: {response.usage.prompt_cache_hit_tokens}")
print(f"缓存未命中: {response.usage.prompt_cache_miss_tokens}")
```

- **限制**：缓存需至少 64 个 token，缓存有效期为数小时至数天。

### 成本优化建议

1. **优化提示词**：使用简洁提示词，减少 token 使用。例如，优化后的提示词可将 token 消耗从 1165 降至 496，成本从 $0.00255 降至 $0.00109。
2. **选择合适模型**：简单任务使用 `deepseek-chat`，复杂推理使用 `deepseek-reasoner`。
3. **启用缓存**：重复查询时利用上下文缓存。
4. **设置** `max_tokens`：限制输出长度，控制成本。
5. **使用 JSON 格式**：通过 `response_format` 减少冗余输出。

## 高级功能

### 链式推理（Chain-of-Thought, CoT）

- **适用模型**：`deepseek-reasoner`。
- **功能**：支持逐步推理，适合复杂问题（如数学或逻辑推理）。
- **成本**：推理过程和最终答案均按 $2.19/百万 token 计费，最大 CoT token 数为 32k。
- **优化建议**：使用清晰提示词，限制推理步骤以控制成本。

### 流式响应

- **功能**：通过设置 `stream=true`，实时接收响应，适合交互式应用。
- **示例**（流式响应）：

```python
response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "你好"}],
    stream=True
)
for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

## 部署注意事项

在生产环境中部署 DeepSeek API 时，请考虑以下因素：

### 安全性

- **密钥管理**：将 API 密钥存储在环境变量中，避免硬编码。
- **通信安全**：始终使用 HTTPS。
- **限流保护**：实现客户端限流，防止滥用。

### 可扩展性

- **异步处理**：使用异步请求处理高并发。
- **缓存机制**：结合上下文缓存和本地缓存，优化性能。
- **重试逻辑**：为瞬态错误（如网络问题）添加重试机制。

### 错误处理

- **限流错误（429）**：捕获并延迟重试。
- **示例**：

```python
import time
try:
    response = client.chat.completions.create(...)
except Exception as e:
    if e.status_code == 429:
        print("限流错误，60秒后重试...")
        time.sleep(60)
    else:
        print(f"错误: {e}")
```

### 监控

- **指标**：跟踪 API 延迟、token 使用量和错误率。
- **工具**：使用日志或监控平台（如 Prometheus）分析性能。

### 成本优化

- **流式响应**：减少延迟，可能降低成本。
- **限制输出**：设置 `max_tokens` 控制响应长度。
- **定期审查**：监控 token 使用，优化提示词和模型选择。

### 合规性

- **数据处理**：审查 DeepSeek 的数据处理协议，确保符合您的隐私和法律要求。
- **数据存储**：避免在 API 请求中发送敏感信息。

## 附加资源

- DeepSeek 官方 API 文档
- DeepSeek 平台
- DataCamp DeepSeek API 教程
- Medium DeepSeek API 开发者指南
