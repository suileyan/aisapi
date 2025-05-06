import { AiProvider, ProviderOptions, TextGenerationParams, TextGenerationResponse, ImageGenerationParams, ImageGenerationResponse } from '../types';

/**
 * AI服务基类
 * 包含共享的基础功能，各服务商只需继承并添加特定实现
 */
export abstract class BaseProvider implements AiProvider {
  /** 服务提供商名称 */
  abstract readonly name: string;
  
  /** API访问密钥 */
  protected apiKey?: string;
  
  /** API服务地址 */
  protected baseUrl: string;
  
  /** 请求等待时间上限（毫秒） */
  protected timeout: number;

  /**
   * 创建服务实例
   * @param options 配置参数
   */
  constructor(options: ProviderOptions = {}) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || this.getDefaultBaseUrl();
    this.timeout = options.timeout || 30000;
    
    // 检查密钥是否存在
    this.validateApiKey();
  }

  /**
   * 获取默认服务地址
   * 每个子类需要提供自己的实现
   */
  protected abstract getDefaultBaseUrl(): string;

  /**
   * 检查API密钥
   */
  protected validateApiKey(): void {
    if (!this.apiKey) {
      console.warn(`[${this.name}] 警告: 没有设置API密钥，部分功能可能无法使用。`);
    }
  }

  /**
   * 文本生成功能
   * 必须由各服务商实现
   */
  abstract generateText(params: TextGenerationParams): Promise<TextGenerationResponse>;

  /**
   * 图像生成功能
   * 可选实现（不是所有服务商都支持）
   */
  generateImage?(params: ImageGenerationParams): Promise<ImageGenerationResponse>;

  /**
   * 发送HTTP请求的通用方法
   */
  protected async sendRequest<T>(url: string, method: string, body?: any): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status} ${response.statusText}`);
      }
      
      return await response.json() as T;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`[${this.name}] ${e.message}`);
      }
      throw e;
    }
  }
} 