import { BaseProvider } from './base';
import { 
  TextGenerationParams, 
  TextGenerationResponse, 
  ProviderOptions,
  ChatMessage,
  ChatCompletionParams
} from '../types';

/**
 * 文心一言配置选项
 */
export interface ErnieOptions extends ProviderOptions {
  model?: string;
  apiKey?: string;  // 百度API密钥
  secretKey?: string;  // 百度安全密钥
}

/**
 * 文心一言可用的模型列表
 */
export enum ErnieModel {
  // 基础系列
  ERNIE_BOT = 'ernie-bot',                  // 通用对话大模型
  ERNIE_BOT_TURBO = 'ernie-bot-turbo',      // 快速版大模型
  ERNIE_BOT_4 = 'ernie-bot-4',              // 旗舰大模型
  
  // 速度优化系列
  ERNIE_SPEED_8K = 'ernie-speed-8k',        // 速度优化版(8K窗口)
  ERNIE_SPEED_128K = 'ernie-speed-128k',    // 长文本速度版(128K窗口)
  
  // 高性能系列
  ERNIE_4_0_8K = 'ernie-4.0-8k',            // 4.0版(8K窗口)
  ERNIE_4_0_8K_PREVIEW = 'ernie-4.0-8k-preview', // 4.0预览版
  ERNIE_3_5_8K = 'ernie-3.5-8k',            // 3.5版(8K窗口)
  ERNIE_3_5_8K_PREVIEW = 'ernie-3.5-8k-preview', // 3.5预览版
  
  // 轻量系列
  ERNIE_LITE_8K = 'ernie-lite-8k',          // 轻量版(8K窗口)
  ERNIE_TINY_8K = 'ernie-tiny-8k',          // 超轻量版(8K窗口)
  
  // 特色模型
  ERNIE_CHARACTER_8K = 'ernie-character-8k',   // 角色扮演模型
  ERNIE_SPEED_APP_BUILDER = 'ernie-speed-appbuilder' // 应用开发专用模型
}

/**
 * 文心一言接口实现
 */
export class ErnieProvider extends BaseProvider {
  readonly name = 'Ernie';
  private model: string;
  private secretKey?: string;
  private accessToken?: string;
  private tokenExpireTime: number = 0;

  /**
   * 创建文心一言服务实例
   */
  constructor(options: ErnieOptions = {}) {
    super(options);
    this.model = options.model || ErnieModel.ERNIE_BOT;
    this.secretKey = options.secretKey;
    
    if (!this.secretKey) {
      console.warn(`[${this.name}] 提示: 缺少安全密钥(Secret Key)，部分功能可能无法使用`);
    }
  }

  /**
   * 获取默认API地址
   */
  protected getDefaultBaseUrl(): string {
    return 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop';
  }

  /**
   * 获取授权Token
   * 百度API需要先获取访问凭证才能调用
   */
  private async getAccessToken(): Promise<string> {
    // 已有有效token就直接用
    const now = Date.now();
    if (this.accessToken && now < this.tokenExpireTime) {
      return this.accessToken;
    }
    
    if (!this.apiKey || !this.secretKey) {
      throw new Error('使用文心一言需要提供API Key和Secret Key');
    }
    
    try {
      const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${this.apiKey}&client_secret=${this.secretKey}`;
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`授权失败: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.access_token) {
        throw new Error('获取授权失败: 响应中没有access_token');
      }
      
      this.accessToken = data.access_token as string;
      
      // token有效期通常是30天，我们保守设为29天
      const expireSeconds = data.expires_in || (30 * 24 * 60 * 60);
      this.tokenExpireTime = now + (expireSeconds - 86400) * 1000;
      
      return this.accessToken;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`[${this.name}] 获取授权失败: ${e.message}`);
      }
      throw e;
    }
  }

  /**
   * 生成文本内容
   */
  public async generateText(params: TextGenerationParams): Promise<TextGenerationResponse> {
    const model = params.model || this.model;
    
    // 准备对话消息
    const messages: ChatMessage[] = [
      { role: 'user', content: params.prompt }
    ];
    
    // 添加系统指令
    if (params.systemMessage) {
      messages.unshift({ role: 'system', content: params.systemMessage });
    }
    
    // 使用对话接口处理
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
   * 聊天对话功能
   */
  public async chatCompletion(params: ChatCompletionParams): Promise<TextGenerationResponse> {
    const model = params.model || this.model;
    const accessToken = await this.getAccessToken();
    
    // 准备请求数据
    const requestBody: Record<string, any> = {
      messages: this.convertMessagesToErnieFormat(params.messages),
      temperature: params.temperature ?? 0.7,
      top_p: params.topP ?? 0.9
    };
    
    // 根据模型不同添加特定参数
    if (params.maxTokens) {
      requestBody.max_output_tokens = params.maxTokens;
    }
    
    // 清理未设置的选项
    Object.keys(requestBody).forEach(key => {
      if (requestBody[key] === undefined) {
        delete requestBody[key];
      }
    });
    
    // 组装完整API地址
    const apiUrl = `${this.baseUrl}/chat/${this.getErnieModelPath(model)}?access_token=${accessToken}`;
    
    // 发送请求并处理结果
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 检查API错误
      if (data.error_code) {
        throw new Error(`文心一言API错误: ${data.error_msg} (代码: ${data.error_code})`);
      }
      
      // 返回统一格式的响应
      return {
        text: data.result || '',
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
   * 转换消息格式为文心一言API格式
   */
  private convertMessagesToErnieFormat(messages: ChatMessage[]): any[] {
    return messages.map(msg => {
      // 文心一言API使用与OpenAI兼容的角色名称
      return {
        role: msg.role,
        content: msg.content
      };
    });
  }
  
  /**
   * 获取文心一言API的模型路径
   */
  private getErnieModelPath(modelName: string): string {
    switch (modelName) {
      case ErnieModel.ERNIE_BOT:
        return 'completions';
      case ErnieModel.ERNIE_BOT_TURBO:
        return 'ernie-bot-turbo';
      case ErnieModel.ERNIE_BOT_4:
        return 'ernie-bot-4';
      case ErnieModel.ERNIE_SPEED_8K:
        return 'ernie-speed-8k';  
      case ErnieModel.ERNIE_SPEED_128K:
        return 'ernie-speed-128k';
      case ErnieModel.ERNIE_4_0_8K:
        return 'ernie-4.0-8k';
      case ErnieModel.ERNIE_4_0_8K_PREVIEW:
        return 'ernie-4.0-8k-preview';
      case ErnieModel.ERNIE_3_5_8K:
        return 'ernie-3.5-8k';
      case ErnieModel.ERNIE_3_5_8K_PREVIEW:
        return 'ernie-3.5-8k-preview';
      case ErnieModel.ERNIE_LITE_8K:
        return 'ernie-lite-8k';
      case ErnieModel.ERNIE_TINY_8K:
        return 'ernie-tiny-8k';
      case ErnieModel.ERNIE_CHARACTER_8K:
        return 'ernie-character-8k';
      case ErnieModel.ERNIE_SPEED_APP_BUILDER:
        return 'ernie-speed-appbuilder';
      default:
        return 'completions';  // 默认使用ERNIE-Bot
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