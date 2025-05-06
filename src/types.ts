/**
 * AisAPI 类型定义
 */

/**
 * API返回的基础格式
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 分页数据结构
 */
export interface PaginatedData<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 分页查询参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 所有AI服务的基础配置
 */
export interface ProviderOptions {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  [key: string]: any;
}

/**
 * 文本生成参数
 */
export interface TextGenerationParams {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: boolean;
  systemMessage?: string; // 系统提示，用来设定AI的角色和行为
  model?: string; // 使用的模型，不填则用默认的
  [key: string]: any;
}

/**
 * 文本生成结果
 */
export interface TextGenerationResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cacheInfo?: {
    hitTokens?: number;
    missTokens?: number;
    hitRate?: number;
    estimatedSavings?: number;
  };
  rawResponse?: any; // 原始返回数据
  [key: string]: any;
}

/**
 * 图像生成参数
 */
export interface ImageGenerationParams {
  prompt: string;
  n?: number;
  size?: string;
  model?: string;
  responseFormat?: string;
  user?: string;
  [key: string]: any;
}

/**
 * 图像生成结果
 */
export interface ImageGenerationResponse {
  urls: string[];
  rawResponse?: any; // 原始返回数据
  [key: string]: any;
}

/**
 * 所有AI服务需要实现的功能接口
 */
export interface AiProvider {
  /** 服务名称 */
  readonly name: string;
  
  /** 文本生成（核心功能） */
  generateText(params: TextGenerationParams): Promise<TextGenerationResponse>;
  
  /** 图像生成（可选功能） */
  generateImage?(params: ImageGenerationParams): Promise<ImageGenerationResponse>;
  
  /** JSON格式输出（可选功能） */
  generateJSON?(params: TextGenerationParams): Promise<any>;
  
  /** 图像变体（可选功能） */
  createImageVariation?(params: ImageVariationParams): Promise<ImageGenerationResponse>;
  
  /** 图像编辑（可选功能） */
  editImage?(params: ImageEditParams): Promise<ImageGenerationResponse>;
  
  /** 语音转文字（可选功能） */
  transcribeAudio?(params: AudioTranscriptionParams): Promise<AudioTranscriptionResponse>;
  
  /** 文字转语音（可选功能） */
  textToSpeech?(params: TextToSpeechParams): Promise<TextToSpeechResponse>;
  
  /** 文本向量（可选功能） */
  createEmbedding?(params: EmbeddingParams): Promise<EmbeddingResponse>;
  
  /** 获取模型列表（可选功能） */
  listModels?(): Promise<ModelsResponse | any>;
  
  /** 流式对话（可选功能） */
  createStreamingChatCompletion?(params: ChatCompletionParams): Promise<ReadableStream<any>>;
}

/**
 * OpenAI相关类型定义
 */

// 聊天消息格式
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function' | 'tool';
  content: string | null;
  name?: string;
  function_call?: any;
  tool_calls?: any[];
}

// 聊天参数
export interface ChatCompletionParams {
  model: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  n?: number;
  stream?: boolean;
  stop?: string | string[];
  presencePenalty?: number;
  frequencyPenalty?: number;
  logitBias?: Record<string, number>;
  user?: string;
  responseFormat?: { type: 'text' | 'json_object' };
  [key: string]: any;
}

// 聊天结果
export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finishReason: string;
  }[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// 语音转文字参数
export interface AudioTranscriptionParams {
  file: any; // 音频文件
  model: string;
  language?: string;
  prompt?: string;
  responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
}

// 语音转文字结果
export interface AudioTranscriptionResponse {
  text: string;
  rawResponse?: any;
  [key: string]: any;
}

// 文字转语音参数
export interface TextToSpeechParams {
  input: string;
  model: string;
  voice: string;
  responseFormat?: string;
  speed?: number;
}

// 文字转语音结果
export interface TextToSpeechResponse {
  audioData: ArrayBuffer;
  format: string;
}

// 文本向量参数
export interface EmbeddingParams {
  model: string;
  input: string | string[];
  user?: string;
}

// 文本向量结果
export interface EmbeddingResponse {
  data: {
    embedding: number[];
    index: number;
    object: string;
  }[];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

/**
 * 图像编辑参数
 */
export interface ImageEditParams {
  image: any; // 图像文件
  mask?: any; // 可选的蒙版
  prompt: string;
  n?: number;
  size?: string;
  model?: string;
  user?: string;
}

/**
 * 图像变体参数
 */
export interface ImageVariationParams {
  image: any; // 图像文件
  n?: number;
  size?: string;
  model?: string;
  user?: string;
}

/**
 * 模型信息
 */
export interface ModelInfo {
  id: string;
  object: string;
  created: number;
  ownedBy: string;
  permission: any[];
  root: string;
  parent: string | null;
}

/**
 * 模型列表结果
 */
export interface ModelsResponse {
  object: string;
  data: ModelInfo[];
} 