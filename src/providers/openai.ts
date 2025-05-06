import { BaseProvider } from './base';
import { 
  TextGenerationParams, 
  TextGenerationResponse, 
  ImageGenerationParams, 
  ImageGenerationResponse, 
  ProviderOptions,
  ChatMessage,
  ChatCompletionParams,
  ChatCompletionResponse,
  AudioTranscriptionParams,
  AudioTranscriptionResponse,
  TextToSpeechParams,
  TextToSpeechResponse,
  EmbeddingParams,
  EmbeddingResponse,
  ImageEditParams,
  ImageVariationParams,
  ModelsResponse,
  ModelInfo
} from '../types';

/**
 * OpenAI专用配置选项
 */
export interface OpenAIOptions extends ProviderOptions {
  model?: string;
  organization?: string;
}

/**
 * OpenAI服务接口实现
 */
export class OpenAIProvider extends BaseProvider {
  readonly name = 'OpenAI';
  private model: string;
  private organization?: string;

  /**
   * 创建一个新的OpenAI服务实例
   */
  constructor(options: OpenAIOptions = {}) {
    super(options);
    this.model = options.model || 'gpt-3.5-turbo';
    this.organization = options.organization;
    
    // 设置组织信息（如果有的话）
    if (this.organization) {
      // 后续可能需要根据组织信息设置请求头等
    }
  }

  /**
   * 获取默认API地址
   */
  protected getDefaultBaseUrl(): string {
    return 'https://api.openai.com/v1';
  }

  /**
   * 准备API请求头
   */
  protected getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
    
    if (this.organization) {
      headers['OpenAI-Organization'] = this.organization;
    }
    
