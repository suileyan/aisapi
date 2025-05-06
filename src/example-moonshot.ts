/**
 * Moonshot AI (Kimi) 使用示例
 * 
 * 在运行此示例前，请确保设置环境变量:
 * MOONSHOT_API_KEY=your_api_key
 * 
 * 或在代码中直接提供API密钥（不推荐生产环境使用）
 */

import { MoonshotProvider } from './providers/moonshot';

async function main() {
  // 创建Moonshot AI提供商实例
  const provider = new MoonshotProvider({
    apiKey: process.env.MOONSHOT_API_KEY,
    model: 'moonshot-v1-8k' // 可选: moonshot-v1-8k, moonshot-v1-32k, moonshot-v1-128k
  });

  try {
    // 示例1: 简单文本生成
    console.log('=== 示例1: 简单文本生成 ===');
    const response1 = await provider.generateText({
      prompt: '介绍一下中国的传统节日',
      maxTokens: 300
    });
    console.log(response1.text);
    console.log('Token使用情况:', response1.usage);
    console.log('\n');

    // 示例2: 带系统消息的聊天
    console.log('=== 示例2: 带系统消息的聊天 ===');
    const response2 = await provider.generateText({
      systemMessage: '你是一位中国历史专家，了解各个朝代的历史细节。请用简洁的语言回答问题。',
      prompt: '简要介绍宋朝的科技发展',
      temperature: 0.7,
      maxTokens: 500
    });
    console.log(response2.text);
    console.log('\n');

    // 示例3: 生成JSON格式的内容
    console.log('=== 示例3: 生成JSON格式内容 ===');
    const response3 = await provider.generateJSON({
      prompt: '生成一个包含5种中国传统小吃的列表，包括名称、发源地和主要食材',
      temperature: 0.2
    });
    console.log(JSON.stringify(response3, null, 2));
    console.log('\n');

  } catch (error) {
    console.error('发生错误:', error);
  }
}

// 执行主函数
main().catch(console.error); 