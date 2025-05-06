/**
 * AisAPI 统一接口使用示例
 * 
 * 本示例展示如何使用AisAPI统一接口在不同提供商之间切换
 * 而无需更改应用代码结构
 */

import { AisAPI } from './index';
import { TextGenerationParams } from './types';

// 请将API密钥替换为实际值
// 推荐使用环境变量存储API密钥
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-openai-api-key';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'your-anthropic-api-key';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'your-gemini-api-key';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'your-deepseek-api-key';

async function main() {
  console.log('===== AisAPI 统一接口使用示例 =====');
  
  // 创建AisAPI实例，配置多个AI提供商
  const aisapi = new AisAPI({
    // 配置OpenAI (GPT)
    openai: {
      apiKey: OPENAI_API_KEY,
      model: 'gpt-3.5-turbo'
    },
    
    // 配置Anthropic (Claude)
    anthropic: {
      apiKey: ANTHROPIC_API_KEY,
      model: 'claude-3-haiku-20240307'
    },
    
    // 配置Google (Gemini)
    gemini: {
      apiKey: GEMINI_API_KEY,
      model: 'gemini-pro'
    },
    
    // 配置DeepSeek
    deepseek: {
      apiKey: DEEPSEEK_API_KEY,
      model: 'deepseek-chat',
      enableCacheMonitoring: true
    },
    
    // 设置默认提供商
    defaultProvider: 'openai'
  });
  
  // 获取可用的提供商列表
  const providers = aisapi.getProviders();
  console.log('可用的AI提供商:', providers);
  console.log('默认提供商:', aisapi.getDefaultProvider()?.name);
  
  // 定义相同的提示，用于所有提供商
  const prompt = '简要解释量子纠缠的概念';
  const params: TextGenerationParams = {
    prompt,
    maxTokens: 150,
    temperature: 0.7,
    systemMessage: '你是一个擅长解释复杂科学概念的助手。请用简洁清晰的语言回答。'
  };
  
  // 1. 使用默认提供商生成文本
  console.log('\n1. 使用默认提供商 (OpenAI) 生成文本:');
  try {
    const defaultResult = await aisapi.generateText(params);
    console.log(`${aisapi.getDefaultProvider()?.name} 回答:`, defaultResult.text);
    console.log('Token使用:', defaultResult.usage);
  } catch (error: any) {
    console.error('默认提供商错误:', error.message);
  }
  
  // 2. 在不同提供商之间切换
  for (const provider of providers) {
    if (
      (provider === 'openai' && OPENAI_API_KEY === 'your-openai-api-key') ||
      (provider === 'anthropic' && ANTHROPIC_API_KEY === 'your-anthropic-api-key') ||
      (provider === 'gemini' && GEMINI_API_KEY === 'your-gemini-api-key') ||
      (provider === 'deepseek' && DEEPSEEK_API_KEY === 'your-deepseek-api-key')
    ) {
      console.log(`\n跳过 ${provider} (未提供API密钥)`);
      continue;
    }
    
    console.log(`\n2.${providers.indexOf(provider) + 1}. 使用 ${provider} 生成文本:`);
    try {
      const result = await aisapi.generateText(params, provider);
      console.log(`${provider} 回答:`, result.text);
      
      // 展示提供商特定的信息
      if (provider === 'deepseek' && result.cacheInfo) {
        console.log('DeepSeek缓存信息:');
        console.log(`- 缓存命中率: ${(result.cacheInfo.hitRate || 0) * 100}%`);
      }
    } catch (error: any) {
      console.error(`${provider} 错误:`, error.message);
    }
  }
  
  // 3. 改变默认提供商
  console.log('\n3. 改变默认提供商:');
  if (providers.includes('anthropic') && ANTHROPIC_API_KEY !== 'your-anthropic-api-key') {
    aisapi.setDefaultProvider('anthropic');
    console.log('已将默认提供商更改为:', aisapi.getDefaultProvider()?.name);
    
    try {
      const claudeResult = await aisapi.generateText(params);
      console.log('Claude回答:', claudeResult.text);
    } catch (error: any) {
      console.error('Claude错误:', error.message);
    }
  } else {
    console.log('未配置Anthropic或API密钥未提供，跳过此步骤');
  }
  
  // 4. 使用特定提供商的特殊功能
  console.log('\n4. 使用特定提供商的特殊功能:');
  
  // 4.1 OpenAI图像生成
  if (providers.includes('openai') && OPENAI_API_KEY !== 'your-openai-api-key') {
    console.log('4.1. 使用OpenAI生成图像:');
    try {
      const imageResult = await aisapi.generateImage({
        prompt: '一只可爱的红色机器人在花园中',
        n: 1,
        size: '512x512',
        model: 'dall-e-2'  // 使用较便宜的模型作为示例
      }, 'openai');
      
      console.log('生成的图像URL:', imageResult.urls[0]);
    } catch (error: any) {
      console.error('图像生成错误:', error.message);
    }
  } else {
    console.log('未配置OpenAI或API密钥未提供，跳过图像生成示例');
  }
  
  // 4.2 DeepSeek链式推理
  if (providers.includes('deepseek') && DEEPSEEK_API_KEY !== 'your-deepseek-api-key') {
    console.log('\n4.2. 使用DeepSeek进行链式推理:');
    try {
      const cotResult = await aisapi.chainOfThought({
        prompt: '解决这个数学问题：小明今年8岁，他的姐姐比他大6岁，那么20年后，姐姐的年龄是小明年龄的多少倍？',
        temperature: 0.3,
        maxTokens: 300
      });
      
      console.log('链式推理结果:', cotResult.text);
    } catch (error: any) {
      console.error('链式推理错误:', error.message);
    }
  } else {
    console.log('未配置DeepSeek或API密钥未提供，跳过链式推理示例');
  }
  
  // 5. 生成JSON格式数据
  console.log('\n5. 生成JSON格式数据:');
  if (aisapi.getDefaultProvider() && aisapi.getDefaultProvider()?.generateJSON) {
    try {
      const jsonResult = await aisapi.generateJSON({
        prompt: '创建一个包含三本书的列表，每本书包含标题、作者和发布年份',
        temperature: 0.7
      });
      
      console.log('JSON结果:');
      console.log(JSON.stringify(jsonResult.data, null, 2));
    } catch (error: any) {
      console.error('JSON生成错误:', error.message);
    }
  } else {
    console.log('当前默认提供商不支持JSON生成或未配置提供商');
  }
  
  // 6. 运行时添加新提供商
  console.log('\n6. 运行时添加新提供商:');
  if (DEEPSEEK_API_KEY !== 'your-deepseek-api-key' && !aisapi.getProvider('custom-deepseek')) {
    // 从直接导入的DeepSeek类创建实例
    const { DeepSeek } = require('./index');
    const customDeepseek = new DeepSeek({
      apiKey: DEEPSEEK_API_KEY,
      model: 'deepseek-reasoner'  // 专门用于复杂推理的模型
    });
    
    // 将新创建的提供商添加到AisAPI
    aisapi.addProvider('custom-deepseek', customDeepseek);
    console.log('已添加自定义DeepSeek提供商');
    
    try {
      const customResult = await aisapi.generateText({
        prompt: '解释一下爱因斯坦的相对论如何改变了物理学',
        maxTokens: 200
      }, 'custom-deepseek');
      
      console.log('自定义DeepSeek回答:', customResult.text);
    } catch (error: any) {
      console.error('自定义提供商错误:', error.message);
    }
  } else {
    console.log('未提供DeepSeek API密钥或已存在自定义提供商，跳过此步骤');
  }
}

// 检查是否至少有一个API密钥
if (
  OPENAI_API_KEY === 'your-openai-api-key' && 
  ANTHROPIC_API_KEY === 'your-anthropic-api-key' && 
  GEMINI_API_KEY === 'your-gemini-api-key' && 
  DEEPSEEK_API_KEY === 'your-deepseek-api-key'
) {
  console.log('请至少设置一个AI提供商的API密钥后再运行此示例。');
  console.log('可以通过环境变量设置，例如: export OPENAI_API_KEY="你的密钥"');
} else {
  // 运行示例
  main().catch(console.error);
} 