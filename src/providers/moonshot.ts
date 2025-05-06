import { BaseProvider } from './base';
import { 
  TextGenerationParams, 
  TextGenerationResponse, 
  ProviderOptions,
  ChatMessage,
  ChatCompletionParams
} from '../types';

/**
 * Moonshot AI (Kimi) 提供商特定选项
 */
export interface MoonshotOptions extends ProviderOptions {
  model?: string;
}

/**
 * Moonshot AI API价格（美元/百万tokens）
 * 随时间可能变化，请参考官方文档获取最新价格
 */
export const MOONSHOT_PRICES = {
  input: 1.50,  // 输入价格
  output: 2.00  // 输出价格
};

/**
 * Moonshot AI (Kimi) 提供商实现
 */
export class MoonshotProvider extends BaseProvider {
  readonly name = 'Moonshot';
  private model: string;

  /**
   * 创建Moonshot AI提供商实例
   */
  constructor(options: MoonshotOptions = {}) {
    super(options);
    this.model = options.model || 'moonshot-v1-8k';
  }

  /**
   * @inheritdoc
   */
  protected getDefaultBaseUrl(): string {
    return 'https://api.moonshot.cn/v1';
  }

  /**
   * 获取请求头
   */
  protected getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
    
    return headers;
  }

  /**
   * @inheritdoc
   */
  public async generateText(params: TextGenerationParams): Promise<TextGenerationResponse> {
    const model = params.model || this.model;
    
    // 准备请求体
    const messages: ChatMessage[] = [
      { role: 'user', content: params.prompt }
    ];
    
    // 如果有系统消息，添加到消息列表开头
    if (params.systemMessage) {
      messages.unshift({ role: 'system', content: params.systemMessage });
    }
    
    // 使用聊天完成API
    return this.chatCompletion({
      model,
      messages,
      maxTokens: params.maxTokens,
      temperature: params.temperature,
      topP: params.topP,
      stream: params.stream
    });
  }

  /**
   * 聊天完成API
   */
  public async chatCompletion(params: ChatCompletionParams): Promise<TextGenerationResponse> {
    const requestBody: Record<string, any> = {
      model: params.model || this.model,
      messages: params.messages,
      max_tokens: params.maxTokens,
      temperature: params.temperature ?? 0.7,
      top_p: params.topP,
      stream: params.stream || false
    };
    
    // 移除undefined字段
    Object.keys(requestBody).forEach(key => {
      if (requestBody[key] === undefined) {
        delete requestBody[key];
      }
    });
    
    const response = await this.sendRequest<any>(
      `${this.baseUrl}/chat/completions`, 
      'POST', 
      requestBody
    );
    
    return {
      text: response.choices[0].message.content || '',
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      },
      rawResponse: response
    };
  }
  
  /**
   * 流式聊天完成
   */
  public async createStreamingChatCompletion(params: ChatCompletionParams): Promise<ReadableStream<any>> {
    const requestBody: Record<string, any> = {
      model: params.model || this.model,
      messages: params.messages,
      max_tokens: params.maxTokens,
      temperature: params.temperature ?? 0.7,
      top_p: params.topP,
      stream: true
    };
    
    // 移除undefined字段
    Object.keys(requestBody).forEach(key => {
      if (requestBody[key] === undefined) {
        delete requestBody[key];
      }
    });
    
    const headers: Record<string, string> = this.getHeaders();
    const url = `${this.baseUrl}/chat/completions`;
    
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
      
      return response.body as ReadableStream<any>;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`[${this.name}] ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 生成JSON格式输出
   */
  public async generateJSON(params: TextGenerationParams): Promise<any> {
    const model = params.model || this.model;
    
    // 构建系统消息，指示返回JSON格式
    const systemMessage = params.systemMessage 
      ? `${params.systemMessage}\n请以有效的JSON格式返回回复。`
      : '请以有效的JSON格式返回回复。';
    
    const messages: ChatMessage[] = [
      { role: 'system', content: systemMessage },
      { role: 'user', content: params.prompt }
    ];
    
    const response = await this.chatCompletion({
      model,
      messages,
      maxTokens: params.maxTokens,
      temperature: params.temperature || 0.1, // 降低温度以获得更确定的响应
      topP: params.topP,
      stream: false
    });
    
    try {
      // 尝试解析响应文本为JSON
      return JSON.parse(response.text);
    } catch (error) {
      // 如果解析失败，返回原始文本
      console.warn(`[${this.name}] 无法解析响应为JSON: ${error instanceof Error ? error.message : '未知错误'}`);
      return { text: response.text, error: '解析JSON失败' };
    }
  }
} 