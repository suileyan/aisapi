# OpenAI API 使用文档（GPT 系列与相关功能）

本指南总结了截至 2025 年最新版的 OpenAI API 用法，涵盖 GPT 系列模型（包括 GPT-4o、GPT-4、GPT-3.5 等）以及图像生成 (DALL·E)、语音转文本 (Whisper)、文本转语音 (TTS)、向量嵌入 (Embeddings)、文件管理、模型微调等模块。每个模块包含 Python、JavaScript (Node.js) 和 cURL 示例，以及关键参数说明和返回字段详解。

## 文本生成（Chat Completions）

Chat Completions API 用于对话式文本生成。支持的模型包括 `gpt-3.5-turbo`、`gpt-4` 以及最新的多模态 `gpt-4o`（支持文本、音频和图像输入/输出）。这些模型可通过 `POST /v1/chat/completions` 调用。请求需提供 `model` 名称和 `messages` 列表（包含带有 `role` 的上下文信息，通常包括系统提示、用户和助手消息）。常用参数包括：

- `model` (string)：选择模型名称，例如 `"gpt-3.5-turbo"`、`"gpt-4"` 或 `"gpt-4o"`。
- `messages` (array)：消息列表，每个元素形如 `{"role": "system"|"user"|"assistant", "content": "..."}`，用于提供对话上下文。
- `max_tokens` (integer)：生成的最大 token 数，控制输出长度。
- `temperature` (number)：控制生成随机性，范围 `[0,2]`，值越高输出越随机，越低越确定。建议创意性任务可适当提高 (如 0.7)，追求准确可降低 (如 0)。
- `top_p` (number)：核采样概率阈值，另一种控制随机性的方式。
- `n` (integer)：生成的备选答案数量，默认 1。
- `stop` (string or array)：终止词或词组，当生成到该词时停止。
- `stream` (boolean)：是否开启流式返回。
- `presence_penalty`、`frequency_penalty` (number)：调节新主题出现频率和词频重复的惩罚力度。
- `user` (string)：可选，标识调用者用户信息，用于审核和统计。

示例代码：

```python
import openai
openai.api_key = "YOUR_API_KEY"
response = openai.ChatCompletion.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "你是一个乐于助人的助手。"},
        {"role": "user",   "content": "帮我写一首唐诗，主题是春天。"}
    ],
    max_tokens=100,
    temperature=0.8
)
print(response.choices[0].message["content"])
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resp = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: "你是一个乐于助人的助手。" },
    { role: "user", content: "帮我写一首唐诗，主题是春天。" },
  ],
  max_tokens: 100,
  temperature: 0.8,
});
console.log(resp.choices[0].message.content);
```

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "system", "content": "你是一个乐于助人的助手。"},
      {"role": "user",   "content": "帮我写一首唐诗，主题是春天。"}
    ],
    "max_tokens": 100,
    "temperature": 0.8
  }'
```

**返回字段**：

- **id** (string)：此次生成请求的唯一 ID。
- **object** (string)：对象类型，如 `"chat.completion"`。
- **created** (integer)：Unix 时间戳，表示创建时间。
- **model** (string)：使用的模型名称。
- **choices** (array)：返回结果数组，每个元素包含一个生成选项：

  - **index** (integer)：选项索引。
  - **message** (object)：生成的消息，包含 `{ "role": "...", "content": "生成文本" }`。
  - **finish_reason** (string)：生成结束原因，如 `"stop"`、`"length"` 等。

- **usage** (object)：计费和消耗信息。

  - **prompt_tokens** (integer)：用于提示 (input) 的 token 数。
  - **completion_tokens** (integer)：生成 (output) 的 token 数。
  - **total_tokens** (integer)：总共消耗的 token 数。

## 传统补全（Completions）

传统补全 API 适用于单段文本生成（旧版接口）。调用 `POST /v1/completions`，使用模型如 `text-davinci-003` 或其他 GPT-3 级模型。这类接口要求提供 `prompt` 而非 `messages`。常用参数包括：

- `model` (string)：模型名称，如 `"text-davinci-003"`, `"text-curie-001"` 等。
- `prompt` (string or array)：提示文本，可以是字符串或字符串数组。
- `max_tokens`、`temperature`、`top_p`、`n`、`stop` 等，与 ChatCompletion 类似。
- `stream`、`presence_penalty`、`frequency_penalty`、`logit_bias` 等也可使用。

示例代码：

```python
import openai
openai.api_key = "YOUR_API_KEY"
resp = openai.Completion.create(
    model="text-davinci-003",
    prompt="将下面的英语翻译成中文：\n\n\"What is the weather like today?\"",
    max_tokens=60,
    temperature=0.3
)
print(resp.choices[0].text.strip())
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resp = await openai.completions.create({
  model: "text-davinci-003",
  prompt: '将下面的英语翻译成中文：\n\n"What is the weather like today?"',
  max_tokens: 60,
  temperature: 0.3,
});
console.log(resp.choices[0].text.trim());
```

```bash
curl https://api.openai.com/v1/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-davinci-003",
    "prompt": "将下面的英语翻译成中文：\n\n\"What is the weather like today?\"",
    "max_tokens": 60,
    "temperature": 0.3
  }'
