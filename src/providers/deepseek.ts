import { BaseProvider } from './base';
import { 
  TextGenerationParams, 
  TextGenerationResponse, 
  ProviderOptions,
  ChatMessage,
  ChatCompletionParams
} from '../types';

/**
 * DeepSeek提供商特定选项
 */
export interface DeepSeekOptions extends ProviderOptions {
  model?: string;
  enableCacheMonitoring?: boolean;
  maxRetries?: number;
}

/**
 * DeepSeek API缓存使用信息
 */
export interface DeepSeekCacheInfo {
  hitTokens: number;
  missTokens: number;
  hitRate: number;
  estimatedSavings: number;
}

/**
 * DeepSeek API价格常量 (美元/百万token)
 */
export const DEEPSEEK_PRICES = {
  'deepseek-chat': {
    inputCacheHit: 0.07,
    inputCacheMiss: 0.27,
    output: 1.10
  },
  'deepseek-reasoner': {
    inputCacheHit: 0.14,
    inputCacheMiss: 0.55,
    output: 2.19
  }
};

/**
 * DeepSeek API实现
 * 支持两种主要模型：deepseek-chat（通用对话）和deepseek-reasoner（复杂推理）
 */
export class DeepSeekProvider extends BaseProvider {
  readonly name = 'DeepSeek';
  private model: string;
  private enableCacheMonitoring: boolean;
  private maxRetries: number;
  private cacheStats: {
    totalHitTokens: number;
    totalMissTokens: number;
    totalOutputTokens: number;
    requestCount: number;
  };

  /**
   * 创建DeepSeek提供商实例
   */
  constructor(options: DeepSeekOptions = {}) {
    super(options);
    this.model = options.model || 'deepseek-chat';
    this.enableCacheMonitoring = options.enableCacheMonitoring || false;
    this.maxRetries = options.maxRetries || 3;
    this.cacheStats = {
      totalHitTokens: 0,
      totalMissTokens: 0,
      totalOutputTokens: 0,
      requestCount: 0
    };
  }

