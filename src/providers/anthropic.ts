import { BaseProvider } from './base';
import { 
  TextGenerationParams, 
  TextGenerationResponse, 
  ProviderOptions,
  ChatMessage
} from '../types';

/**
 * Anthropic提供商特定选项
 */
export interface AnthropicOptions extends ProviderOptions {
  model?: string;
  anthropicVersion?: string;
  maxRetries?: number;
}

/**
 * Claude消息内容项类型
 */
type ClaudeContentItem = string | {
  type: string;
  text?: string;
  image_url?: {
    url: string;
  };
  document_url?: {
    url: string;
  };
  [key: string]: any;
};

/**
 * Anthropic Claude API请求消息格式
 */
interface ClaudeMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | ClaudeContent[];
}

/**
 * Claude内容块类型
 */
interface ClaudeContent {
  type: 'text' | 'image' | 'document' | 'tool_use' | 'tool_result';
  [key: string]: any;
}

/**
 * Claude工具定义
 */
interface ClaudeTool {
  name: string;
  description?: string;
  input_schema: Record<string, any>;
}

/**
 * Claude API响应格式
 */
interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: ClaudeContent[];
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Claude多模态内容块类型
 */
interface ClaudeMultiModalParams {
  image?: {
    url?: string;
    base64Data?: string;
    mimeType?: string;
  };
  document?: {
    url?: string;
    base64Data?: string;
    mimeType?: string;
  };
}

/**
 * Anthropic Claude API实现
 * 支持文本生成、多模态输入、工具调用等
 */
export class AnthropicProvider extends BaseProvider {
  readonly name = 'Anthropic';
  private model: string;
  private anthropicVersion: string;
  private maxRetries: number;

  /**
   * 创建Anthropic提供商实例
   */
  constructor(options: AnthropicOptions = {}) {
    super(options);
    this.model = options.model || 'claude-3-7-sonnet-20250219';
    this.anthropicVersion = options.anthropicVersion || '2024-06-23';
    this.maxRetries = options.maxRetries || 3;
  }

  /**
   * @inheritdoc
   */
  protected getDefaultBaseUrl(): string {
    return 'https://api.anthropic.com/v1';
  }

  /**
   * @inheritdoc
   */
  protected validateApiKey(): void {
    super.validateApiKey();
    if (this.apiKey && !this.apiKey.startsWith('sk-ant-')) {
      console.warn(`[${this.name}] 警告: API密钥格式可能不正确，应以 'sk-ant-' 开头`);
    }
  }

