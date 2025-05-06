/**
 * AisAPI - 多AI服务统一接口
 * 
 * 整合了多家AI大模型，让你能用同样的方式调用不同的服务。
 * 支持OpenAI、Claude、Gemini、文心一言等国内外主流大模型。
 */

// 导出所有类型定义
export * from './types';

// 导出所有AI服务提供商
export * from './providers';

// 为方便使用，下面是常用服务的简写别名
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GeminiProvider } from './providers/gemini';
import { DeepSeekProvider } from './providers/deepseek';
import { GrokProvider } from './providers/grok';
import { DoubaoProvider } from './providers/doubao';
import { MoonshotProvider } from './providers/moonshot';
import { SparkProvider } from './providers/spark';
import { ZhipuProvider } from './providers/zhipu';
import { ErnieProvider } from './providers/ernie';
import { QwenProvider } from './providers/qwen';

// 简化的别名导出，让代码写起来更简洁
export const GPT = OpenAIProvider;
export const Claude = AnthropicProvider;
export const Gemini = GeminiProvider;
export const DeepSeek = DeepSeekProvider;
export const Grok = GrokProvider;
export const Doubao = DoubaoProvider;
export const Kimi = MoonshotProvider;
export const Spark = SparkProvider;
export const GLM = ZhipuProvider;
export const Ernie = ErnieProvider;
export const Qwen = QwenProvider;

// AisAPI整合类，适合需要在多个服务间切换的场景
// 导出必要的类型
import { 
  AiProvider, 
  TextGenerationParams, 
  TextGenerationResponse,
  ImageGenerationParams,
  ImageGenerationResponse,
  ImageEditParams,
  ImageVariationParams,
  AudioTranscriptionParams,
  AudioTranscriptionResponse,
  TextToSpeechParams,
  TextToSpeechResponse,
  EmbeddingParams,
  EmbeddingResponse,
  ChatCompletionParams
} from './types';

import { OpenAIOptions } from './providers/openai';
import { AnthropicOptions } from './providers/anthropic';
import { GeminiOptions } from './providers/gemini';
import { DeepSeekOptions } from './providers/deepseek';
import { GrokOptions } from './providers/grok';
import { DoubaoOptions } from './providers/doubao';
import { MoonshotOptions } from './providers/moonshot';
import { SparkOptions } from './providers/spark';
import { ZhipuOptions } from './providers/zhipu';
import { ErnieOptions } from './providers/ernie';
import { QwenOptions } from './providers/qwen';

/**
 * AisAPI 配置参数
 */
export interface AisAPIOptions {
  openai?: OpenAIOptions;
  anthropic?: AnthropicOptions;
  gemini?: GeminiOptions;
  deepseek?: DeepSeekOptions;
  grok?: GrokOptions;
  doubao?: DoubaoOptions;
  moonshot?: MoonshotOptions;
  spark?: SparkOptions;
  zhipu?: ZhipuOptions;
  ernie?: ErnieOptions;
  qwen?: QwenOptions;
  defaultProvider?: string;
}

/**
 * AisAPI 主类 - 让你能用统一方式调用各种AI服务
 */
export class AisAPI {
  private providers: Map<string, AiProvider> = new Map();
  private defaultProviderName: string;

  /**
   * 创建新的AisAPI实例
   * @param options 各AI服务的配置
   */
  constructor(options: AisAPIOptions = {}) {
    // 初始化各服务提供商
    if (options.openai) {
      this.providers.set('openai', new OpenAIProvider(options.openai));
    }
    
    if (options.anthropic) {
      this.providers.set('anthropic', new AnthropicProvider(options.anthropic));
    }
    
    if (options.gemini) {
      this.providers.set('gemini', new GeminiProvider(options.gemini));
    }
    
    if (options.deepseek) {
      this.providers.set('deepseek', new DeepSeekProvider(options.deepseek));
    }
    
    if (options.grok) {
      this.providers.set('grok', new GrokProvider(options.grok));
    }
    
    if (options.doubao) {
      this.providers.set('doubao', new DoubaoProvider(options.doubao));
    }
    
    // 国内AI服务
    if (options.moonshot) {
      this.providers.set('moonshot', new MoonshotProvider(options.moonshot));
    }
    
    if (options.spark) {
      this.providers.set('spark', new SparkProvider(options.spark));
    }
    
    if (options.zhipu) {
      this.providers.set('zhipu', new ZhipuProvider(options.zhipu));
    }
    
    if (options.ernie) {
      this.providers.set('ernie', new ErnieProvider(options.ernie));
    }
    
    if (options.qwen) {
      this.providers.set('qwen', new QwenProvider(options.qwen));
    }
    
    // 设置默认服务，如果没有指定就按优先级自动选择
    this.defaultProviderName = options.defaultProvider || 
      (this.providers.has('openai') ? 'openai' : 
        (this.providers.has('anthropic') ? 'anthropic' : 
          (this.providers.has('gemini') ? 'gemini' : 
            (this.providers.has('deepseek') ? 'deepseek' : 
              (this.providers.has('grok') ? 'grok' : 
                (this.providers.has('doubao') ? 'doubao' : 
                  (this.providers.has('moonshot') ? 'moonshot' : 
                    (this.providers.has('spark') ? 'spark' : 
                      (this.providers.has('zhipu') ? 'zhipu' : 
                        (this.providers.has('ernie') ? 'ernie' :
                          (this.providers.has('qwen') ? 'qwen' : '')))))))))));
    
    if (this.providers.size === 0) {
      console.warn('提示: 你没有配置任何AI服务，请至少配置一个才能使用');
    }
    
    if (!this.defaultProviderName && this.providers.size > 0) {
      this.defaultProviderName = Array.from(this.providers.keys())[0];
    }
  }

