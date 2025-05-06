/**
 * 百度文心一言 (ERNIE) 使用示例
 * 
 * 在运行此示例前，请确保设置环境变量:
 * ERNIE_API_KEY=your_api_key (百度AK)
 * ERNIE_SECRET_KEY=your_secret_key (百度SK)
 * 
 * 或在代码中直接提供API密钥（不推荐生产环境使用）
 */

import { ErnieProvider, ErnieModel } from './providers/ernie';

async function main() {
  // 创建百度文心一言提供商实例
  const provider = new ErnieProvider({
    apiKey: process.env.ERNIE_API_KEY,
    secretKey: process.env.ERNIE_SECRET_KEY,
    model: ErnieModel.ERNIE_BOT // 使用基础模型
  });

  try {
    // 示例1: 简单文本生成
    console.log('=== 示例1: 简单文本生成 ===');
    const response1 = await provider.generateText({
      prompt: '介绍一下文心一言大模型的特点和优势',
      maxTokens: 300
    });
    console.log(response1.text);
    console.log('Token使用情况:', response1.usage);
    console.log('\n');

    // 示例2: 带系统消息的聊天
    console.log('=== 示例2: 带系统消息的聊天 ===');
    const response2 = await provider.generateText({
      systemMessage: '你是一位文学创作专家，精通中国古典文学和现代文学。请用优美的语言回答问题。',
      prompt: '以"春风"为主题，写一首现代诗',
      temperature: 0.8,
      maxTokens: 500
    });
    console.log(response2.text);
    console.log('\n');

    // 示例3: 使用高级ERNIE-4.0-8K模型
    console.log('=== 示例3: 使用ERNIE-4.0-8K模型 ===');
    const ernie4Provider = new ErnieProvider({
      apiKey: process.env.ERNIE_API_KEY,
      secretKey: process.env.ERNIE_SECRET_KEY,
      model: ErnieModel.ERNIE_4_0_8K // 使用ERNIE 4.0模型
    });
    
    const response3 = await ernie4Provider.generateText({
      prompt: '分析中国AI产业的发展现状和未来趋势，包括技术、应用和政策等方面',
      maxTokens: 1000,
      temperature: 0.4
    });
    console.log(response3.text);
    console.log('\n');

    // 示例4: 使用轻量级模型
    console.log('=== 示例4: 使用轻量级模型 ===');
    const liteProvider = new ErnieProvider({
      apiKey: process.env.ERNIE_API_KEY,
      secretKey: process.env.ERNIE_SECRET_KEY,
      model: ErnieModel.ERNIE_LITE_8K // 使用轻量级模型
    });
    
    const response4 = await liteProvider.generateText({
      prompt: '简要解释什么是量子计算',
      maxTokens: 200,
      temperature: 0.3
    });
    console.log(response4.text);
    console.log('\n');

    // 示例5: 生成JSON格式的内容
    console.log('=== 示例5: 生成JSON格式内容 ===');
    const response5 = await provider.generateJSON({
      prompt: '生成一个包含5种中国传统艺术形式的列表，包括艺术名称、起源时间、代表作品和艺术特点',
      temperature: 0.2
    });
    console.log(JSON.stringify(response5, null, 2));
    console.log('\n');
    
  } catch (error) {
    console.error('发生错误:', error);
  }
}

// 执行主函数
main().catch(console.error); 