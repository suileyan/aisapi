# AisAPI - 多AI大模型统一接口

# AisAPI - Multi-AI Model Unified Interface

AisAPI是一个让你轻松对接多种AI大模型的库，提供统一的接口来调用OpenAI、Claude、Gemini、文心一言等国内外主流大模型服务。

AisAPI is a library that allows you to easily connect to various AI models, providing a unified interface to call mainstream AI services such as OpenAI, Claude, Gemini, ERNIE, and more.

## 特点 | Features

- **统一接口**：用同样的代码调用不同的AI服务
- **Unified Interface**: Use the same code to call different AI services
- **支持多种AI**：

  - 国际服务：OpenAI (GPT)、Anthropic (Claude)、Google (Gemini)、DeepSeek、Grok
  - 国内服务：文心一言 (ERNIE)、讯飞星火 (Spark)、智谱 (ChatGLM)、Moonshot (Kimi)、豆包
- **Multiple AI Support**:

  - International services: OpenAI (GPT), Anthropic (Claude), Google (Gemini), DeepSeek, Grok
  - Chinese services: Baidu ERNIE, iFlytek Spark, Zhipu ChatGLM, Moonshot (Kimi), Doubao
- **丰富功能**：

  - 文本生成和聊天对话
  - 图像生成和编辑
  - 语音转文本、文本转语音
  - 向量嵌入、JSON格式输出
  - 流式生成（边生成边返回）
