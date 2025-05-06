import { BaseProvider } from './base';
import { 
  TextGenerationParams, 
  TextGenerationResponse, 
  ProviderOptions,
  ChatCompletionParams
} from '../types';

/**
 * Google Gemini专用配置选项
 */
export interface GeminiOptions extends ProviderOptions {
  model?: string;
  projectId?: string;
  apiVersion?: string;
  maxRetries?: number;
}

/**
 * Google Gemini服务接口
 * 支持文本生成、对话聊天、流式回复和图像理解功能
 */
export class GeminiProvider extends BaseProvider {
  readonly name = 'Gemini';
  private model: string;
  private projectId?: string;
  private apiVersion: string;
  private maxRetries: number;

  /**
   * 创建Gemini服务实例
   */
  constructor(options: GeminiOptions = {}) {
    super(options);
    this.model = options.model || 'gemini-2.0-flash-001'; // 默认用Gemini 2.0
    this.projectId = options.projectId;
    this.apiVersion = options.apiVersion || 'v1'; // API版本
    this.maxRetries = options.maxRetries || 3;
  }

  /**
   * 获取默认API地址
   */
  protected getDefaultBaseUrl(): string {
    return `https://generativelanguage.googleapis.com/${this.apiVersion}`;
  }

  /**
   * 组装完整的API请求地址
   */
  private buildRequestUrl(endpoint: string): string {
    // 根据配置使用项目ID或API密钥
    if (this.projectId) {
      return `${this.baseUrl}/${endpoint}?project=${this.projectId}`;
    } else {
      return `${this.baseUrl}/${endpoint}?key=${this.apiKey}`;
    }
  }

