import { BaseProvider } from './base';
import { 
  TextGenerationParams, 
  TextGenerationResponse, 
  ProviderOptions,
  ChatMessage,
  ChatCompletionParams
} from '../types';

/**
 * 豆包提供商特定选项
 */
export interface DoubaoOptions extends ProviderOptions {
  model?: string;
  endpointId?: string; // 推理接入点ID
  maxRetries?: number;
}

/**
 * 豆包(Doubao) API实现
 * 支持文本生成、聊天完成、流式响应和JSON输出
 * 与OpenAI API兼容，通过火山引擎平台提供
 */
export class DoubaoProvider extends BaseProvider {
  readonly name = 'Doubao';
  private model: string;
  private endpointId: string;
  private maxRetries: number;

  /**
   * 创建豆包提供商实例
   */
  constructor(options: DoubaoOptions = {}) {
    super(options);
    this.model = options.model || 'Doubao-pro-32k';
    this.endpointId = options.endpointId || ''; // 用户必须提供接入点ID
    this.maxRetries = options.maxRetries || 3;
    
    // 验证接入点ID
    if (!this.endpointId && !options.model) {
      console.warn(`[${this.name}] 警告: 未提供接入点ID(endpointId)，API调用可能会失败`);
    }
  }

  /**
   * @inheritdoc
   */
  protected getDefaultBaseUrl(): string {
    return 'https://ark.cn-beijing.volces.com/api/v3';
  }

  /**
   * @inheritdoc
   */
  public async generateText(params: TextGenerationParams): Promise<TextGenerationResponse> {
    // 对于豆包，使用聊天完成API更为适合
    const messages: ChatMessage[] = [];
    
    // 添加系统消息（如果有）
    if (params.systemMessage) {
      messages.push({
        role: 'system',
        content: params.systemMessage
      });
    }
    
    // 添加用户消息
    messages.push({
      role: 'user',
      content: params.prompt
    });
    
    // 使用聊天完成API
    return this.chatCompletion({
      model: params.model || this.endpointId || this.model,
      messages,
      maxTokens: params.maxTokens,
      temperature: params.temperature,
      topP: params.topP,
      stream: params.stream
    });
  }

  /**
   * 聊天完成API - 主要接口
   */
  public async chatCompletion(params: ChatCompletionParams): Promise<TextGenerationResponse> {
    // 在火山引擎中，model参数需要使用接入点ID (而非模型名称)
    const model = params.model || this.endpointId || this.model;
    
    // 构建请求体
    const requestBody: Record<string, any> = {
      model,
      messages: params.messages,
      max_tokens: params.maxTokens,
      temperature: params.temperature ?? 0.7,
      stream: params.stream || false
    };
    
    // 添加topP（如果指定）
    if (params.topP !== undefined) {
      requestBody.top_p = params.topP;
    }
    
    // 添加responseFormat（如果指定）
    if (params.responseFormat) {
      requestBody.response_format = params.responseFormat;
    }
    
    // 其他可选参数
    if (params.stop) requestBody.stop = params.stop;
    if (params.presencePenalty !== undefined) requestBody.presence_penalty = params.presencePenalty;
    if (params.frequencyPenalty !== undefined) requestBody.frequency_penalty = params.frequencyPenalty;
    if (params.logitBias) requestBody.logit_bias = params.logitBias;
    if (params.user) requestBody.user = params.user;
    
    // 发送请求
    let retries = 0;
    while (retries <= this.maxRetries) {
      try {
        const response = await this.sendRequest<any>(`${this.baseUrl}/chat/completions`, 'POST', requestBody);
        
        return {
          text: response.choices[0].message.content || '',
          usage: {
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0
          },
          rawResponse: response
        };
      } catch (error) {
        retries++;
        
        if (retries > this.maxRetries) {
          if (error instanceof Error) {
            throw new Error(`[${this.name}] ${error.message}`);
          }
          throw error;
        }
        
        // 指数退避重试，特别是处理速率限制错误 (429)
        const delay = Math.min(1000 * Math.pow(2, retries), 60000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error(`[${this.name}] 达到最大重试次数`);
  }

  /**
   * 创建流式聊天响应
   */
  public async createStreamingChatCompletion(params: ChatCompletionParams): Promise<ReadableStream<any>> {
    const model = params.model || this.endpointId || this.model;
    
    // 构建请求体
    const requestBody: Record<string, any> = {
      model,
      messages: params.messages,
      max_tokens: params.maxTokens,
      temperature: params.temperature ?? 0.7,
      stream: true
    };
    
    // 添加其他参数，与chatCompletion相同
    if (params.topP !== undefined) requestBody.top_p = params.topP;
    if (params.responseFormat) requestBody.response_format = params.responseFormat;
    if (params.stop) requestBody.stop = params.stop;
    if (params.presencePenalty !== undefined) requestBody.presence_penalty = params.presencePenalty;
    if (params.frequencyPenalty !== undefined) requestBody.frequency_penalty = params.frequencyPenalty;
    if (params.logitBias) requestBody.logit_bias = params.logitBias;
    if (params.user) requestBody.user = params.user;
    
    // 发送流式请求
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'text/event-stream'
      };
      
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }
      
      if (!response.body) {
        throw new Error('响应没有可读流');
      }
      
      return response.body;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`[${this.name}] ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 生成JSON格式响应
   */
  public async generateJSON(params: TextGenerationParams): Promise<any> {
    const messages: ChatMessage[] = [];
    
    // 添加系统消息（如果有）
    if (params.systemMessage) {
      messages.push({
        role: 'system',
        content: params.systemMessage + '\n请以有效的JSON格式返回数据，不要包含额外文本。'
      });
    } else {
      messages.push({
        role: 'system',
        content: '请以有效的JSON格式返回数据，不要包含额外文本。'
      });
    }
    
    // 添加用户消息
    messages.push({
      role: 'user',
      content: params.prompt
    });
    
    // 使用强制JSON格式的聊天完成
    const result = await this.chatCompletion({
      model: params.model || this.endpointId || this.model,
      messages,
      maxTokens: params.maxTokens,
      temperature: params.temperature,
      topP: params.topP,
      responseFormat: { type: 'json_object' }
    });
    
    try {
      // 解析JSON
      const jsonData = JSON.parse(result.text);
      
      return {
        data: jsonData,
        usage: result.usage
      };
    } catch (error: any) {
      throw new Error(`[${this.name}] 解析JSON响应失败: ${error.message}`);
    }
  }
} 