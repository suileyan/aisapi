# 阿里巴巴千问 (Qwen) API 文档

## 简介

通义千问 (Qwen) 是阿里巴巴云开发的先进大语言模型系列，提供强大的文本生成、对话能力和多模态处理功能。本文档介绍如何通过 API 调用 Qwen 服务。

> **注意**: 本文档基于公开信息整理，请以[阿里云官方文档](https://dashscope.aliyun.com)为准。

## 主要特性

- 高质量文本生成和对话功能
- 多模态支持（图像理解和生成）
- 长上下文理解
- 代码生成和分析能力
- OpenAI 兼容接口

## 可用模型

| **模型名称** | **特点** | **适用场景** |
|--------------|----------|--------------|
| `qwen-turbo` | 响应快，延迟低 | 实时对话、简单问答 |
| `qwen-plus` | 理解和推理能力更强 | 复杂推理、专业任务 |
| `qwen-max` | 最高性能，支持更长上下文 | 高要求任务、复杂分析 |

> 模型版本和参数会定期更新，请参考[官方文档](https://dashscope.aliyun.com)获取最新信息。

## 开始使用

### 1. 获取API密钥

1. 访问[阿里云官网](https://www.alibabacloud.com/)，注册并完成实名认证
2. 前往[Model Studio控制台](https://www.alibabacloud.com/help/en/model-studio)激活服务
3. 在"API Keys"页面创建并保存密钥
4. 设置环境变量（推荐）：

   ```bash
   export DASHSCOPE_API_KEY="your_api_key"
   ```

### 2. 选择调用方式

Qwen API 支持两种主要调用方式：

#### 方式一：使用 DashScope SDK（官方推荐）

**安装 Python SDK**：

```bash
pip install dashscope
```

**基本使用示例**：

```python
import dashscope
from dashscope import Generation

# 设置API密钥（也可通过环境变量设置）
dashscope.api_key = "your_api_key"

# 调用API
response = Generation.call(
    model=Generation.Models.qwen_turbo,
    messages=[
        {'role': 'system', 'content': '你是一个有帮助的助手。'},
        {'role': 'user', 'content': '请介绍一下自然语言处理技术。'}
    ]
)

# 处理响应
if response.status_code == 200:
    print(response.output.choices[0].message.content)
else:
    print(f"错误: {response.code}, {response.message}")
```

#### 方式二：使用 OpenAI 兼容接口

**安装 OpenAI SDK**：

```bash
pip install openai
```

**基本使用示例**：

```python
from openai import OpenAI

client = OpenAI(
    api_key="your_dashscope_api_key",
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
)

response = client.chat.completions.create(
    model="qwen-turbo",
    messages=[
        {"role": "system", "content": "你是一个有帮助的助手。"},
        {"role": "user", "content": "请介绍一下自然语言处理技术。"}
    ]
)

print(response.choices[0].message.content)
```

## API 参数说明

### 基本参数

| **参数** | **类型** | **说明** | **默认值** |
|----------|----------|----------|------------|
| `model` | 字符串 | 模型名称，如 `qwen-turbo` | - |
| `messages` | 数组 | 对话历史，包含 role 和 content | - |
| `temperature` | 浮点数 | 控制随机性，范围 0-2 | 1.0 |
| `max_tokens` | 整数 | 最大生成令牌数 | 模型相关 |
| `top_p` | 浮点数 | 控制多样性，范围 0-1 | 1.0 |
| `stream` | 布尔值 | 是否启用流式响应 | `false` |
| `seed` | 整数 | 随机种子，用于复现结果 | 随机 |

### 消息格式

消息数组中的每个对象需包含以下字段：

```json
{
  "role": "user", // 可选值: "system", "user", "assistant"
  "content": "你好，请介绍一下自己。"
}
```

## 高级功能

### 流式响应

流式响应允许实时接收生成内容，适合聊天界面：

```python
# 使用 DashScope SDK
response = Generation.call(
    model=Generation.Models.qwen_turbo,
    messages=[{"role": "user", "content": "讲个故事"}],
    stream=True
)

for chunk in response:
    if chunk.status_code == 200:
        print(chunk.output.choices[0].message.content, end="")

# 使用 OpenAI 兼容接口
response = client.chat.completions.create(
    model="qwen-turbo",
    messages=[{"role": "user", "content": "讲个故事"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### 多模态输入

Qwen 支持处理图像输入，需使用多模态模型：

```python
response = client.chat.completions.create(
    model="qwen-vl-plus",  // 使用支持视觉的模型
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "这张图片中有什么？"},
                {
                    "type": "image_url",
                    "image_url": {"url": "https://example.com/image.jpg"}
                }
            ]
        }
    ]
)
```

### JSON 格式响应

要求模型输出结构化的 JSON：

```python
response = client.chat.completions.create(
    model="qwen-turbo",
    messages=[{"role": "user", "content": "生成一个包含三个水果及其价格的列表"}],
    response_format={"type": "json_object"}
)
```

## 错误处理

### 常见错误码

| **状态码** | **说明** | **解决方法** |
|------------|----------|--------------|
| 401 | 认证失败 | 检查 API 密钥 |
| 404 | 资源不存在 | 检查模型名称和 API 路径 |
| 429 | 请求过多 | 降低请求频率 |
| 500 | 服务器错误 | 稍后重试 |

### 错误处理示例

```python
import time

def call_with_retry(max_retries=3):
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="qwen-turbo",
                messages=[{"role": "user", "content": "你好"}]
            )
            return response
        except Exception as e:
            if hasattr(e, 'status_code') and e.status_code == 429:
                wait_time = (attempt + 1) * 2  // 指数退避
                print(f"达到速率限制，等待 {wait_time} 秒...")
                time.sleep(wait_time)
            else:
                print(f"错误: {str(e)}")
                break
    return None
```

## 成本和限制

- **计费方式**：按令牌（tokens）使用量计费
- **费率**：根据不同模型定价不同，`qwen-turbo` < `qwen-plus` < `qwen-max`
- **速率限制**：取决于账户等级，一般为每分钟几十到几百请求
- **上下文长度**：根据模型不同，支持 8K 到 128K 不等的上下文窗口

## 最佳实践

1. **精简提示词**：减少不必要的描述，降低令牌消耗
2. **批量处理**：合并请求减少 API 调用次数
3. **错误重试**：实现指数退避重试机制
4. **本地缓存**：缓存常见查询响应
5. **安全处理**：
   - 不在客户端代码中硬编码 API 密钥
   - 设置请求超时
   - 不传输敏感个人信息

## 更多资源

- [阿里云 DashScope 平台](https://dashscope.aliyun.com)
- [Qwen GitHub 仓库](https://github.com/QwenLM/Qwen)
- [Qwen API 定价](https://www.alibabacloud.com/help/en/model-studio)
- [阿里云技术支持](https://www.alibabacloud.com/contact)
