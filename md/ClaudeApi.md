# Claude 系列模型 API 使用文档

## 模型版本与功能概览

| 模型 | 上下文长度 | 图像输入 | 文件处理 | 系统提示 | 流式输出 | 工具调用 |
|------|------------|----------|----------|----------|----------|----------|
| Claude 1 | ≈9,000 tokens | ❌ | ❌ | ✅ | ✅ | ❌ |
| Claude 2 | 100,000 tokens | ❌ | ❌ | ✅ | ✅ | ❌ |
| Claude 2.1 | 200,000 tokens | ❌ | ✅ | ✅ | ✅ | ⚠️ 部分支持 |
| Claude 3 Haiku (3.5) | 200,000 tokens | ✅ | ✅ | ✅ | ✅ | ✅ |
| Claude 3 Sonnet (3.5, 3.7) | 200,000 tokens | ✅ | ✅ | ✅ | ✅ | ✅ |
| Claude 3 Opus (3.5) | 200,000 tokens | ✅ | ✅ | ✅ | ✅ | ✅ |

### Claude 1 系列

Anthropic 首个公开模型，仅支持纯文本对话，语境窗口约千级 tokens。不支持图像或文件输入，但支持多轮对话和流式输出。

### Claude 2 系列

2023 年发布，语境窗口大幅提高到约 **100,000** 个 token（约 200 页文本），适合长文本处理。支持多轮对话、系统提示（通过 `system` 参数）和流式输出。该系列还推出过 *Claude Instant*（轻量版）等变体。

### Claude 2.1 系列

语境窗口进一步扩大到 **200,000** tokens（约 500 页文本），能处理超长文档。新增文件处理能力，可通过 `document` 内容块上传 PDF/TXT 等文件。在准确性和真诚度上较 Claude 2 有显著提升。

### Claude 3 系列

2024-2025 年发布的最新系列，包含三个主要模型：

- **Claude 3 Haiku**：最快速、最轻量的模型，适合对响应速度要求高的场景，延迟最小
- **Claude 3 Sonnet**：性能优异的通用模型（最新为 3.7 版本），具有高级推理能力和可切换的"扩展思维"模式
- **Claude 3 Opus**：最强大的模型，为复杂任务设计，理解力和流利度最高

所有 Claude 3 模型均支持 **200,000** tokens 上下文窗口、多模态能力（文本与图像输入）、流式输出、系统提示和工具调用等功能。

## API 端点

- **POST `/v1/messages`**：主要端点，用于发送对话消息并获取回应
- **POST `/v1/messages/stream`**：流式输出端点（也可通过在 `/v1/messages` 设置 `"stream":true`）
- **POST `/v1/messages/count_tokens`**：计算给定消息列表的 token 数量，用于预估成本

请求头必须包括：

- `x-api-key`：您的 API 密钥
- `anthropic-version`：API 版本号（如 "2024-06-23"）
- `Content-Type: application/json`

## 核心功能

### 文本对话

所有 Claude 模型支持多轮对话，通过 `messages` 列表提交完整对话历史：

```json
"messages": [
  { "role": "user", "content": "你好，介绍一下自己" },
  { "role": "assistant", "content": "我是 Claude，一个 AI 助手..." },
  { "role": "user", "content": "你能做什么？" }
]
```

### 系统提示

通过请求体顶层的 `system` 字段设置模型行为指南：

```json
"system": "你是一个专业的数据分析师，回答要简洁且包含数据洞察"
```

### 多模态输入

Claude 3 系列支持图像输入，通过 `content` 数组包含不同类型的内容块：

```json
"content": [
  {
    "type": "image",
    "source": {
      "type": "base64",
      "media_type": "image/png",
      "data": "<base64 编码的图片数据>"
    }
  },
  { 
    "type": "text", 
    "text": "请描述这张图片" 
  }
]
```

支持 JPEG、PNG、GIF、WEBP 等图片格式。

### 文件处理

Claude 2.1 及以上版本支持文档处理，可通过两种方式提供文件：

- **URL 引用**：

```json
{ 
  "type": "document", 
  "source": { 
    "type": "url", 
    "url": "https://example.com/document.pdf" 
  }
}
```

- **Base64 编码**：

```json
{ 
  "type": "document", 
  "source": { 
    "type": "base64", 
    "media_type": "application/pdf", 
    "data": "<base64 编码的 PDF 文件>" 
  }
}
```

