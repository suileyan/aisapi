import { BaseProvider } from './base';
import { 
  TextGenerationParams, 
  TextGenerationResponse, 
  ProviderOptions,
  ChatMessage,
  ChatCompletionParams
} from '../types';

/**
 * 阿里巴巴千问(Qwen)提供商特定选项
 */
export interface QwenOptions extends ProviderOptions {
  model?: string;
}

/**
 * 千问API可用模型
 */
export enum QwenModel {
  TURBO = 'qwen-turbo',          // 快速响应模型，优化延迟
  PLUS = 'qwen-plus',            // 高性能模型，增强推理能力
  MAX = 'qwen-max-2025-01-25'    // 顶级性能模型 (如 Qwen2.5-Max)
}

/**
 * 千问API调用模式
 */
export enum QwenApiMode {
  DASH_SCOPE = 'dashscope',       // 原生DashScope API
  OPENAI_COMPATIBLE = 'openai'    // OpenAI兼容模式
}

/**
 * 阿里巴巴千问(Qwen)API实现
 */
export class QwenProvider extends BaseProvider {
  readonly name = 'Qwen';
  private model: string;
  private apiMode: QwenApiMode;

  /**
   * 创建千问API提供商实例
   */
  constructor(options: QwenOptions = {}) {
    super(options);
    this.model = options.model || QwenModel.TURBO;
    this.apiMode = QwenApiMode.OPENAI_COMPATIBLE; // 默认使用OpenAI兼容模式，更易集成
  }

  /**
   * @inheritdoc
   */
  protected getDefaultBaseUrl(): string {
    return this.apiMode === QwenApiMode.OPENAI_COMPATIBLE
      ? 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
      : 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
  }

  /**
   * 获取请求头
   */
  protected getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    
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
    if (this.apiMode === QwenApiMode.OPENAI_COMPATIBLE) {
      return this.openaiCompatibleChatCompletion(params);
    } else {
      return this.dashscopeChatCompletion(params);
    }
  }

  /**
   * 使用OpenAI兼容接口调用聊天完成
   */
  private async openaiCompatibleChatCompletion(params: ChatCompletionParams): Promise<TextGenerationResponse> {
    const requestBody: Record<string, any> = {
      model: params.model || this.model,
      messages: params.messages,
      max_tokens: params.maxTokens,
      temperature: params.temperature ?? 1.0,
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
    
    // 转换响应为统一格式
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
   * 使用DashScope原生API调用聊天完成
   */
  private async dashscopeChatCompletion(params: ChatCompletionParams): Promise<TextGenerationResponse> {
    const requestBody: Record<string, any> = {
      model: params.model || this.model,
      messages: params.messages,
      parameters: {
        max_tokens: params.maxTokens,
        temperature: params.temperature ?? 1.0,
        top_p: params.topP
      },
      result_format: 'message'
    };
    
    // 移除undefined字段
    ["max_tokens", "temperature", "top_p"].forEach(key => {
      if (requestBody.parameters[key] === undefined) {
        delete requestBody.parameters[key];
      }
    });
    
    const response = await this.sendRequest<any>(
      this.baseUrl, 
      'POST', 
      requestBody
    );
    
    // 转换DashScope响应为统一格式
    return {
      text: response.output.choices[0].message.content || '',
      usage: {
        promptTokens: response.usage?.input_tokens || 0,
        completionTokens: response.usage?.output_tokens || 0,
        totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
      },
      rawResponse: response
    };
  }
  
  /**
   * 设置API调用模式
   */
  public setApiMode(mode: QwenApiMode): void {
    this.apiMode = mode;
    // 更新基础URL
    this.baseUrl = this.getDefaultBaseUrl();
  }
  
  /**
   * 流式聊天完成
   */
  public async createStreamingChatCompletion(params: ChatCompletionParams): Promise<ReadableStream<any>> {
    if (this.apiMode !== QwenApiMode.OPENAI_COMPATIBLE) {
      throw new Error(`[${this.name}] 流式响应仅支持OpenAI兼容模式`);
    }
    
    const requestBody: Record<string, any> = {
      model: params.model || this.model,
      messages: params.messages,
      max_tokens: params.maxTokens,
      temperature: params.temperature ?? 1.0,
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
    
    if (this.apiMode === QwenApiMode.OPENAI_COMPATIBLE) {
      // 在OpenAI兼容模式下使用responseFormat参数
      const systemMessage = params.systemMessage 
        ? `${params.systemMessage}\n请以有效的JSON格式返回回复。`
        : '请以有效的JSON格式返回回复。';
      
      const messages: ChatMessage[] = [
        { role: 'system', content: systemMessage },
        { role: 'user', content: params.prompt }
      ];
      
      const requestBody: Record<string, any> = {
        model,
        messages,
        max_tokens: params.maxTokens,
        temperature: params.temperature || 0.1, // 降低温度以获得更确定的响应
        top_p: params.topP,
        response_format: { type: "json_object" }
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
      
      try {
        const content = response.choices[0].message.content || '';
        return JSON.parse(content);
      } catch (error) {
        console.warn(`[${this.name}] 无法解析响应为JSON: ${error instanceof Error ? error.message : '未知错误'}`);
        return { text: response.choices[0].message.content, error: '解析JSON失败' };
      }
    } else {
      // DashScope原生API模式下不支持responseFormat，使用手动提示
      const systemMessage = params.systemMessage 
        ? `${params.systemMessage}\n请以有效的JSON格式返回回复。仅返回JSON，不要有其他解释性文字。`
        : '请以有效的JSON格式返回回复。仅返回JSON，不要有其他解释性文字。';
      
      const response = await this.generateText({
        ...params,
        systemMessage,
        temperature: params.temperature || 0.1 // 降低温度以获得更确定的响应
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
} 