```

**返回字段**：与 Chat Completion 类似，主要区别在于 `choices` 中包含 `text` 字段而非 `message`：

- **choices\[].text** (string)：生成的文本内容。
- 其他字段（`id`, `model`, `usage` 等）与 Chat Completion 相同。

## 图像生成（DALL·E）

OpenAI 的图像生成 API（基于 DALL·E 模型）包括生成新图像、编辑已有图像和生成图像变体等功能。调用接口路径以 `/v1/images/` 开头，使用模型如 `"dall-e-3"`。

### 生成新图像 (Image Generation)

- **接口**：`POST /v1/images/generations`
- **参数**：

  - `model` (string)：图像模型名称，如 `"dall-e-3"`。
  - `prompt` (string)：文本提示，描述要生成的图像。
  - `n` (integer, 可选)：生成图像数量，默认为 1。
  - `size` (string)：生成图像分辨率，如 `"1024x1024"`, `"512x512"`。
  - `response_format` (string)：返回格式，`"url"`（默认，返回图片 URL）或 `"b64_json"`（返回 Base64 编码的图像数据）。
  - `user` (string, 可选)：调用者标识，便于审核。

**Python 示例**：

```python
import openai
openai.api_key = "YOUR_API_KEY"
resp = openai.Image.create(
    model="dall-e-3",
    prompt="一只戴着红色蝴蝶结的白色暹罗猫",
    n=1,
    size="1024x1024"
)
print(resp.data[0].url)
```

**JavaScript 示例**：

```javascript
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resp = await openai.images.generate({
  model: "dall-e-3",
  prompt: "一只戴着红色蝴蝶结的白色暹罗猫",
  n: 1,
  size: "1024x1024",
});
console.log(resp.data[0].url);
```

**cURL 示例**：

```bash
curl https://api.openai.com/v1/images/generations \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "dall-e-3",
    "prompt": "一只戴着红色蝴蝶结的白色暹罗猫",
    "n": 1,
    "size": "1024x1024"
  }'
```

### 编辑已有图像 (Image Edits)

- **接口**：`POST /v1/images/edits`
- **参数**：

  - `model` (string)：图像模型，如 `"dall-e-3"`.
  - `image` (file)：原始图像文件（PNG 格式，建议正方形，<4MB）。
  - `mask` (file, 可选)：掩码图像（PNG 格式）。白色部分表示将被编辑的区域。
  - `prompt` (string)：编辑提示，如“给人物戴上一顶帽子”。
  - `n`, `size`, `response_format` 同上。

**Python 示例**：在图像中的猫添加帽子

```python
import openai
openai.api_key = "YOUR_API_KEY"
image_file = open("cat.png", "rb")
mask_file = open("mask.png", "rb")
resp = openai.Image.edit(
    model="dall-e-3",
    image=image_file,
    mask=mask_file,
    prompt="为这只猫添加一顶蓝色的帽子",
    n=1,
    size="512x512"
)
print(resp.data[0].url)
```

**JavaScript 示例**：

```javascript
import fs from "fs";
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resp = await openai.images.edit({
  model: "dall-e-3",
  image: fs.createReadStream("cat.png"),
  mask: fs.createReadStream("mask.png"),
  prompt: "为这只猫添加一顶蓝色的帽子",
  n: 1,
  size: "512x512",
});
console.log(resp.data[0].url);
```

**cURL 示例**：

```bash
curl https://api.openai.com/v1/images/edits \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "image=@cat.png" \
  -F "mask=@mask.png" \
  -F "prompt=为这只猫添加一顶蓝色的帽子" \
  -F "n=1" \
  -F "size=512x512"
