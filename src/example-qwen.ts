/**
 * 阿里巴巴千问(Qwen)API使用示例
 * 
 * 此示例展示如何使用阿里巴巴千问API进行文本生成、聊天和JSON生成。
 * 
 * 运行此示例前，请确保设置环境变量:
 * QWEN_API_KEY=your_qwen_api_key
 */

import { QwenProvider, QwenModel, QwenApiMode } from './providers/qwen';

async function main() {
  // 创建千问API提供商实例
  const qwen = new QwenProvider({
    apiKey: process.env.QWEN_API_KEY,
    model: QwenModel.TURBO  // 默认使用qwen-turbo模型
  });

  try {
    // 示例1: 基本文本生成
    console.log('=== 基本文本生成 ===');
    const response1 = await qwen.generateText({
      prompt: '简要介绍一下阿里巴巴千问AI大模型的特点和应用场景',
      maxTokens: 300,
      temperature: 0.7
    });
    console.log(response1.text);
    console.log('\n');
    
    // 示例2: 使用系统消息设置角色
    console.log('=== 带系统消息的文本生成 ===');
    const response2 = await qwen.generateText({
      prompt: '中国传统节日有哪些？请简要介绍',
      systemMessage: '你是一位中国文化专家，请用生动的语言介绍中国文化，使用简体中文回答。',
      maxTokens: 300,
      temperature: 0.7
    });
    console.log(response2.text);
    console.log('\n');
    
    // 示例3: 聊天对话
    console.log('=== 聊天对话 ===');
    const chatResponse = await qwen.chatCompletion({
      model: QwenModel.PLUS,  // 使用更强大的qwen-plus模型
      messages: [
        { role: 'system', content: '你是阿里巴巴千问AI助手，请提供专业、准确的信息。' },
        { role: 'user', content: '什么是向量数据库？它和传统数据库有什么区别？' },
        { role: 'assistant', content: '向量数据库是专门设计用来存储和检索向量embeddings的数据库系统。' },
        { role: 'user', content: '它们在AI应用中有什么具体用途？' }
      ],
      temperature: 0.5
    });
    console.log(chatResponse.text);
    console.log('\n');
    
    // 示例4: 切换API模式
    console.log('=== 切换到DashScope原生API模式 ===');
    qwen.setApiMode(QwenApiMode.DASH_SCOPE);
    
    const response3 = await qwen.generateText({
      prompt: '写一首关于人工智能的现代诗',
      maxTokens: 200,
      temperature: 0.8
    });
    console.log(response3.text);
    console.log('\n');
    
    // 示例5: 生成JSON格式响应
    console.log('=== 生成JSON格式响应 ===');
    
    // 切换回OpenAI兼容模式
    qwen.setApiMode(QwenApiMode.OPENAI_COMPATIBLE);
    
    const jsonResponse = await qwen.generateJSON({
      prompt: '列出中国五大科技公司及其主要业务领域，以JSON格式返回，格式为数组对象，每个对象包含name和business_areas字段',
      temperature: 0.2,
      model: QwenModel.MAX  // 使用最强大的模型
    });
    console.log(JSON.stringify(jsonResponse, null, 2));
    console.log('\n');

    // 示例6: 使用流式输出
    console.log('=== 流式输出示例 ===');
    console.log('开始流式生成...\n');
    
    const stream = await qwen.createStreamingChatCompletion({
      messages: [
        { role: 'user', content: '写一篇简短的科幻小说，主题是"AI与人类的共存"' }
      ],
      model: QwenModel.TURBO,
      temperature: 0.7,
      maxTokens: 500
    });
    
    // 注意: 下面的代码在浏览器环境中可能需要调整
    const reader = stream.getReader();
    let streamOutput = '';
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      try {
        // 处理流式响应
        const chunk = new TextDecoder().decode(value);
        process.stdout.write(chunk);
        streamOutput += chunk;
      } catch (e) {
        console.error('解析流响应错误:', e);
      }
    }
    
    console.log('\n\n流式输出完成\n');

  } catch (error) {
    console.error('发生错误:', error);
  }
}

// 执行主函数
main().catch(console.error); 