- **Rich Features**:

  - Text generation and chat dialogues
  - Image generation and editing
  - Speech-to-text, text-to-speech
  - Vector embeddings, JSON output
  - Streaming generation (returning content as it's generated)
- **开发友好**：完整TypeScript类型支持，简单易用的API
- **Developer Friendly**: Complete TypeScript type support, simple and easy-to-use API

## 安装 | Installation

```bash
npm install aisapi
```

## 快速开始 | Quick Start

### 方式1：使用统一接口 | Method 1: Using the Unified Interface

```typescript
import { AisAPI } from 'aisapi';

// 创建实例，配置多个AI服务
// Create an instance with multiple AI services configured
const ai = new AisAPI({
  openai: {
    apiKey: process.env.OPENAI_API_KEY
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY
  },
  defaultProvider: 'openai' // 默认用哪个 | Default provider
});

// 用默认AI生成文本
// Generate text using the default AI
const result = await ai.generateText({
  prompt: '请解释什么是人工智能',
  maxTokens: 100
});
console.log(result.text);

// 切换到不同的AI
// Switch to a different AI
const claudeResult = await ai.generateText({
  prompt: '请解释什么是人工智能',
  maxTokens: 100
}, 'anthropic');
console.log(claudeResult.text);
```

### 方式2：直接使用特定AI | Method 2: Directly Using Specific AI

```typescript
import { GPT, Claude, Gemini } from 'aisapi';

// 使用OpenAI
// Using OpenAI
const gpt = new GPT({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4'
});

const result = await gpt.generateText({
  prompt: '什么是机器学习?',
  temperature: 0.7
});
console.log(result.text);
```

## 功能示例 | Feature Examples

### 聊天对话 | Chat Dialogue

```typescript
const chatResult = await gpt.chatCompletion({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: '你是一个专业的科技顾问。' },
    { role: 'user', content: '请比较React和Vue的优缺点?' }
  ]
});

console.log(chatResult.text);
```

### 图像生成 | Image Generation

```typescript
const imageResult = await gpt.generateImage({
  prompt: '一只宇航员猫咪在太空中漂浮',
  size: '1024x1024',
  model: 'dall-e-3'
});

console.log('图像URL:', imageResult.urls[0]);
// Image URL: imageResult.urls[0]
```

### 流式生成（边生成边返回）| Streaming Generation

```typescript
const stream = await gpt.createStreamingChatCompletion({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: '讲一个短故事' }]
});

const reader = stream.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  // 处理每个返回的数据块
  // Process each returned data chunk
  const chunk = new TextDecoder().decode(value);
  process.stdout.write(chunk);
}
```

## 国内AI服务示例 | Chinese AI Service Examples

### 文心一言 | ERNIE Bot

```typescript
import { Ernie, ErnieModel } from 'aisapi';

const ernie = new Ernie({
  apiKey: process.env.ERNIE_API_KEY,     // 百度AI平台的API Key
  secretKey: process.env.ERNIE_SECRET_KEY,  // 百度AI平台的Secret Key
  model: ErnieModel.ERNIE_BOT_4  // 使用ERNIE Bot 4模型
});

const result = await ernie.generateText({
  prompt: '以"春风"为主题，写一首现代诗',
  temperature: 0.8
});

console.log(result.text);
```

### 讯飞星火 | Spark

```typescript
import { Spark, SparkModel } from 'aisapi';

const spark = new Spark({
  apiKey: process.env.SPARK_API_KEY,
  appId: process.env.SPARK_APP_ID,
  apiSecret: process.env.SPARK_API_SECRET,
  model: SparkModel.SPARK_MAX  // 使用星火MAX模型 | Using Spark MAX model
});

const result = await spark.generateText({
  prompt: '解释一下Transformer架构的工作原理'
});

console.log(result.text);
```

## 高级功能 | Advanced Features

### JSON格式输出 | JSON Format Output

```typescript
const jsonResult = await gpt.generateJSON({
  prompt: '生成三个虚构人物的数据，包含姓名、年龄和职业'
});

console.log(JSON.stringify(jsonResult.data, null, 2));
```

### 向量嵌入 | Vector Embeddings

```typescript
const embedding = await gpt.createEmbedding({
  model: 'text-embedding-3-small',
  input: '这是一个示例文本'
});

console.log(`嵌入维度: ${embedding.data[0].embedding.length}`);
// Embedding dimensions: ${embedding.data[0].embedding.length}
```

### 语音转文本 | Speech to Text

```typescript
const transcription = await gpt.transcribeAudio({
  file: audioFile,  // 你的音频文件 | Your audio file
  model: 'whisper-1',
  language: 'zh'
});

console.log('识别结果:', transcription.text);
// Recognition result: transcription.text
```

### 文本转语音 | Text to Speech

```typescript
const speech = await gpt.textToSpeech({
  input: '你好，这是一个文本转语音的示例。',
  model: 'tts-1',
  voice: 'alloy'
});

// 使用speech.audioData (ArrayBuffer)保存或播放音频
// Use speech.audioData (ArrayBuffer) to save or play audio
```

## 支持的AI服务及功能 | Supported AI Services and Features


| 功能 Features               | OpenAI | Claude | Gemini | DeepSeek | ERNIE | Spark | ChatGLM | Moonshot |
| --------------------------- | :----: | :----: | :----: | :------: | :---: | :---: | :-----: | :------: |
| 文本生成 Text Generation    |   ✅   |   ✅   |   ✅   |    ✅    |  ✅  |  ✅  |   ✅   |    ✅    |
| 图像生成 Image Generation   |   ✅   |   ❌   |   ✅   |    ❌    |  ❌  |  ❌  |   ❌   |    ❌    |
| 聊天对话 Chat Dialogue      |   ✅   |   ✅   |   ✅   |    ✅    |  ✅  |  ✅  |   ✅   |    ✅    |
| 语音识别 Speech Recognition |   ✅   |   ❌   |   ❌   |    ❌    |  ❌  |  ❌  |   ❌   |    ❌    |
| 语音合成 Speech Synthesis   |   ✅   |   ❌   |   ❌   |    ❌    |  ❌  |  ❌  |   ❌   |    ❌    |
| 向量嵌入 Vector Embeddings  |   ✅   |   ❌   |   ❌   |    ✅    |  ❌  |  ❌  |   ❌   |    ❌    |
| JSON输出 JSON Output        |   ✅   |   ✅   |   ✅   |    ✅    |  ✅  |  ✅  |   ✅   |    ✅    |
| 流式输出 Streaming Output   |   ✅   |   ✅   |   ✅   |    ✅    |  ✅  |  ✅  |   ✅   |    ✅    |

## 提供商配置参数 | Provider Configuration Parameters

下表列出了各提供商的配置参数，可选参数前标有"?"，并提供默认值。
The table below lists the configuration parameters for each provider, with optional parameters marked with "?" and their default values.

### OpenAI 配置参数 | OpenAI Configuration Parameters


| 参数 Parameter | 说明 Description                          | 默认值 Default Value        |
| -------------- | ----------------------------------------- | --------------------------- |
| apiKey         | API密钥\| API Key                         | -                           |
| ?model         | 模型名称\| Model name                     | 'gpt-3.5-turbo'             |
| ?baseURL       | 自定义API地址\| Custom API URL            | 'https://api.openai.com/v1' |
| ?timeout       | 请求超时时间(毫秒)\| Request timeout (ms) | 30000                       |
| ?maxRetries    | 最大重试次数\| Maximum retry attempts     | 2                           |
| ?organization  | 组织ID\| Organization ID                  | undefined                   |

### Anthropic (Claude) 配置参数 | Anthropic Configuration Parameters


| 参数 Parameter | 说明 Description                          | 默认值 Default Value        |
| -------------- | ----------------------------------------- | --------------------------- |
| apiKey         | API密钥\| API Key                         | -                           |
| ?model         | 模型名称\| Model name                     | 'claude-3-haiku-20240307'   |
| ?baseURL       | 自定义API地址\| Custom API URL            | 'https://api.anthropic.com' |
| ?timeout       | 请求超时时间(毫秒)\| Request timeout (ms) | 60000                       |
| ?maxRetries    | 最大重试次数\| Maximum retry attempts     | 2                           |

### Google Gemini 配置参数 | Google Gemini Configuration Parameters


| 参数 Parameter | 说明 Description                          | 默认值 Default Value |
| -------------- | ----------------------------------------- | -------------------- |
| apiKey         | API密钥\| API Key                         | -                    |
| ?model         | 模型名称\| Model name                     | 'gemini-pro'         |
| ?timeout       | 请求超时时间(毫秒)\| Request timeout (ms) | 30000                |
| ?maxRetries    | 最大重试次数\| Maximum retry attempts     | 2                    |
| ?region        | API区域\| API region                      | 'us-central1'        |

### DeepSeek 配置参数 | DeepSeek Configuration Parameters


| 参数 Parameter | 说明 Description                          | 默认值 Default Value          |
| -------------- | ----------------------------------------- | ----------------------------- |
| apiKey         | API密钥\| API Key                         | -                             |
| ?model         | 模型名称\| Model name                     | 'deepseek-chat'               |
| ?baseURL       | 自定义API地址\| Custom API URL            | 'https://api.deepseek.com/v1' |
| ?timeout       | 请求超时时间(毫秒)\| Request timeout (ms) | 30000                         |
| ?maxRetries    | 最大重试次数\| Maximum retry attempts     | 2                             |

### 文心一言 (ERNIE) 配置参数 | ERNIE Configuration Parameters


| 参数 Parameter       | 说明 Description                                     | 默认值 Default Value       |
| -------------------- | ---------------------------------------------------- | -------------------------- |
| apiKey               | API密钥\| API Key                                    | -                          |
| secretKey            | 密钥\| Secret Key                                    | -                          |
| ?model               | 模型名称\| Model name                                | 'ernie-bot-4'              |
| ?baseURL             | 自定义API地址\| Custom API URL                       | 'https://aip.baidubce.com' |
| ?timeout             | 请求超时时间(毫秒)\| Request timeout (ms)            | 60000                      |
| ?maxRetries          | 最大重试次数\| Maximum retry attempts                | 2                          |
| ?accessTokenLifetime | 访问令牌有效期(秒)\| Access token lifetime (seconds) | 2592000 (30天\|days)       |

### 讯飞星火 (Spark) 配置参数 | iFlytek Spark Configuration Parameters


| 参数 Parameter | 说明 Description                          | 默认值 Default Value                   |
| -------------- | ----------------------------------------- | -------------------------------------- |
| apiKey         | API密钥\| API Key                         | -                                      |
| appId          | 应用ID\| Application ID                   | -                                      |
| apiSecret      | API密钥\| API Secret                      | -                                      |
| ?model         | 模型名称\| Model name                     | 'spark-v3.5'                           |
| ?domain        | 服务域名\| Service domain                 | 'general'                              |
| ?baseURL       | 自定义API地址\| Custom API URL            | 'wss://spark-api.xf-yun.com/v3.5/chat' |
| ?timeout       | 请求超时时间(毫秒)\| Request timeout (ms) | 60000                                  |
| ?maxRetries    | 最大重试次数\| Maximum retry attempts     | 2                                      |

### 智谱 (ChatGLM) 配置参数 | Zhipu ChatGLM Configuration Parameters


| 参数 Parameter | 说明 Description                          | 默认值 Default Value                   |
| -------------- | ----------------------------------------- | -------------------------------------- |
| apiKey         | API密钥\| API Key                         | -                                      |
| ?model         | 模型名称\| Model name                     | 'glm-4'                                |
| ?baseURL       | 自定义API地址\| Custom API URL            | 'https://open.bigmodel.cn/api/paas/v4' |
| ?timeout       | 请求超时时间(毫秒)\| Request timeout (ms) | 60000                                  |
| ?maxRetries    | 最大重试次数\| Maximum retry attempts     | 2                                      |

### Moonshot (Kimi) 配置参数 | Moonshot Configuration Parameters


| 参数 Parameter | 说明 Description                          | 默认值 Default Value         |
| -------------- | ----------------------------------------- | ---------------------------- |
| apiKey         | API密钥\| API Key                         | -                            |
| ?model         | 模型名称\| Model name                     | 'moonshot-v1-8k'             |
| ?baseURL       | 自定义API地址\| Custom API URL            | 'https://api.moonshot.cn/v1' |
| ?timeout       | 请求超时时间(毫秒)\| Request timeout (ms) | 60000                        |
| ?maxRetries    | 最大重试次数\| Maximum retry attempts     | 2                            |

### 豆包 (Doubao) 配置参数 | Doubao Configuration Parameters


| 参数 Parameter | 说明 Description                          | 默认值 Default Value        |
| -------------- | ----------------------------------------- | --------------------------- |
| apiKey         | API密钥\| API Key                         | -                           |
| ?model         | 模型名称\| Model name                     | 'doubao-pro'                |
| ?baseURL       | 自定义API地址\| Custom API URL            | 'https://api.doubao.com/v1' |
| ?timeout       | 请求超时时间(毫秒)\| Request timeout (ms) | 60000                       |
| ?maxRetries    | 最大重试次数\| Maximum retry attempts     | 2                           |

### Grok 配置参数 | Grok Configuration Parameters


| 参数 Parameter | 说明 Description                          | 默认值 Default Value     |
| -------------- | ----------------------------------------- | ------------------------ |
| apiKey         | API密钥\| API Key                         | -                        |
| ?model         | 模型名称\| Model name                     | 'grok-1'                 |
| ?baseURL       | 自定义API地址\| Custom API URL            | 'https://api.grok.ai/v1' |
| ?timeout       | 请求超时时间(毫秒)\| Request timeout (ms) | 60000                    |
| ?maxRetries    | 最大重试次数\| Maximum retry attempts     | 2                        |

## 提供商列表 | Provider List


| 提供商 Provider | 实现类 Implementation Class | 示例文件 Example File                            |
| --------------- | --------------------------- | ------------------------------------------------ |
| OpenAI          | `OpenAIProvider`            | [example-openai.ts](src/example-openai.ts)       |
| Anthropic       | `AnthropicProvider`         | [example-anthropic.ts](src/example-anthropic.ts) |
| Google Gemini   | `GeminiProvider`            | [example-gemini.ts](src/example-gemini.ts)       |
| DeepSeek        | `DeepSeekProvider`          | [example-deepseek.ts](src/example-deepseek.ts)   |
| Grok            | `GrokProvider`              | [example-grok.ts](src/example-grok.ts)           |
| 文心一言 ERNIE  | `ErnieProvider`             | [example-ernie.ts](src/example-ernie.ts)         |
| 讯飞星火 Spark  | `SparkProvider`             | [example-spark.ts](src/example-spark.ts)         |
| 智谱AI ChatGLM  | `ZhipuProvider`             | [example-zhipu.ts](src/example-zhipu.ts)         |
| Moonshot (Kimi) | `MoonshotProvider`          | [example-moonshot.ts](src/example-moonshot.ts)   |
| 豆包 Doubao     | `DoubaoProvider`            | [example-doubao.ts](src/example-doubao.ts)       |

## 贡献 | Contributing

欢迎贡献！请按照以下步骤：

Contributions are welcome! Please follow these steps:

1. Fork本项目 | Fork this project
2. 创建功能分支 | Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 提交修改 | Commit your changes (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 | Push to the branch (`git push origin feature/amazing-feature`)
5. 创建Pull Request | Create a Pull Request

## 许可证 | License

本项目采用MIT许可证 - 详见[LICENSE](LICENSE)文件。

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 若想要添加更多或使用遇到问题请联系 suileyan@foxmail.com

## If you want to add more or encounter problems using, please contact suileyan@foxmail.com

查看更多示例和详细API文档，请参阅项目中的[docs](docs)目录或访问我们的[官方文档网站](https://aisapi.dev)。

For more examples and detailed API documentation, please refer to the [docs](docs) directory in the project or visit our [official documentation website](https://aisapi.dev).