  /**
   * 获取已配置的AI服务列表
   */
  public getProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * 获取指定名称的AI服务实例
   */
  public getProvider(name: string): AiProvider | undefined {
    return this.providers.get(name.toLowerCase());
  }

  /**
   * 获取默认使用的AI服务
   */
  public getDefaultProvider(): AiProvider | undefined {
    return this.defaultProviderName ? this.providers.get(this.defaultProviderName) : undefined;
  }

  /**
   * 更改默认使用的AI服务
   */
  public setDefaultProvider(name: string): boolean {
    if (this.providers.has(name.toLowerCase())) {
      this.defaultProviderName = name.toLowerCase();
      return true;
    }
    return false;
  }

  /**
   * 添加新的AI服务
   */
  public addProvider(name: string, provider: AiProvider): void {
    this.providers.set(name.toLowerCase(), provider);
    
    // 如果还没有默认服务，就用新添加的
    if (!this.defaultProviderName) {
      this.defaultProviderName = name.toLowerCase();
    }
  }

  /**
   * 用指定的AI服务生成文本
   */
  public async generateText(params: TextGenerationParams, providerName?: string): Promise<TextGenerationResponse> {
    const provider = providerName 
      ? this.providers.get(providerName.toLowerCase())
      : this.getDefaultProvider();
    
    if (!provider) {
      throw new Error(`找不到服务: ${providerName || '默认服务'}`);
    }
    
    return await provider.generateText(params);
  }

  /**
   * 用指定的AI服务生成图像
   */
  public async generateImage(params: ImageGenerationParams, providerName?: string): Promise<ImageGenerationResponse> {
    const provider = providerName 
      ? this.providers.get(providerName.toLowerCase())
      : this.getDefaultProvider();
    
    if (!provider) {
      throw new Error(`找不到服务: ${providerName || '默认服务'}`);
    }
    
    if (!provider.generateImage) {
      throw new Error(`${providerName || this.defaultProviderName} 不支持生成图片`);
    }
    
    return await provider.generateImage(params);
  }
  
  /**
   * 用指定的AI服务生成JSON格式回复
   */
  public async generateJSON(params: TextGenerationParams, providerName?: string): Promise<any> {
    const provider = providerName 
      ? this.providers.get(providerName.toLowerCase())
      : this.getDefaultProvider();
    
    if (!provider) {
      throw new Error(`找不到服务: ${providerName || '默认服务'}`);
    }
    
    if (!provider.generateJSON) {
      throw new Error(`${providerName || this.defaultProviderName} 不支持生成JSON`);
    }
    
    return await provider.generateJSON(params);
  }
  
  /**
   * 用指定的AI服务创建图片变体
   */
  public async createImageVariation(params: ImageVariationParams, providerName?: string): Promise<ImageGenerationResponse> {
    const provider = providerName 
      ? this.providers.get(providerName.toLowerCase())
      : this.getDefaultProvider();
    
    if (!provider) {
      throw new Error(`找不到服务: ${providerName || '默认服务'}`);
    }
    
    if (!provider.createImageVariation) {
      throw new Error(`${providerName || this.defaultProviderName} 不支持图片变体功能`);
    }
    
    return await provider.createImageVariation(params);
  }
  
  /**
   * 用指定的AI服务编辑图片
   */
  public async editImage(params: ImageEditParams, providerName?: string): Promise<ImageGenerationResponse> {
    const provider = providerName 
      ? this.providers.get(providerName.toLowerCase())
      : this.getDefaultProvider();
    
    if (!provider) {
      throw new Error(`找不到服务: ${providerName || '默认服务'}`);
    }
    
    if (!provider.editImage) {
      throw new Error(`${providerName || this.defaultProviderName} 不支持图片编辑`);
    }
    
    return await provider.editImage(params);
  }
  
