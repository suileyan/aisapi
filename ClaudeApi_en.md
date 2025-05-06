# Claude Model Series API Documentation

## Model Versions and Features Overview

| Model | Context Length | Image Input | File Processing | System Prompt | Streaming | Tool Calling |
|-------|---------------|-------------|----------------|--------------|-----------|-------------|
| Claude 1 | ≈9,000 tokens | ❌ | ❌ | ✅ | ✅ | ❌ |
| Claude 2 | 100,000 tokens | ❌ | ❌ | ✅ | ✅ | ❌ |
| Claude 2.1 | 200,000 tokens | ❌ | ✅ | ✅ | ✅ | ⚠️ Partial |
| Claude 3 Haiku (3.5) | 200,000 tokens | ✅ | ✅ | ✅ | ✅ | ✅ |
| Claude 3 Sonnet (3.5, 3.7) | 200,000 tokens | ✅ | ✅ | ✅ | ✅ | ✅ |
| Claude 3 Opus (3.5) | 200,000 tokens | ✅ | ✅ | ✅ | ✅ | ✅ |

### Claude 1 Series

Anthropic's first publicly released model, supporting only text-based conversations with a small context window of around 9,000 tokens. Does not support image or file inputs, but offers multi-turn conversations and streaming output.

### Claude 2 Series

Released in 2023 with significantly increased context window of approximately **100,000** tokens (about 200 pages of text), suitable for long text processing. Supports multi-turn conversations, system prompts (via the `system` parameter), and streaming output. This series also included variants like *Claude Instant* (lightweight version).

### Claude 2.1 Series

Further expanded context window to **200,000** tokens (about 500 pages of text), capable of processing very long documents. Added file processing capabilities through `document` content blocks for PDF/TXT files. Offers significant improvements in accuracy and faithfulness compared to Claude 2.

### Claude 3 Series

The latest series released in 2024-2025, including three main models:

- **Claude 3 Haiku**: The fastest and most lightweight model, ideal for scenarios requiring quick response times with minimal latency
- **Claude 3 Sonnet**: High-performance general-purpose model (latest is version 3.7), with advanced reasoning capabilities and switchable "extended thinking" mode
- **Claude 3 Opus**: The most powerful model, designed for complex tasks with superior comprehension and fluency

All Claude 3 models support a **200,000** token context window, multimodal capabilities (text and image inputs), streaming output, system prompts, and tool calling functionality.

## API Endpoints

- **POST `/v1/messages`**: Main endpoint for sending conversation messages and receiving responses
- **POST `/v1/messages/stream`**: Streaming endpoint (also accessible by setting `"stream":true` in `/v1/messages`)
- **POST `/v1/messages/count_tokens`**: Calculate token count for a given message list, useful for cost estimation

Required headers:

- `x-api-key`: Your API key
- `anthropic-version`: API version number (e.g., "2024-06-23")
- `Content-Type: application/json`

## Core Features

### Text Conversations

All Claude models support multi-turn conversations through the `messages` list which contains the complete conversation history:

```json
"messages": [
  { "role": "user", "content": "Hello, please introduce yourself" },
  { "role": "assistant", "content": "I'm Claude, an AI assistant..." },
  { "role": "user", "content": "What can you do?" }
]
```

### System Prompt

Set model behavior guidelines through the top-level `system` field in the request body:

```json
"system": "You are a professional data analyst. Keep answers concise with data insights."
```

### Multimodal Input

Claude 3 series supports image inputs through `content` arrays with different types of content blocks:

```json
"content": [
  {
    "type": "image",
    "source": {
      "type": "base64",
      "media_type": "image/png",
      "data": "<base64 encoded image data>"
    }
  },
  { 
    "type": "text", 
    "text": "Please describe this image" 
  }
]
```

Supports image formats including JPEG, PNG, GIF, and WEBP.

### File Processing

Claude 2.1 and above support document processing through two methods:

- **URL Reference**:

```json
{ 
  "type": "document", 
  "source": { 
    "type": "url", 
    "url": "https://example.com/document.pdf" 
  }
}
```

- **Base64 Encoding**:

```json
{ 
  "type": "document", 
  "source": { 
    "type": "base64", 
    "media_type": "application/pdf", 
    "data": "<base64 encoded PDF file>" 
  }
}
```

Supports formats including PDF, DOCX, XLSX, and CSV. Claude 3 series can analyze both text and image content within documents.

### Streaming Output

When `"stream": true` is set, the API returns an SSE (Server-Sent Events) event stream including various event types:

- `message_start`: Start of response generation
- `content_block_delta`: Incremental content block
- `message_delta`: Incremental message update
- `message_stop`: Completion of generation

### Tool Calling

Claude supports external function definition through the `tools` parameter:

```json
"tools": [
  {
    "name": "get_weather",
    "description": "Get weather forecast for a specified city",
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

The model can generate `tool_use` content blocks to call tools:

```json
{
  "type": "tool_use",
  "name": "get_weather",
  "input": { "city": "New York", "days": 3 }
}
```

Developers execute the tool and return results via `tool_result` content blocks.

## Code Examples

### Python

```python
import requests

API_URL = "https://api.anthropic.com/v1/messages"
headers = {
    "x-api-key": "<your Anthropic API key>",
    "anthropic-version": "2024-06-23",
    "Content-Type": "application/json"
}
data = {
    "model": "claude-3-7-sonnet-20250219",
    "max_tokens": 1000,
    "temperature": 0.7,
    "system": "You are an analytical assistant. Keep answers concise.",
    "messages": [
        { "role": "user", "content": "Please explain what distributed systems are." }
    ]
}
response = requests.post(API_URL, headers=headers, json=data)
result = response.json()
print(result["content"][0]["text"])  # Output model response
```

### Node.js

```javascript
const fetch = require("node-fetch");

const API_URL = "https://api.anthropic.com/v1/messages";
const headers = {
  "x-api-key": "<your Anthropic API key>",
  "anthropic-version": "2024-06-23",
  "Content-Type": "application/json",
};
const body = {
  model: "claude-3-7-sonnet-20250219",
  max_tokens: 500,
  temperature: 0.5,
  system: "Please explain as an economics professor",
  messages: [{ role: "user", content: "What is GDP?" }],
};

fetch(API_URL, {
  method: "POST",
  headers: headers,
  body: JSON.stringify(body),
})
  .then((res) => res.json())
  .then((json) => {
    console.log(json.content[0].text); // Output model response
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
        "system": "You are an assistant with concise answers.",
        "messages": [
            {"role": "user", "content": "List three capitals of China throughout history."}
        ]
      }'
```

## Main Parameters

- **`model`**: Specify model, e.g., `"claude-3-7-sonnet-20250219"`
- **`max_tokens`**: Maximum number of tokens to generate
- **`temperature`**: Control output randomness (0.0-1.0)
- **`system`**: System prompt, setting model role or behavior
- **`messages`**: Conversation history list
- **`stream`**: Enable streaming output (boolean)
- **`tools`**: Define callable tool functions (optional)

## Response Format

```json
{
  "id": "msg_01...",
  "type": "message",
  "role": "assistant",
  "content": [{ "type": "text", "text": "Model-generated response..." }],
  "stop_reason": "end_turn",
  "usage": { "input_tokens": 20, "output_tokens": 85 }
}
```

- **`content`**: Array of model response content blocks
- **`stop_reason`**: Reason for generation stopping
- **`usage`**: Token usage information for billing
- **`model`**: Name of the model used

## Best Practices

1. Use clear system prompts to define model role and expected output
2. Provide complete context for multi-turn conversations
3. For long document processing, consider chunking or file references
4. Provide clear text instructions with image inputs
5. Provide detailed function descriptions and parameter documentation for tool calling
6. Leverage streaming output to improve user experience
7. Set appropriate `temperature` parameter to control output determinism