```

### 生成图像变体 (Image Variations)

- **接口**：`POST /v1/images/variations`
- **参数**：

  - `model` (string)：图像模型，如 `"dall-e-3"`.
  - `image` (file)：原始图像（PNG 格式）。
  - `n`, `size`, `response_format` 同上。

**Python 示例**：生成图像的 3 个变体

```python
import openai
openai.api_key = "YOUR_API_KEY"
image_file = open("cat.png", "rb")
resp = openai.Image.create_variation(
    model="dall-e-3",
    image=image_file,
    n=3,
    size="256x256"
)
for img in resp.data:
    print(img.url)
```

**JavaScript 示例**：

```javascript
import fs from "fs";
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resp = await openai.images.generateVariation({
  model: "dall-e-3",
  image: fs.createReadStream("cat.png"),
  n: 3,
  size: "256x256",
});
resp.data.forEach((img) => console.log(img.url));
```

**cURL 示例**：

```bash
curl https://api.openai.com/v1/images/variations \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "image=@cat.png" \
  -F "n=3" \
  -F "size=256x256"
```

**返回字段**（图像生成/编辑/变体）：

- **created** (integer)：Unix 时间戳。
- **data** (array)：图像数据列表，每项为一个对象：

  - 若 `response_format="url"`：对象包含 `url` (string)，指向生成图像的链接。
  - 若 `response_format="b64_json"`：对象包含 `b64_json` (string)，为图像的 Base64 编码。

- 其他字段如 `id`、`model` 可选。

## 语音转文本（Whisper）

Whisper API 用于音频转写或翻译，可通过 `POST /v1/audio/transcriptions`（转录到原语言）和 `POST /v1/audio/translations`（翻译并转录成英文）调用。默认使用开源模型 `whisper-1` 或低延迟的 `gpt-4o-mini-transcribe` 等。请求需上传音频文件，支持格式包括 mp3、mp4、mpeg、mpga、m4a、wav、webm 等（文件大小<25MB）。

- **参数**：

  - `model` (string)：选择模型，如 `"whisper-1"`、`"gpt-4o-mini-transcribe"` 等。
  - `file` (file)：音频文件。
  - `response_format` (string)：输出格式，可选 `"json"`、`"text"`、`"srt"`、`"verbose_json"`、`"vtt"` 等。
  - `language` (string, 可选)：指定音频语言（如 `"zh"`），可提高准确率。
  - `temperature` (number, 可选)：生成时的随机度，通常设置为 0。
  - `prompt` (string, 可选)：转录时提供的上下文提示，帮助改善分割。

示例代码：

```python
import openai
openai.api_key = "YOUR_API_KEY"
audio_file = open("speech.mp3", "rb")
resp = openai.Audio.transcriptions.create(
    model="whisper-1",
    file=audio_file,
    response_format="text"
)
print(resp["text"])
```

```javascript
import fs from "fs";
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resp = await openai.audio.transcriptions.create({
  model: "whisper-1",
  file: fs.createReadStream("speech.mp3"),
  response_format: "text",
});
console.log(resp.text);
```

```bash
curl https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F "model=whisper-1" \
  -F "file=@speech.mp3" \
  -F "response_format=text"