  /**
   * 用指定的AI服务将音频转成文字
   */
  public async transcribeAudio(params: AudioTranscriptionParams, providerName?: string): Promise<AudioTranscriptionResponse> {
    const provider = providerName 
      ? this.providers.get(providerName.toLowerCase())
      : this.getDefaultProvider();
    
    if (!provider) {
      throw new Error(`找不到服务: ${providerName || '默认服务'}`);
    }
    
    if (!provider.transcribeAudio) {
      throw new Error(`${providerName || this.defaultProviderName} 不支持语音转文字`);
    }
    
    return await provider.transcribeAudio(params);
  }
  
  /**
   * 用指定的AI服务将文字转成语音
   */
  public async textToSpeech(params: TextToSpeechParams, providerName?: string): Promise<TextToSpeechResponse> {
    const provider = providerName 
      ? this.providers.get(providerName.toLowerCase())
      : this.getDefaultProvider();
    
    if (!provider) {
      throw new Error(`找不到服务: ${providerName || '默认服务'}`);
    }
    
    if (!provider.textToSpeech) {
      throw new Error(`${providerName || this.defaultProviderName} 不支持文字转语音`);
    }
    
    return await provider.textToSpeech(params);
  }
  
  /**
   * 用指定的AI服务创建文本向量
   */
  public async createEmbedding(params: EmbeddingParams, providerName?: string): Promise<EmbeddingResponse> {
    const provider = providerName 
      ? this.providers.get(providerName.toLowerCase())
      : this.getDefaultProvider();
    
    if (!provider) {
      throw new Error(`找不到服务: ${providerName || '默认服务'}`);
    }
    
    if (!provider.createEmbedding) {
      throw new Error(`${providerName || this.defaultProviderName} 不支持向量嵌入功能`);
    }
    
    return await provider.createEmbedding(params);
  }
  
  /**
   * 获取指定AI服务的可用模型列表
   */
  public async listModels(providerName?: string): Promise<any> {
    const provider = providerName 
      ? this.providers.get(providerName.toLowerCase())
      : this.getDefaultProvider();
    
    if (!provider) {
      throw new Error(`找不到服务: ${providerName || '默认服务'}`);
    }
    
    if (!provider.listModels) {
      throw new Error(`${providerName || this.defaultProviderName} 不支持获取模型列表`);
    }
    
    return await provider.listModels();
  }
  
  /**
   * 创建聊天对话（支持多轮对话的AI服务适用）
   */
  public async chatCompletion(params: ChatCompletionParams, providerName: string = 'openai'): Promise<TextGenerationResponse> {
    const provider = this.providers.get(providerName.toLowerCase());
    
    if (!provider) {
      throw new Error(`找不到服务: ${providerName}`);
    }
    
    // OpenAI直接有专用接口
    if (provider instanceof OpenAIProvider) {
      return await provider.chatCompletion(params);
    } else {
      // 其他服务尝试兼容处理
      const systemMessage = params.messages.find(m => m.role === 'system')?.content || '';
      const userMessages = params.messages.filter(m => m.role === 'user');
      const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';
      
      return await provider.generateText({
        prompt: lastUserMessage,
        systemMessage,
        temperature: params.temperature,
        maxTokens: params.maxTokens,
        topP: params.topP,
        stream: params.stream,
        model: params.model
      });
    }
  }
  
  /**
   * 创建流式对话（边生成边返回内容的方式）
   */
  public async createStreamingChatCompletion(params: ChatCompletionParams, providerName?: string): Promise<ReadableStream<any>> {
    const provider = providerName 
      ? this.providers.get(providerName.toLowerCase())
      : this.getDefaultProvider();
    
    if (!provider) {
      throw new Error(`找不到服务: ${providerName || '默认服务'}`);
    }
    
    if (!provider.createStreamingChatCompletion) {
      throw new Error(`${providerName || this.defaultProviderName} 不支持流式对话`);
    }
    
    return await provider.createStreamingChatCompletion(params);
  }
  
  /**
   * 使用DeepSeek的思维链功能
   */
  public async chainOfThought(params: TextGenerationParams): Promise<TextGenerationResponse> {
    const provider = this.providers.get('deepseek');
    
    if (!provider) {
      throw new Error('没有配置DeepSeek服务，无法使用思维链功能');
    }
    
    if (provider instanceof DeepSeekProvider) {
      return await provider.chainOfThought(params);
    } else {
      throw new Error('无法访问DeepSeek的思维链功能');
    }
  }
}

/**
 * 快速创建AisAPI实例的简便方法
 */
export default function createAisAPI(options: AisAPIOptions = {}): AisAPI {
  return new AisAPI(options);
} 