  /**
   * @inheritdoc
   */
  public async generateText(params: TextGenerationParams): Promise<TextGenerationResponse> {
    const model = params.model || this.model;
    
    // 构建消息格式
    const messages: ClaudeMessage[] = [];
    
    // 添加用户消息
    messages.push({
      role: 'user',
      content: params.prompt
    });
    
    // 构建请求体
    const requestBody: Record<string, any> = {
      model,
      messages,
      max_tokens: params.maxTokens || 1000,
      temperature: params.temperature ?? 0.7,
      stream: params.stream || false
    };
    
    // 添加系统消息（如果有）
    if (params.systemMessage) {
      requestBody.system = params.systemMessage;
    }
    
    // 添加top_p（如果指定）
    if (params.topP !== undefined) {
      requestBody.top_p = params.topP;
    }
    
    // 发送请求并获取响应
    const data = await this.sendClaudeRequest<ClaudeResponse>('/messages', requestBody);
    
    return {
      text: this.extractTextFromContent(data.content),
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
      },
      rawResponse: data
    };
  }
  
  /**
   * 支持多模态输入的Claude对话
   */
  public async chatCompletion(params: {
    messages: ChatMessage[];
    model?: string;
    systemMessage?: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    tools?: ClaudeTool[];
    stream?: boolean;
  }): Promise<TextGenerationResponse> {
    const model = params.model || this.model;
    
    // 将ChatMessage[]转换为Claude消息格式
    const claudeMessages = this.convertToCloudeMessages(params.messages);
    
    // 构建请求体
    const requestBody: Record<string, any> = {
      model,
      messages: claudeMessages,
      max_tokens: params.maxTokens || 1000,
      temperature: params.temperature ?? 0.7,
      stream: params.stream || false
    };
    
    // 添加系统消息
    if (params.systemMessage) {
      requestBody.system = params.systemMessage;
    }
    
    // 添加topP
    if (params.topP !== undefined) {
      requestBody.top_p = params.topP;
    }
    
    // 添加工具定义
    if (params.tools && params.tools.length > 0) {
      requestBody.tools = params.tools;
    }
    
    // 发送请求并获取响应
    const data = await this.sendClaudeRequest<ClaudeResponse>('/messages', requestBody);
    
    return {
      text: this.extractTextFromContent(data.content),
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
      },
      rawResponse: data
    };
  }
  
  /**
   * 创建流式输出的聊天会话
   */
  public async createStreamingChatCompletion(params: {
    messages: ChatMessage[];
    model?: string;
    systemMessage?: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    tools?: ClaudeTool[];
  }): Promise<ReadableStream<any>> {
    const model = params.model || this.model;
    
    // 将ChatMessage[]转换为Claude消息格式
    const claudeMessages = this.convertToCloudeMessages(params.messages);
    
    // 构建请求体
    const requestBody: Record<string, any> = {
      model,
      messages: claudeMessages,
      max_tokens: params.maxTokens || 1000,
      temperature: params.temperature ?? 0.7,
      stream: true
    };
    
    // 添加系统消息
    if (params.systemMessage) {
      requestBody.system = params.systemMessage;
    }
    
    // 添加topP
    if (params.topP !== undefined) {
      requestBody.top_p = params.topP;
    }
    
    // 添加工具定义
    if (params.tools && params.tools.length > 0) {
      requestBody.tools = params.tools;
    }
    
    // 获取流式响应
    return this.sendClaudeStreamRequest('/messages', requestBody);
  }
  
  /**
   * 生成JSON格式响应
   */
  public async generateJSON(params: TextGenerationParams): Promise<any> {
    const model = params.model || this.model;
    
    // 构建消息
    const messages: ClaudeMessage[] = [{
      role: 'user',
      content: params.prompt
    }];
    
    // 添加JSON格式要求
    const systemMessage = (params.systemMessage || '') + 
      '\n请以有效的JSON格式返回响应，不要包含额外的文本说明。';
    
    // 构建请求体
    const requestBody: Record<string, any> = {
      model,
      messages,
      system: systemMessage,
      max_tokens: params.maxTokens || 1000,
      temperature: params.temperature ?? 0.7
    };
    
    // 添加topP（如果指定）
    if (params.topP !== undefined) {
      requestBody.top_p = params.topP;
    }
    
    // 发送请求并获取响应
    const data = await this.sendClaudeRequest<ClaudeResponse>('/messages', requestBody);
    
    // 提取JSON文本
    const jsonText = this.extractTextFromContent(data.content);
    
    try {
      // 解析JSON
      const jsonData = JSON.parse(jsonText);
      
      return {
        data: jsonData,
        usage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
        }
      };
    } catch (error: any) {
      throw new Error(`[${this.name}] 解析JSON响应失败: ${error.message}`);
    }
  }
  
  /**
   * 计算消息的token数量
   */
  public async countTokens(messages: ChatMessage[], systemMessage?: string): Promise<{
    input_tokens: number;
  }> {
    const claudeMessages = this.convertToCloudeMessages(messages);
    
    const requestBody: Record<string, any> = {
      model: this.model,
      messages: claudeMessages
    };
    
    if (systemMessage) {
      requestBody.system = systemMessage;
    }
    
    const data = await this.sendClaudeRequest<{ input_tokens: number }>('/messages/count_tokens', requestBody);
    
    return {
      input_tokens: data.input_tokens
    };
  }
  
  /**
   * 发送Claude API请求
   */
  private async sendClaudeRequest<T>(endpoint: string, body: any): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey || '',
      'anthropic-version': this.anthropicVersion
    };
    
    let retries = 0;
    while (retries <= this.maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }
        
        return await response.json() as T;
      } catch (error) {
        retries++;
        
        if (retries > this.maxRetries) {
          if (error instanceof Error) {
            throw new Error(`[${this.name}] ${error.message}`);
          }
          throw error;
        }
        
        // 指数退避重试
        const delay = Math.min(1000 * Math.pow(2, retries), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error(`[${this.name}] 达到最大重试次数`);
  }
  
  /**
   * 发送Claude流式API请求
   */
  private async sendClaudeStreamRequest(endpoint: string, body: any): Promise<ReadableStream<any>> {
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey || '',
      'anthropic-version': this.anthropicVersion,
      'Accept': 'text/event-stream'
    };
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
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
   * 从Claude内容块中提取文本
   */
  private extractTextFromContent(content: ClaudeContent[]): string {
    return content
      .filter(item => item.type === 'text')
      .map(item => item.text || '')
      .join('');
  }
  
  /**
   * 将文本带图像提示发送到Claude
   * 支持URL或Base64编码图像
   */
  public async generateTextWithImage(params: TextGenerationParams & ClaudeMultiModalParams): Promise<TextGenerationResponse> {
    const model = params.model || this.model;
    
    // 构建多模态内容
    const content: ClaudeContent[] = [];
    
    // 添加图像内容（如果有）
    if (params.image) {
      if (params.image.url) {
        content.push({
          type: 'image',
          source: {
            type: 'url',
            url: params.image.url
          }
        });
      } else if (params.image.base64Data) {
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: params.image.mimeType || 'image/jpeg',
            data: params.image.base64Data
          }
        });
      }
    }
    
    // 添加文档内容（如果有）
    if (params.document) {
      if (params.document.url) {
        content.push({
          type: 'document',
          source: {
            type: 'url',
            url: params.document.url
          }
        });
      } else if (params.document.base64Data) {
        content.push({
          type: 'document',
          source: {
            type: 'base64',
            media_type: params.document.mimeType || 'application/pdf',
            data: params.document.base64Data
          }
        });
      }
    }
    
    // 添加文本内容
    content.push({
      type: 'text',
      text: params.prompt
    });
    
    // 构建请求消息
    const messages: ClaudeMessage[] = [{
      role: 'user',
      content
    }];
    
    // 构建请求体
    const requestBody: Record<string, any> = {
      model,
      messages,
      max_tokens: params.maxTokens || 1000,
      temperature: params.temperature ?? 0.7,
      stream: params.stream || false
    };
    
    // 添加系统消息（如果有）
    if (params.systemMessage) {
      requestBody.system = params.systemMessage;
    }
    
    // 添加top_p（如果指定）
    if (params.topP !== undefined) {
      requestBody.top_p = params.topP;
    }
    
    // 发送请求并获取响应
    const data = await this.sendClaudeRequest<ClaudeResponse>('/messages', requestBody);
    
    return {
      text: this.extractTextFromContent(data.content),
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
      },
      rawResponse: data
    };
  }

  /**
   * 将通用ChatMessage格式转换为Claude消息格式
   */
  private convertToCloudeMessages(messages: ChatMessage[]): ClaudeMessage[] {
    return messages.map(msg => {
      // Claude不支持function或tool角色，忽略它们或转换为用户消息
      const role = msg.role === 'function' || msg.role === 'tool' 
        ? 'user' 
        : (msg.role === 'system' ? 'user' : msg.role) as 'user' | 'assistant';
      
      // 简单文本内容
      if (typeof msg.content === 'string') {
        return {
          role,
          content: msg.content
        };
      } 
      
      // 处理复杂内容（数组，可能包含多模态内容）
      if (Array.isArray(msg.content)) {
        // 将内容转换为Claude格式
        const claudeContent: ClaudeContent[] = (msg.content as ClaudeContentItem[]).map(item => {
          // 文本内容
          if (typeof item === 'string' || (item && item.type === 'text')) {
            return {
              type: 'text',
              text: typeof item === 'string' ? item : (item.text || '')
            };
          }
          
          // 图像内容
          if (item && item.type === 'image' && item.image_url) {
            return {
              type: 'image',
              source: {
                type: 'url',
                url: item.image_url.url
              }
            };
          }
          
          // 文档内容
          if (item && item.type === 'document' && item.document_url) {
            return {
              type: 'document',
              source: {
                type: 'url',
                url: item.document_url.url
              }
            };
          }
          
          // 其他内容类型
          return {
            type: 'text',
            text: typeof item === 'object' ? JSON.stringify(item) : String(item)
          };
        });
        
        return {
          role,
          content: claudeContent
        };
      }
      
      // 默认处理
      return {
        role,
        content: String(msg.content || '')
      };
    });
  }
} 