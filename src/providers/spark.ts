import { BaseProvider } from './base';
import { 
  TextGenerationParams, 
  TextGenerationResponse, 
  ProviderOptions,
  ChatMessage,
  ChatCompletionParams
} from '../types';
import * as crypto from 'crypto';

/**
 * 讯飞星火API提供商特定选项
 */
export interface SparkOptions extends ProviderOptions {
  model?: string;
  appId?: string;
  apiSecret?: string;  // 对应星火API的Secret Key
}

/**
 * 星火API可用模型
 */
export enum SparkModel {
  LITE = 'spark-lite',     // 轻量版，4k上下文
  PRO = 'spark-pro',       // 专业版，8k上下文
  PRO_128K = 'spark-pro-128k', // 专业长文本版，128k上下文
  MAX = 'spark-max',       // 高级版，8k上下文
  MAX_32K = 'spark-max-32k', // 高级长文本版，32k上下文
  ULTRA = 'spark-ultra'    // 4.0 Ultra版本，8k上下文
}

/**
 * 讯飞星火API提供商实现
 */
export class SparkProvider extends BaseProvider {
  readonly name = 'Spark';
  private model: string;
  private appId?: string;
  private apiSecret?: string;

  /**
   * 创建讯飞星火API提供商实例
   */
  constructor(options: SparkOptions = {}) {
    super(options);
    this.model = options.model || SparkModel.PRO;
    this.appId = options.appId;
    this.apiSecret = options.apiSecret;
    
    if (!this.appId) {
      console.warn(`[${this.name}] 警告: 未提供 AppID，某些功能可能不可用。`);
    }
    
    if (!this.apiSecret) {
      console.warn(`[${this.name}] 警告: 未提供 API Secret，某些功能可能不可用。`);
    }
  }

  /**
   * @inheritdoc
   */
  protected getDefaultBaseUrl(): string {
    return 'https://spark-api.xf-yun.com/v3.5';
  }

  /**
   * 获取请求头，包括鉴权信息
   */
  protected async getAuthHeaders(): Promise<Record<string, string>> {
    if (!this.apiKey || !this.appId || !this.apiSecret) {
      throw new Error('需要提供 API Key、AppID 和 API Secret 才能使用讯飞星火API');
    }
    
    // 计算当前时间戳
    const currentTime = Math.floor(Date.now() / 1000);
    // 过期时间：当前时间 + 1小时
    const expireTime = currentTime + 3600;
    
    // 构建鉴权URL和Body
    const host = new URL(this.baseUrl).host;
    const path = new URL(this.baseUrl).pathname;
    const authUrl = `host: ${host}\ndate: ${currentTime}\nPOST ${path} HTTP/1.1`;
    
    // 使用HMAC-SHA256哈希算法，使用API Secret作为密钥对authUrl签名
    const hmac = crypto.createHmac('sha256', this.apiSecret);
    const authBody = hmac.update(authUrl).digest('base64');
    
    // 构建鉴权字符串
    const authString = `api_key="${this.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${authBody}", date="${currentTime}", expire_time="${expireTime}"`;
    
    return {
      'Content-Type': 'application/json',
      'Authorization': authString,
      'X-AppId': this.appId
    };
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
    // 构建星火API特定请求体
    const requestBody: Record<string, any> = {
      header: {
        app_id: this.appId,
        uid: `user_${Date.now()}`  // 可以使用更稳定的用户标识
      },
      parameter: {
        chat: {
          domain: this.getSparkDomain(params.model || this.model),
          temperature: params.temperature ?? 0.7,
          top_k: 4,
          max_tokens: params.maxTokens || 2048,
          auditing: 'default'
        }
      },
      payload: {
        message: {
          text: this.convertMessagesToSparkFormat(params.messages)
        }
      }
    };
    
    // 获取带有鉴权信息的请求头
    const headers = await this.getAuthHeaders();
    
    // 发送请求
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 处理星火API特定的响应格式
      if (data.header.code !== 0) {
        throw new Error(`星火API错误: ${data.header.message} (代码: ${data.header.code})`);
      }
      
      // 提取回复文本
      const text = data.payload.choices.text[0].content;
      
      // 返回统一格式的响应
      return {
        text,
        usage: {
          promptTokens: data.payload.usage.text.prompt_tokens || 0,
          completionTokens: data.payload.usage.text.completion_tokens || 0,
          totalTokens: data.payload.usage.text.total_tokens || 0
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
   * 转换消息格式为星火API格式
   */
  private convertMessagesToSparkFormat(messages: ChatMessage[]): any[] {
    return messages.map(msg => {
      // 星火API使用不同的角色名称
      let role = msg.role;
      if (role === 'system') {
        role = 'assistant';  // 星火API使用assistant作为系统消息
      } else if (role === 'assistant') {
        role = 'assistant';  // 保持一致
      } else {
        role = 'user';       // 默认为用户
      }
      
      return {
        role,
        content: msg.content
      };
    });
  }
  
  /**
   * 获取星火API的领域/模型代码
   */
  private getSparkDomain(modelName: string): string {
    switch (modelName) {
      case SparkModel.LITE:
        return 'generalv3.5';
      case SparkModel.PRO:
        return 'generalv3';
      case SparkModel.PRO_128K:
        return 'generalv3.5';
      case SparkModel.MAX:
        return 'generalv2';
      case SparkModel.MAX_32K:
        return 'generalv2.5';
      case SparkModel.ULTRA:
        return 'generalv4.0';
      default:
        return 'generalv3';  // 默认使用Pro版本
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