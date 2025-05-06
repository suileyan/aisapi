import { BaseProvider } from './base';
import { 
  TextGenerationParams, 
  TextGenerationResponse, 
  ProviderOptions,
  ChatMessage,
  ChatCompletionParams
} from '../types';

/**
 * 智谱AI提供商特定选项
 */
export interface ZhipuOptions extends ProviderOptions {
  model?: string;
}

/**
 * 智谱AI可用模型
 */
export enum ZhipuModel {
  GLM_4 = 'glm-4',          // GLM-4多模态模型，128k上下文
  GLM_3_TURBO = 'glm-3-turbo', // GLM-3-turbo高性能对话模型
  CHATGLM_PRO = 'chatglm_pro'  // 旧版对话优化模型
}

/**
 * 智谱AI API实现
 */
export class ZhipuProvider extends BaseProvider {
  readonly name = 'Zhipu';
  private model: string;

  /**
   * 创建智谱AI提供商实例
   */
  constructor(options: ZhipuOptions = {}) {
    super(options);
    this.model = options.model || ZhipuModel.GLM_3_TURBO;
  }

  /**
   * @inheritdoc
   */
  protected getDefaultBaseUrl(): string {
    return 'https://open.bigmodel.cn/api/paas/v4';
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
    
    // 发送请求
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        text: data.choices[0].message.content || '',
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        },
        rawResponse: data
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`[${this.name}] ${error.message}`);
      }
      throw error;
    }
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