  /**
   * @inheritdoc
   */
  protected getDefaultBaseUrl(): string {
    return 'https://api.deepseek.com';
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
   * 聊天完成API - 主要接口
   */
  public async chatCompletion(params: ChatCompletionParams): Promise<TextGenerationResponse> {
    const model = params.model || this.model;
    
    // 构建请求体
    const requestBody: Record<string, any> = {
      model,
      messages: params.messages,
      max_tokens: params.maxTokens || 2000,
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
    
    // 处理流式响应
    if (params.stream) {
      return this.createStreamingChatCompletionResponse(requestBody);
    }
    
    // 发送请求
    let retries = 0;
    while (retries <= this.maxRetries) {
      try {
        const response = await this.sendRequest<any>(`${this.baseUrl}/chat/completions`, 'POST', requestBody);
        
        // 更新缓存统计信息
        if (this.enableCacheMonitoring) {
          this.updateCacheStats(
            response.usage.prompt_cache_hit_tokens || 0,
            response.usage.prompt_cache_miss_tokens || 0,
            response.usage.completion_tokens || 0,
            model
          );
        }
        
        const cacheInfo = this.calculateCacheInfo(
          response.usage.prompt_cache_hit_tokens || 0,
          response.usage.prompt_cache_miss_tokens || 0,
          model
        );
        
        return {
          text: response.choices[0].message.content,
          usage: {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens
          },
          cacheInfo
        };
      } catch (error) {
        retries++;
        
        if (retries > this.maxRetries) {
          if (error instanceof Error) {
            throw new Error(`[${this.name}] ${error.message}`);
          }
          throw error;
        }
        
        // 指数退避重试
        const delay = Math.min(1000 * Math.pow(2, retries), 60000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error(`[${this.name}] 达到最大重试次数`);
  }
  
  /**
   * 创建流式响应对象
   */
  private async createStreamingChatCompletionResponse(requestBody: Record<string, any>): Promise<TextGenerationResponse> {
    const stream = await this.createStreamingChatCompletion({
      model: requestBody.model,
      messages: requestBody.messages,
      maxTokens: requestBody.max_tokens,
      temperature: requestBody.temperature,
      topP: requestBody.top_p
    });
    
    return {
      text: '',
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      },
      rawResponse: { stream }
    };
  }

  /**
   * 创建流式聊天响应
   */
  public async createStreamingChatCompletion(params: ChatCompletionParams): Promise<ReadableStream<any>> {
    const model = params.model || this.model;
    
    // 构建请求体
    const requestBody: Record<string, any> = {
      model,
      messages: params.messages,
      max_tokens: params.maxTokens || 2000,
      temperature: params.temperature ?? 0.7,
      stream: true
    };
    
    // 添加topP（如果指定）
    if (params.topP !== undefined) {
      requestBody.top_p = params.topP;
    }
    
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
   * 执行链式推理（Chain-of-Thought）
   * 使用deepseek-reasoner模型进行复杂推理任务
   */
  public async chainOfThought(params: TextGenerationParams): Promise<TextGenerationResponse> {
    // 确保使用推理模型
    const modelToUse = 'deepseek-reasoner';
    
    return this.generateText({
      ...params,
      model: modelToUse,
      // 可以在这里添加一些引导链式推理的提示词
      systemMessage: params.systemMessage || 
        "请一步一步思考这个问题，先分析问题，然后给出详细的推理过程，最后得出结论。"
    });
  }

  /**
   * 强制返回JSON格式
   */
  public async generateJSON(params: TextGenerationParams): Promise<any> {
    const model = params.model || this.model;
    
    const messages: ChatMessage[] = [
      { role: 'user', content: params.prompt }
    ];
    
    if (params.systemMessage) {
      messages.unshift({ 
        role: 'system', 
        content: params.systemMessage + '\n请以有效的JSON格式返回数据，不要包含额外文本。' 
      });
    } else {
      messages.unshift({
        role: 'system',
        content: '请以有效的JSON格式返回数据，不要包含额外文本。'
      });
    }
    
    const requestBody = {
      model,
      messages,
      temperature: params.temperature ?? 0.3,
      response_format: { type: "json_object" },
      max_tokens: params.maxTokens || 2000
    };
    
    let retries = 0;
    while (retries <= this.maxRetries) {
      try {
        const response = await this.sendRequest<any>(`${this.baseUrl}/chat/completions`, 'POST', requestBody);
        
        // 更新缓存统计信息
        if (this.enableCacheMonitoring) {
          this.updateCacheStats(
            response.usage.prompt_cache_hit_tokens || 0,
            response.usage.prompt_cache_miss_tokens || 0,
            response.usage.completion_tokens || 0,
            model
          );
        }
        
        try {
          const jsonContent = response.choices[0].message.content;
          const jsonData = JSON.parse(jsonContent);
          
          const cacheInfo = this.calculateCacheInfo(
            response.usage.prompt_cache_hit_tokens || 0,
            response.usage.prompt_cache_miss_tokens || 0,
            model
          );
          
          return {
            data: jsonData,
            usage: {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens
            },
            cacheInfo
          };
        } catch (error: any) {
          throw new Error(`[${this.name}] 解析JSON响应失败: ${error.message}`);
        }
      } catch (error) {
        retries++;
        
        if (retries > this.maxRetries) {
          if (error instanceof Error) {
            throw new Error(`[${this.name}] ${error.message}`);
          }
          throw error;
        }
        
        // 指数退避重试
        const delay = Math.min(1000 * Math.pow(2, retries), 60000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error(`[${this.name}] 达到最大重试次数`);
  }
  
  /**
   * 获取当前缓存统计信息
   */
  public getCacheStats(): {
    totalRequests: number;
    totalHitTokens: number;
    totalMissTokens: number;
    totalOutputTokens: number;
    hitRate: number;
    estimatedSavings: number;
  } {
    const totalInputTokens = this.cacheStats.totalHitTokens + this.cacheStats.totalMissTokens;
    const hitRate = totalInputTokens > 0 ? this.cacheStats.totalHitTokens / totalInputTokens : 0;
    
    const modelPrices = DEEPSEEK_PRICES[this.model as keyof typeof DEEPSEEK_PRICES] || DEEPSEEK_PRICES['deepseek-chat'];
    
    // 计算如果没有缓存，所有token都以cacheMiss价格计算的理论成本
    const theoreticalCost = (this.cacheStats.totalHitTokens + this.cacheStats.totalMissTokens) * 
                           (modelPrices.inputCacheMiss / 1000000);
    
    // 实际成本，使用缓存命中和未命中的不同价格
    const actualCost = (this.cacheStats.totalHitTokens * modelPrices.inputCacheHit / 1000000) +
                      (this.cacheStats.totalMissTokens * modelPrices.inputCacheMiss / 1000000);
    
    const savings = theoreticalCost - actualCost;
    
    return {
      totalRequests: this.cacheStats.requestCount,
      totalHitTokens: this.cacheStats.totalHitTokens,
      totalMissTokens: this.cacheStats.totalMissTokens,
      totalOutputTokens: this.cacheStats.totalOutputTokens,
      hitRate,
      estimatedSavings: savings
    };
  }
  
  /**
   * 重置缓存统计信息
   */
  public resetCacheStats(): void {
    this.cacheStats = {
      totalHitTokens: 0,
      totalMissTokens: 0,
      totalOutputTokens: 0,
      requestCount: 0
    };
  }
  
  /**
   * 根据缓存命中和未命中token数计算缓存信息
   */
  private calculateCacheInfo(hitTokens: number, missTokens: number, model: string): DeepSeekCacheInfo {
    const totalInputTokens = hitTokens + missTokens;
    const hitRate = totalInputTokens > 0 ? hitTokens / totalInputTokens : 0;
    
    const modelPrices = DEEPSEEK_PRICES[model as keyof typeof DEEPSEEK_PRICES] || DEEPSEEK_PRICES['deepseek-chat'];
    
    // 计算如果没有缓存，所有token都以cacheMiss价格计算的理论成本
    const theoreticalCost = totalInputTokens * (modelPrices.inputCacheMiss / 1000000);
    
    // 实际成本，使用缓存命中和未命中的不同价格
    const actualCost = (hitTokens * modelPrices.inputCacheHit / 1000000) +
                      (missTokens * modelPrices.inputCacheMiss / 1000000);
    
    const savings = theoreticalCost - actualCost;
    
    return {
      hitTokens,
      missTokens,
      hitRate,
      estimatedSavings: savings
    };
  }
  
  /**
   * 更新缓存统计信息
   */
  private updateCacheStats(hitTokens: number, missTokens: number, outputTokens: number, _model: string): void {
    this.cacheStats.totalHitTokens += hitTokens;
    this.cacheStats.totalMissTokens += missTokens;
    this.cacheStats.totalOutputTokens += outputTokens;
    this.cacheStats.requestCount += 1;
  }
} 