支持 PDF、DOCX、XLSX、CSV 等格式。Claude 3 系列可分析文档中的文本和图像内容。

### 流式输出

设置 `"stream": true` 时，API 返回一个 SSE（Server-Sent Events）事件流，包括多种事件类型：

- `message_start`：开始生成回复
- `content_block_delta`：增量内容块
- `message_delta`：增量消息更新
- `message_stop`：完成生成

### 工具调用

Claude 支持通过 `tools` 参数定义外部函数：

```json
"tools": [
  {
    "name": "get_weather",
    "description": "获取指定城市的天气预报",
    "input_schema": {
      "type": "object",
      "properties": {
        "city": { "type": "string" },
        "days": { "type": "integer" }
      },
      "required": ["city"]
    }
  }
]
```

模型可生成 `tool_use` 内容块进行调用：

```json
{
  "type": "tool_use",
  "name": "get_weather",
  "input": { "city": "北京", "days": 3 }
}
```

开发者执行工具后，通过 `tool_result` 内容块返回结果。

## 代码示例

### Python

```python
import requests

API_URL = "https://api.anthropic.com/v1/messages"
headers = {
    "x-api-key": "<你的 Anthropic API 密钥>",
    "anthropic-version": "2024-06-23",
    "Content-Type": "application/json"
}
data = {
    "model": "claude-3-7-sonnet-20250219",
    "max_tokens": 1000,
    "temperature": 0.7,
    "system": "你是一个善于分析的助手，请回答简明扼要。",
    "messages": [
        { "role": "user", "content": "请解释什么是分布式系统？" }
    ]
}
response = requests.post(API_URL, headers=headers, json=data)
result = response.json()
print(result["content"][0]["text"])  # 输出模型回复
```

### Node.js

```javascript
const fetch = require("node-fetch");

const API_URL = "https://api.anthropic.com/v1/messages";
const headers = {
  "x-api-key": "<你的 Anthropic API 密钥>",
  "anthropic-version": "2024-06-23",
  "Content-Type": "application/json",
};
const body = {
  model: "claude-3-7-sonnet-20250219",
  max_tokens: 500,
  temperature: 0.5,
  system: "请作为经济学教授解释",
  messages: [{ role: "user", content: "什么是GDP？" }],
};

fetch(API_URL, {
  method: "POST",
  headers: headers,
  body: JSON.stringify(body),
})
  .then((res) => res.json())
  .then((json) => {
    console.log(json.content[0].text); // 输出模型回复
  })
  .catch((err) => console.error(err));
```

### cURL

```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2024-06-23" \
  -H "Content-Type: application/json" \
  -d '{
        "model": "claude-3-7-sonnet-20250219",
        "max_tokens": 256,
        "temperature": 0.0,
        "system": "你是一个简明回答的助手。",
        "messages": [
            {"role": "user", "content": "列举三个中国的首都是哪些？"}
        ]
      }'
```

## 主要参数说明

- **`model`**：指定模型，如 `"claude-3-7-sonnet-20250219"`
- **`max_tokens`**：最大生成 token 数量
- **`temperature`**：控制输出随机性（0.0-1.0）
- **`system`**：系统提示，设置模型角色或行为
- **`messages`**：对话历史列表
- **`stream`**：是否启用流式输出（布尔值）
- **`tools`**：定义可调用的工具函数（可选）

## 响应格式

```json
{
  "id": "msg_01...",
  "type": "message",
  "role": "assistant",
  "content": [{ "type": "text", "text": "模型生成的回答..." }],
  "stop_reason": "end_turn",
  "usage": { "input_tokens": 20, "output_tokens": 85 }
}
```

- **`content`**：模型回答内容块数组
- **`stop_reason`**：生成停止原因
- **`usage`**：token 使用情况，用于计费
- **`model`**：使用的模型名称

## 最佳实践

1. 使用清晰的系统提示定义模型角色和期望输出
2. 为多轮对话提供完整上下文
3. 对于长文档处理，考虑分块上传或使用文件引用
4. 图像输入时提供清晰的文本指令
5. 工具调用时提供详细的函数描述和参数说明
6. 利用流式输出提高用户体验
7. 合理设置 `temperature` 参数控制输出确定性