    return headers;
  }

  /**
   * 生成文本（旧版API，保留是为了兼容）
   */
  public async generateText(params: TextGenerationParams): Promise<TextGenerationResponse> {
    // 有系统消息时，转用Chat接口
    if (params.systemMessage) {
      const messages: ChatMessage[] = [
        { role: 'system', content: params.systemMessage },
        { role: 'user', content: params.prompt }
      ];
      
      return this.chatCompletion({
        model: params.model || this.model,
        messages,
        maxTokens: params.maxTokens,
        temperature: params.temperature,
        topP: params.topP,
        stream: params.stream
      });
    }
    
    // 没有系统消息则用传统接口
    const model = params.model || this.model;
    
    const requestBody = {
      model,
      prompt: params.prompt,
      max_tokens: params.maxTokens || 150,
      temperature: params.temperature ?? 0.7,
      top_p: params.topP,
      stream: params.stream || false
    };
    
    const response = await this.sendRequest<any>(`${this.baseUrl}/completions`, 'POST', requestBody);
    
    return {
      text: response.choices[0].text.trim(),
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens
      },
      rawResponse: response
    };
  }

  /**
   * 对话聊天接口（推荐使用这个）
   */
  public async chatCompletion(params: ChatCompletionParams): Promise<TextGenerationResponse> {
    const requestBody: Record<string, any> = {
      model: params.model || this.model,
      messages: params.messages,
      max_tokens: params.maxTokens,
      temperature: params.temperature ?? 0.7,
      top_p: params.topP,
      n: params.n,
      stream: params.stream || false,
      stop: params.stop,
      presence_penalty: params.presencePenalty,
      frequency_penalty: params.frequencyPenalty,
      logit_bias: params.logitBias,
      user: params.user,
      response_format: params.responseFormat
    };
    
    // 清理掉没设置的选项
    Object.keys(requestBody).forEach(key => {
      if (requestBody[key] === undefined) {
        delete requestBody[key];
      }
    });
    
    const response = await this.sendRequest<ChatCompletionResponse>(
      `${this.baseUrl}/chat/completions`, 
      'POST', 
      requestBody
    );
    
    return {
      text: response.choices[0].message.content || '',
      usage: {
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        totalTokens: response.usage.totalTokens
      },
      rawResponse: response
    };
  }

  /**
   * 生成图片 - 调用DALL·E
   */
  public async generateImage(params: ImageGenerationParams): Promise<ImageGenerationResponse> {
    const requestBody: Record<string, any> = {
      model: params.model || 'dall-e-3',
      prompt: params.prompt,
      n: params.n || 1,
      size: params.size || '1024x1024',
      response_format: params.responseFormat || 'url',
      user: params.user
    };
    
    // 清理掉没设置的选项
    Object.keys(requestBody).forEach(key => {
      if (requestBody[key] === undefined) {
        delete requestBody[key];
      }
    });
    
    const response = await this.sendRequest<any>(`${this.baseUrl}/images/generations`, 'POST', requestBody);
    
    return {
      urls: response.data.map((item: any) => item.url),
      rawResponse: response
    };
  }

  /**
   * 图片编辑 - 上传并修改现有图片
   */
  public async editImage(params: ImageEditParams): Promise<ImageGenerationResponse> {
    const url = `${this.baseUrl}/images/edits`;
    const formData = new FormData();
    
    formData.append('image', params.image);
    if (params.mask) formData.append('mask', params.mask);
    formData.append('prompt', params.prompt);
    
    if (params.n) formData.append('n', params.n.toString());
    if (params.size) formData.append('size', params.size);
    if (params.model) formData.append('model', params.model);
    if (params.user) formData.append('user', params.user);
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`
    };
    if (this.organization) {
      headers['OpenAI-Organization'] = this.organization;
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        urls: data.data.map((item: any) => item.url),
        rawResponse: data
      };
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`[${this.name}] ${e.message}`);
      }
      throw e;
    }
  }

  /**
   * 图片变体 - 基于上传图片生成相似但不同的版本
   */
  public async createImageVariation(params: ImageVariationParams): Promise<ImageGenerationResponse> {
    const url = `${this.baseUrl}/images/variations`;
    const formData = new FormData();
    
    formData.append('image', params.image);
    
    if (params.n) formData.append('n', params.n.toString());
    if (params.size) formData.append('size', params.size);
    if (params.model) formData.append('model', params.model);
    if (params.user) formData.append('user', params.user);
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`
    };
    if (this.organization) {
      headers['OpenAI-Organization'] = this.organization;
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        urls: data.data.map((item: any) => item.url),
        rawResponse: data
      };
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`[${this.name}] ${e.message}`);
      }
      throw e;
    }
  }

  /**
   * 语音识别 - 把录音转成文字
   */
  public async transcribeAudio(params: AudioTranscriptionParams): Promise<AudioTranscriptionResponse> {
    const url = `${this.baseUrl}/audio/transcriptions`;
    const formData = new FormData();
    
    formData.append('file', params.file);
    formData.append('model', params.model || 'whisper-1');
    
    if (params.language) formData.append('language', params.language);
    if (params.prompt) formData.append('prompt', params.prompt);
    if (params.responseFormat) formData.append('response_format', params.responseFormat);
    if (params.temperature) formData.append('temperature', params.temperature.toString());
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`
    };
    if (this.organization) {
      headers['OpenAI-Organization'] = this.organization;
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 根据响应格式处理结果
      if (params.responseFormat === 'text') {
        return { text: data, rawResponse: data };
      } else {
        return { 
          text: data.text, 
          rawResponse: data 
        };
      }
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`[${this.name}] ${e.message}`);
      }
      throw e;
    }
  }

  /**
   * 语音合成 - 把文字转成自然语音
   */
  public async textToSpeech(params: TextToSpeechParams): Promise<TextToSpeechResponse> {
    const requestBody = {
      model: params.model || 'tts-1',
      input: params.input,
      voice: params.voice || 'alloy',
      response_format: params.responseFormat || 'mp3',
      speed: params.speed || 1.0
    };
    
    const url = `${this.baseUrl}/audio/speech`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
    if (this.organization) {
      headers['OpenAI-Organization'] = this.organization;
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }
      
      const audioData = await response.arrayBuffer();
      
      return {
        audioData,
        format: params.responseFormat || 'mp3'
      };
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`[${this.name}] ${e.message}`);
      }
      throw e;
    }
  }

  /**
   * 生成向量嵌入 - 把文本转为AI可理解的数值向量
   */
  public async createEmbedding(params: EmbeddingParams): Promise<EmbeddingResponse> {
    const requestBody = {
      model: params.model || 'text-embedding-3-small',
      input: params.input,
      user: params.user
    };
    
    const response = await this.sendRequest<EmbeddingResponse>(
      `${this.baseUrl}/embeddings`, 
      'POST', 
      requestBody
    );
    
    return response;
  }

  /**
   * 测试API密钥是否有效
   */
  public async validateApiKey(): Promise<boolean> {
    try {
      await this.sendRequest(`${this.baseUrl}/models`, 'GET');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取可用的模型列表
   */
  public async listModels(): Promise<ModelsResponse> {
    return await this.sendRequest<ModelsResponse>(`${this.baseUrl}/models`, 'GET');
  }
  
  /**
   * 获取特定模型的详细信息
   */
  public async getModel(modelId: string): Promise<ModelInfo> {
    return await this.sendRequest<ModelInfo>(`${this.baseUrl}/models/${modelId}`, 'GET');
  }
  
  /**
   * 直接获取JSON格式的回复
   */
  public async generateJSON(params: TextGenerationParams): Promise<any> {
    const chatParams: ChatCompletionParams = {
      model: params.model || this.model,
      messages: [
        ...(params.systemMessage ? [{ role: 'system' as const, content: params.systemMessage }] : []),
        { role: 'user' as const, content: params.prompt }
      ],
      maxTokens: params.maxTokens,
      temperature: params.temperature,
      responseFormat: { type: 'json_object' }
    };
    
    const response = await this.chatCompletion(chatParams);
    
    try {
      const jsonContent = response.text;
      const jsonData = JSON.parse(jsonContent);
      
      return {
        data: jsonData,
        usage: response.usage
      };
    } catch (e: any) {
      throw new Error(`[${this.name}] 解析JSON响应失败: ${e.message}`);
    }
  }
  
  /**
   * 创建流式对话 - 即时获取生成中的回复
   * 返回可监听的数据流
   */
  public async createStreamingChatCompletion(params: ChatCompletionParams): Promise<ReadableStream<any>> {
    if (!params.stream) {
      params.stream = true;
    }
    
    const requestBody: Record<string, any> = {
      model: params.model || this.model,
      messages: params.messages,
      max_tokens: params.maxTokens,
      temperature: params.temperature ?? 0.7,
      top_p: params.topP,
      stream: true,
      stop: params.stop,
      presence_penalty: params.presencePenalty,
      frequency_penalty: params.frequencyPenalty,
      logit_bias: params.logitBias,
      user: params.user
    };
    
    // 移除undefined字段
    Object.keys(requestBody).forEach(key => {
      if (requestBody[key] === undefined) {
        delete requestBody[key];
      }
    });
    
    const headers = this.getHeaders();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }
      
      if (!response.body) {
        throw new Error('响应没有包含可读流');
      }
      
      return response.body;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`[${this.name}] ${e.message}`);
      }
      throw e;
    }
  }
} 