```

**返回字段**（取决于 `response_format`）：

- 当 `response_format="text"` 时，返回纯文本的转写结果。
- 当 `response_format="json"` 时，返回 JSON 对象通常包含：

  - **text** (string)：转写的完整文本。

- 使用 `"verbose_json"` 时，还会附加 **segments** 数组，每段包含时间戳和文本。
- `"srt"` 和 `"vtt"` 返回相应的字幕格式文本。
- 举例来说，有博客示例提到，转录输出格式可以选择 `json`、`text`、`srt`、`verbose_json` 或 `vtt`。

## 文本转语音（TTS）

TTS (Text-to-Speech) API 将文本合成为自然语音。当前可用模型包括 GPT-4o mini 的 TTS 模型以及专用模型 `tts-1`、`tts-1-hd`。调用 `POST /v1/audio/speech` 并传入参数生成音频。常用参数：

- `model` (string)：语音模型，如 `"tts-1"`、`"tts-1-hd"` 或 `"gpt-4o-mini-tts"`。
- `voice` (string)：选择语音角色，例如 `"alloy"`（合金）、`"echo"`（回声）、`"fable"`、`"onyx"`（玛瑙）、`"nova"`、`"shimmer"` 等（六种内置声音）。
- `input` (string)：待合成的文本内容。
- `output_format` (string, 可选)：输出音频格式，默认 `mp3`，可选 `wav` 等。
- `speed`、`pitch` 等参数（如 API 支持，可用于调整语速、音调）。

示例代码：生成一段语音并保存为 MP3 文件

```python
import openai
openai.api_key = "YOUR_API_KEY"
resp = openai.Audio.speech.create(
    model="tts-1",
    voice="alloy",
    input="今天天气真好，我们一起去公园散步吧。"
)
with open("speech.mp3", "wb") as f:
    f.write(resp["audio_stream"].read())
```

```javascript
import fs from "fs";
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resp = await openai.audio.speech.create({
  model: "tts-1",
  voice: "alloy",
  input: "今天天气真好，我们一起去公园散步吧。",
});
// 保存音频流到文件
await fs.promises.writeFile("speech.mp3", resp.audio_stream);
```

```bash
curl https://api.openai.com/v1/audio/speech \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tts-1",
    "voice": "alloy",
    "input": "今天天气真好，我们一起去公园散步吧。"
  }' > speech.mp3
```

**返回字段**：

- API 返回音频数据流，根据 `output_format` 设置输出格式（常为 MP3）。客户端可直接将响应流保存为文件。
- 返回内容类型为音频（如 `audio/mpeg` 等）。使用 SDK 时，可调用 `response.stream_to_file()` 或将 `audio_stream` 写入文件。
- 除音频流外，不会有额外的字段内容。

## 向量嵌入（Embeddings）

Embeddings API 将文本转换为向量表示，常用于语义搜索、聚类、分类等。调用 `POST /v1/embeddings`，输入文本得到高维向量。参数：

- `model` (string)：嵌入模型，如 `"text-embedding-3-small"`、`"text-embedding-ada-002"` 等。
- `input` (string or array)：待转换的文本或文本数组（支持批量输入）。

示例代码：

```python
import openai
openai.api_key = "YOUR_API_KEY"
text = "OpenAI 是一家人工智能公司。"
resp = openai.Embedding.create(
    model="text-embedding-3-small",
    input=[text]
)
embedding = resp.data[0].embedding  # 浮点数列表
print(len(embedding), "维向量")
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resp = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: "OpenAI 是一家人工智能公司。",
});
console.log(resp.data[0].embedding.length, "维向量");
```

```bash
curl https://api.openai.com/v1/embeddings \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-embedding-3-small",
    "input": "OpenAI 是一家人工智能公司。"
  }'
