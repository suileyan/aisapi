/**
 * 中国AI大模型提供商综合示例 (更新版)
 * 
 * 此示例展示如何在同一个应用中使用多个中国AI大模型提供商，
 * 包括最新集成的阿里巴巴千问(Qwen)。
 * 
 * 运行此示例前，请确保设置环境变量:
 * MOONSHOT_API_KEY=your_moonshot_api_key
 * SPARK_API_KEY=your_spark_api_key
 * SPARK_APP_ID=your_spark_app_id
 * SPARK_API_SECRET=your_spark_secret
 * ZHIPU_API_KEY=your_zhipu_api_key
 * ERNIE_API_KEY=your_ernie_api_key
 * ERNIE_SECRET_KEY=your_ernie_secret_key
 * QWEN_API_KEY=your_qwen_api_key
 */

import { MoonshotProvider } from './providers/moonshot';
import { SparkProvider, SparkModel } from './providers/spark';
import { ZhipuProvider, ZhipuModel } from './providers/zhipu';
import { ErnieProvider, ErnieModel } from './providers/ernie';
import { QwenProvider, QwenModel } from './providers/qwen';
import { TextGenerationParams } from './types';

// 定义测试问题
const TEST_QUESTIONS = [
  '人工智能在未来十年可能对社会产生哪些影响？',
  '如何评价中国在大语言模型领域的发展和创新？',
  '请用中文和英文解释量子计算的基本原理'
];

async function main() {
  // 创建各提供商实例
  const providers = {
    'Moonshot (Kimi)': new MoonshotProvider({
      apiKey: process.env.MOONSHOT_API_KEY,
      model: 'moonshot-v1-8k'
    }),
    
    '讯飞星火': new SparkProvider({
      apiKey: process.env.SPARK_API_KEY,
      appId: process.env.SPARK_APP_ID,
      apiSecret: process.env.SPARK_API_SECRET,
      model: SparkModel.PRO
    }),
    
    '智谱AI (GLM)': new ZhipuProvider({
      apiKey: process.env.ZHIPU_API_KEY,
      model: ZhipuModel.GLM_3_TURBO
    }),
    
    '百度文心一言': new ErnieProvider({
      apiKey: process.env.ERNIE_API_KEY,
      secretKey: process.env.ERNIE_SECRET_KEY,
      model: ErnieModel.ERNIE_BOT
    }),
    
    '阿里巴巴千问': new QwenProvider({
      apiKey: process.env.QWEN_API_KEY,
      model: QwenModel.TURBO
    })
  };

  try {
    // 统一生成参数
    const params: Omit<TextGenerationParams, 'prompt'> = {
      maxTokens: 300,
      temperature: 0.7,
      systemMessage: '你是一个专业、客观、有见解的AI助手。请提供准确、有深度的回答。'
    };
    
    // 测试每个问题
    for (const question of TEST_QUESTIONS) {
      console.log(`\n====== 问题: ${question} ======\n`);
      
      // 对每个提供商获取回答
      for (const [providerName, provider] of Object.entries(providers)) {
        console.log(`--- ${providerName} 的回答 ---`);
        
        try {
          const startTime = Date.now();
          
          const response = await provider.generateText({
            ...params,
            prompt: question
          });
          
          const elapsedTime = Date.now() - startTime;
          
          console.log(response.text);
          console.log(`\n[耗时: ${elapsedTime}ms | Token使用: ${response.usage?.totalTokens || 'unknown'}]\n`);
        } catch (error) {
          console.error(`${providerName} 响应错误:`, error);
        }
      }
    }
    
    // JSON格式测试
    console.log('\n====== JSON格式响应测试 ======\n');
    console.log('各提供商回答问题: 列出中国主要的大语言模型公司及其主要产品');
    
    for (const [providerName, provider] of Object.entries(providers)) {
      console.log(`\n--- ${providerName} 的JSON响应 ---`);
      
      try {
        const response = await provider.generateJSON?.({
          prompt: '列出中国主要的大语言模型公司及其主要产品，以JSON格式返回，包括公司名称、产品名称、发布时间等信息',
          temperature: 0.2
        });
        
        console.log(JSON.stringify(response, null, 2));
      } catch (error) {
        console.error(`${providerName} JSON响应错误:`, error);
      }
    }
    
    // 模型能力比较测试
    console.log('\n====== 模型能力比较测试 ======\n');
    
    const complexQuestion = '请分析GPT-4、Claude 3和国内大模型在技术架构、性能和应用场景上的异同点，并预测未来发展趋势';
    console.log(`问题: ${complexQuestion}\n`);
    
    for (const [providerName, provider] of Object.entries(providers)) {
      console.log(`--- ${providerName} 的回答 ---`);
      
      try {
        const response = await provider.generateText({
          prompt: complexQuestion,
          maxTokens: 500,
          temperature: 0.3
        });
        
        console.log(response.text);
        console.log('\n');
      } catch (error) {
        console.error(`${providerName} 响应错误:`, error);
      }
    }
    
  } catch (error) {
    console.error('执行过程中发生错误:', error);
  }
}

// 执行主函数
main().catch(console.error); 