/**
 * 智谱AI (ChatGLM) 使用示例
 * 
 * 在运行此示例前，请确保设置环境变量:
 * ZHIPU_API_KEY=your_api_key
 * 
 * 或在代码中直接提供API密钥（不推荐生产环境使用）
 */

import { ZhipuProvider, ZhipuModel } from './providers/zhipu';

async function main() {
  // 创建智谱AI提供商实例
  const provider = new ZhipuProvider({
    apiKey: process.env.ZHIPU_API_KEY,
    model: ZhipuModel.GLM_3_TURBO // 使用GLM-3-Turbo模型
  });

  try {
    // 示例1: 简单文本生成
    console.log('=== 示例1: 简单文本生成 ===');
    const response1 = await provider.generateText({
      prompt: '介绍一下ChatGLM模型的特点和优势',
      maxTokens: 300
    });
    console.log(response1.text);
    console.log('Token使用情况:', response1.usage);
    console.log('\n');

    // 示例2: 带系统消息的聊天
    console.log('=== 示例2: 带系统消息的聊天 ===');
    const response2 = await provider.generateText({
      systemMessage: '你是一位计算机科学领域专家，精通机器学习和深度学习技术。请用专业且易懂的语言回答问题。',
      prompt: '解释一下大语言模型（LLM）的自监督学习方法和优缺点',
      temperature: 0.6,
      maxTokens: 500
    });
    console.log(response2.text);
    console.log('\n');

    // 示例3: 使用高级GLM-4模型
    console.log('=== 示例3: 使用GLM-4模型 ===');
    const glm4Provider = new ZhipuProvider({
      apiKey: process.env.ZHIPU_API_KEY,
      model: ZhipuModel.GLM_4 // 使用GLM-4模型
    });
    
    const response3 = await glm4Provider.generateText({
      prompt: '如何构建一个可靠的大型语言模型评估体系？请考虑多方面的指标和实现方法。',
      maxTokens: 1000,
      temperature: 0.4
    });
    console.log(response3.text);
    console.log('\n');

    // 示例4: 生成JSON格式的内容
    console.log('=== 示例4: 生成JSON格式内容 ===');
    const response4 = await provider.generateJSON({
      prompt: '生成一个包含5种常见的深度学习模型架构的列表，包括模型名称、发布年份、主要应用场景和核心创新点',
      temperature: 0.2
    });
    console.log(JSON.stringify(response4, null, 2));
    console.log('\n');

    // 示例5: 流式响应示例
    console.log('=== 示例5: 流式响应（打印事件ID） ===');
    const stream = await provider.createStreamingChatCompletion({
      model: ZhipuModel.GLM_3_TURBO,
      messages: [
        { role: 'user', content: '简要介绍中国的AI发展历程' }
      ],
      maxTokens: 300
    });
    
    console.log('开始接收流式响应...');
    const reader = stream.getReader();
    let result = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // 这里只是简单示例，实际应用中需要根据API响应格式解析
      const chunk = new TextDecoder().decode(value);
      console.log('收到数据块:', chunk.substring(0, 50) + '...');
      result += chunk;
    }
    
    console.log('流式响应完成');
    console.log('\n');

  } catch (error) {
    console.error('发生错误:', error);
  }
}

// 执行主函数
main().catch(console.error); 