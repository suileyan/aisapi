/**
 * 讯飞星火大模型使用示例
 * 
 * 在运行此示例前，请确保设置环境变量:
 * SPARK_API_KEY=your_api_key
 * SPARK_APP_ID=your_app_id
 * SPARK_API_SECRET=your_secret_key
 * 
 * 或在代码中直接提供（不推荐生产环境使用）
 */

import { SparkProvider, SparkModel } from './providers/spark';

async function main() {
  // 创建讯飞星火提供商实例
  const provider = new SparkProvider({
    apiKey: process.env.SPARK_API_KEY,
    appId: process.env.SPARK_APP_ID,
    apiSecret: process.env.SPARK_API_SECRET,
    model: SparkModel.PRO // 使用专业版模型
  });

  try {
    // 示例1: 简单文本生成
    console.log('=== 示例1: 简单文本生成 ===');
    const response1 = await provider.generateText({
      prompt: '讯飞星火大模型的主要优势有哪些？',
      maxTokens: 300
    });
    console.log(response1.text);
    console.log('Token使用情况:', response1.usage);
    console.log('\n');

    // 示例2: 带系统消息的聊天
    console.log('=== 示例2: 带系统消息的聊天 ===');
    const response2 = await provider.generateText({
      systemMessage: '你是一位人工智能领域专家，精通自然语言处理技术。请用专业且易懂的语言回答问题。',
      prompt: '解释一下Transformer架构的工作原理和优势',
      temperature: 0.6,
      maxTokens: 500
    });
    console.log(response2.text);
    console.log('\n');

    // 示例3: 使用长文本模型
    console.log('=== 示例3: 使用长文本模型 ===');
    const longTextProvider = new SparkProvider({
      apiKey: process.env.SPARK_API_KEY,
      appId: process.env.SPARK_APP_ID,
      apiSecret: process.env.SPARK_API_SECRET,
      model: SparkModel.PRO_128K // 使用128k长文本模型
    });
    
    const response3 = await longTextProvider.generateText({
      prompt: '如何实现一个基于知识图谱的智能问答系统？请详细说明技术架构和实现步骤。',
      maxTokens: 1000,
      temperature: 0.4
    });
    console.log(response3.text);
    console.log('\n');

    // 示例4: 生成JSON格式的内容
    console.log('=== 示例4: 生成JSON格式内容 ===');
    const response4 = await provider.generateJSON({
      prompt: '生成一个包含5种常见的人工智能应用场景的列表，包括应用名称、应用领域和主要技术',
      temperature: 0.2
    });
    console.log(JSON.stringify(response4, null, 2));
    console.log('\n');

  } catch (error) {
    console.error('发生错误:', error);
  }
}

// 执行主函数
main().catch(console.error); 