  /**
   * 生成文本内容
   */
  public async generateText(params: TextGenerationParams): Promise<TextGenerationResponse> {
    const modelName = params.model || this.model;
    
    // 准备请求数据
    const requestBody: Record<string, any> = {
      contents: [
        {
          parts: [
            { text: params.prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: params.temperature ?? 0.7,
        topP: params.topP ?? 0.95,
        maxOutputTokens: params.maxTokens || 2048,
      }
    };
    
    // 添加系统指令
    if (params.systemMessage) {
      requestBody.contents.unshift({
        role: 'system',
        parts: [{ text: params.systemMessage }]
      });
    }
    
    // 需要流式输出就换方法处理
    if (params.stream) {
      return this.generateTextStream(modelName, requestBody);
    }
    
    const url = this.buildRequestUrl(`models/${modelName}:generateContent`);
    
    // 自动重试机制
    let retries = 0;
    while (retries <= this.maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`请求失败: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }
        
        const data = await response.json();
        
        // 解析回复内容
        const text = data.candidates[0].content.parts
          .map((part: any) => part.text || '')
          .join('');
        
        return {
          text,
          usage: {
            promptTokens: data.usageMetadata?.promptTokenCount || 0,
            completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
            totalTokens: data.usageMetadata?.totalTokenCount || 0
          },
          rawResponse: data
        };
      } catch (e) {
        retries++;
        
        if (retries > this.maxRetries) {
          if (e instanceof Error) {
            throw new Error(`[${this.name}] ${e.message}`);
          }
          throw e;
        }
        
        // 错误后延迟重试，避免触发频率限制
        const delay = Math.min(1000 * Math.pow(2, retries), 60000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error(`[${this.name}] 已重试多次但仍失败`);
  }
  
  /**
   * 流式生成文本
   */
  private async generateTextStream(modelName: string, requestBody: Record<string, any>): Promise<TextGenerationResponse> {
    const stream = await this.createStreamingContent(modelName, requestBody);
    
    // 流式模式只返回流对象，不直接返回内容
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
   * 聊天对话功能
   */
  public async chatCompletion(params: ChatCompletionParams): Promise<TextGenerationResponse> {
    const modelName = params.model || this.model;
    
    // 转换消息格式
    const contents = params.messages.map(message => {
      return {
        role: this.mapRoleToGeminiRole(message.role),
        parts: [{ text: message.content }]
      };
    });
    
    // 准备请求数据
    const requestBody: Record<string, any> = {
      contents,
      generationConfig: {
        temperature: params.temperature ?? 0.7,
        topP: params.topP ?? 0.95,
        maxOutputTokens: params.maxTokens || 2048
      }
    };
    
    // 流式模式切换
    if (params.stream) {
      return this.generateTextStream(modelName, requestBody);
    }
    
    const url = this.buildRequestUrl(`models/${modelName}:generateContent`);
    
    // 发送请求
    let retries = 0;
    while (retries <= this.maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }
        
        const data = await response.json();
        
        // 提取返回的文本内容
        const text = data.candidates[0].content.parts
          .map((part: any) => part.text || '')
          .join('');
        
        return {
          text,
          usage: {
            promptTokens: data.usageMetadata?.promptTokenCount || 0,
            completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
            totalTokens: data.usageMetadata?.totalTokenCount || 0
          },
          rawResponse: data
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
   * 映射角色名称到Gemini格式
   */
  private mapRoleToGeminiRole(role: string): string {
    switch (role) {
      case 'system':
        return 'system';
      case 'assistant':
        return 'model';
      case 'user':
      default:
        return 'user';
    }
  }
  
  /**
   * 创建流式内容生成
   */
  public async createStreamingChatCompletion(params: ChatCompletionParams): Promise<ReadableStream<any>> {
    const modelName = params.model || this.model;
    
    // 将聊天消息转换为Gemini格式
    const contents = params.messages.map(message => {
      return {
        role: this.mapRoleToGeminiRole(message.role),
        parts: [{ text: message.content }]
      };
    });
    
    // 构建请求体
    const requestBody: Record<string, any> = {
      contents,
      generationConfig: {
        temperature: params.temperature ?? 0.7,
        topP: params.topP ?? 0.95,
        maxOutputTokens: params.maxTokens || 2048
      }
    };
    
    return this.createStreamingContent(modelName, requestBody);
  }
  
  /**
   * 创建流式内容请求
   */
  private async createStreamingContent(modelName: string, requestBody: Record<string, any>): Promise<ReadableStream<any>> {
    // 添加流式标志
    requestBody.streamGenerationConfig = { streamMode: 'CONCURRENT' };
    
    const url = this.buildRequestUrl(`models/${modelName}:streamGenerateContent`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
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
    // 添加系统消息要求JSON输出
    const jsonSystemMessage = params.systemMessage
      ? `${params.systemMessage}\n请以有效的JSON格式返回数据，不要包含额外文本。`
      : '请以有效的JSON格式返回数据，不要包含额外文本。';
    
    const modelName = params.model || this.model;
    
    const requestBody: Record<string, any> = {
      contents: [
        {
          parts: [
            { text: params.prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: params.temperature ?? 0.3, // 降低温度，增加确定性
        topP: params.topP ?? 0.95,
        maxOutputTokens: params.maxTokens || 2048,
        responseMimeType: 'application/json' // 指定JSON MIME类型
      }
    };
    
    // 添加系统消息
    requestBody.contents.unshift({
      role: 'system',
      parts: [{ text: jsonSystemMessage }]
    } as any); // 使用类型断言解决TypeScript类型问题
    
    const url = this.buildRequestUrl(`models/${modelName}:generateContent`);
    
    let retries = 0;
    while (retries <= this.maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }
        
        const data = await response.json();
        
        // 提取返回的文本内容
        const text = data.candidates[0].content.parts
          .map((part: any) => part.text || '')
          .join('');
        
        try {
          // 解析JSON
          const jsonData = JSON.parse(text);
          
          return {
            data: jsonData,
            usage: {
              promptTokens: data.usageMetadata?.promptTokenCount || 0,
              completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
              totalTokens: data.usageMetadata?.totalTokenCount || 0
            }
          };
        } catch (jsonError) {
          throw new Error(`[${this.name}] 解析JSON响应失败: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
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
} 