```

**返回字段**：

- **data** (array)：每个输入文本的嵌入向量列表。

  - 每项对象包含：

    - **index** (integer)：对应输入的索引。
    - **embedding** (array of floats)：嵌入向量（具体维度根据模型不同而不同，例如 1024、1536 等）。

- **model** (string)：使用的模型名称。
- **usage** (object, 可选)：可能包含 `prompt_tokens`, `total_tokens` 等计费信息。

## 文件上传与管理（Files）

OpenAI API 提供文件上传和管理接口，用于微调数据或其他用途。主要接口：

- **上传文件 (Create)**：`POST /v1/files`，通过 `multipart/form-data` 上传文件。

  - 参数：

    - `file` (file)：二进制文件（通常 JSONL 格式，用于微调、检索等）。
    - `purpose` (string)：文件用途，如 `"fine-tune"`、`"answers"`、`"search"` 等。

  **Python 示例**：

  ```python
  import openai
  openai.api_key = "YOUR_API_KEY"
  file = openai.File.create(file=open("train_data.jsonl","rb"), purpose='fine-tune')
  print(file.id)
  ```

  **JavaScript 示例**：

  ```javascript
  import fs from "fs";
  import OpenAI from "openai";
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const file = await openai.files.create({
    file: fs.createReadStream("train_data.jsonl"),
    purpose: "fine-tune",
  });
  console.log(file.id);
  ```

  **cURL 示例**：

  ```bash
  curl https://api.openai.com/v1/files \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -F "file=@train_data.jsonl" \
    -F "purpose=fine-tune"
  ```

  返回字段示例：

  - **id** (string)：文件 ID，可用于后续操作。
  - **object** (string)：`"file"`。
  - **bytes** (integer)：文件大小（字节）。
  - **created_at** (integer)：Unix 时间戳。
  - **filename** (string)：文件名。
  - **purpose** (string)：文件用途。
  - **status** (string)：处理状态（如 `"uploaded"`、`"processed"` 等，视用途而定）。

- **查询文件列表**：`GET /v1/files` 返回所有上传文件的摘要列表。

  - 示例：`openai.File.list()` 或 `await openai.files.list()`。

- **获取文件详情**：`GET /v1/files/{file_id}` 返回文件详细信息（字段同上传响应）。

  - 示例：`openai.File.retrieve("file-xxx")` 或 `await openai.files.retrieve("file-xxx")`。

- **删除文件**：`DELETE /v1/files/{file_id}` 删除指定文件。

  - 示例：`openai.File.delete("file-xxx")` 或 `await openai.files.delete("file-xxx")`。
  - 返回通常包含 `{ "id": "file-xxx", "deleted": true }`。

## 模型微调（Fine-tuning）

微调 API 允许使用自定义数据集训练专属模型。支持对 GPT-3.5 Turbo 等模型进行微调（GPT-4 系列按计划开放）。基本流程：

1. 准备训练数据为 JSONL 格式，每行包含 `prompt` 和 `completion` 字段。
2. 上传训练文件，设置 `purpose="fine-tune"`。
3. 调用 `POST /v1/fine-tunes` 创建微调任务，指定基础 `model`（如 `"gpt-3.5-turbo"`）和 `training_file`（文件 ID），可选 `validation_file`、`n_epochs`（训练轮数）、`learning_rate_multiplier` 等参数。

示例代码：

```python
import openai
openai.api_key = "YOUR_API_KEY"
response = openai.FineTune.create(
    model="gpt-3.5-turbo",
    training_file="file-xxxxxxxxxxxx"
)
print(response.id)  # 微调任务 ID
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const response = await openai.fineTunes.create({
  model: "gpt-3.5-turbo",
  training_file: "file-xxxxxxxxxxxx",
});
console.log(response.id);
```

```bash
curl https://api.openai.com/v1/fine-tunes \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "training_file": "file-xxxxxxxxxxxx"
  }'
```

- **列出微调任务**：`GET /v1/fine-tunes`，示例 `openai.FineTune.list()`。
- **查询微调状态**：`GET /v1/fine-tunes/{fine_tune_id}`，包括训练进度、状态和生成的模型信息。
- **取消微调**：`POST /v1/fine-tunes/{fine_tune_id}/cancel`。

**返回字段**（以创建微调任务为例）：

- **id** (string)：微调任务 ID (如 `"ft-abc123"`)。
- **object** (string)：`"fine-tune"`。
- **model** (string)：基础模型名（如 `"gpt-3.5-turbo"`）。
- **status** (string)：任务状态（如 `"pending"`、`"running"`、`"succeeded"`、`"failed"`）。
- **training_file** (string)：训练数据文件 ID。
- **validation_file** (string)：验证数据文件 ID（若提供）。
- **hyperparams** (object)：超参数配置（如 `n_epochs` 等）。
- **result_files** (array)：生成的模型文件列表，包括微调后的模型 ID。
- **events** (array)：训练过程日志。

⚠️ **注意**：微调所用数据和生成结果仅归客户所有，OpenAI 不会将这些数据用于训练其他模型。

以上内容涵盖了 2025 年公开的 OpenAI API 主要模块，包括示例代码、关键参数和返回字段解释，可作为开发者快速参考的 `.md` 文档。
