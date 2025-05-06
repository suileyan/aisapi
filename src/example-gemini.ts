/**
 * Google Gemini API使用示例
 * 展示如何使用Gemini的各项功能
 */

import { Gemini } from './index';
import { GeminiOptions } from './providers/gemini';

// 请将你的API密钥替换为实际值
// 推荐使用环境变量存储API密钥
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'your-gemini-api-key';

async function main() {
  console.log('===== Google Gemini API使用示例 =====');
  
  // 创建Gemini实例
  const gemini = new Gemini({
    apiKey: GEMINI_API_KEY,
    model: 'gemini-2.0-flash-001',  // 默认使用Gemini 2.0 Flash模型
    apiVersion: 'v1' // 使用v1 API
  } as GeminiOptions);
  
  // 1. 基本文本生成
  console.log('\n1. 基本文本生成');
  try {
    const result = await gemini.generateText({
      prompt: '请用简短的语言解释什么是量子计算',
      maxTokens: 200,
      temperature: 0.7,
      systemMessage: '你是一位科学专家，请简明扼要地回答问题。'
    });
    
    console.log('回答:', result.text);
    console.log('Token使用:', result.usage);
  } catch (error: any) {
    console.error('文本生成错误:', error.message);
  }
  
  // 2. 聊天完成示例
  console.log('\n2. 多轮对话示例');
  try {
    const chatResult = await gemini.chatCompletion({
      model: 'gemini-2.0-flash-001',
      messages: [
        { role: 'system', content: '你是一位细心的助手，能够提供有用的建议。' },
        { role: 'user', content: '你好，请介绍一下自己' },
        { role: 'assistant', content: '你好！我是Gemini，由Google开发的AI助手。我能够回答问题、提供信息、帮助创作内容等。有什么我可以帮助你的吗？' },
        { role: 'user', content: '你能帮我列出学习编程的三个建议吗？' }
      ],
      temperature: 0.8,
      maxTokens: 250
    });
    
    console.log('Gemini回答:');
    console.log(chatResult.text);
    console.log('\nToken使用:', chatResult.usage);
  } catch (error: any) {
    console.error('聊天完成错误:', error.message);
  }
  
  // 3. JSON格式生成
  console.log('\n3. JSON格式生成');
  try {
    const jsonResult = await gemini.generateJSON({
      prompt: '请给我三个流行的编程语言，包含名称、主要用途和创建年份',
      temperature: 0.5
    });
    
    console.log('JSON结果:');
    console.log(JSON.stringify(jsonResult.data, null, 2));
  } catch (error: any) {
    console.error('JSON生成错误:', error.message);
  }
  
  // 4. 流式输出示例（此示例仅展示概念，实际使用需要处理流式数据）
  console.log('\n4. 流式输出示例');
  try {
    console.log('开始流式输出（此处仅展示请求结构，未处理流式数据）:');
    
    const stream = await gemini.createStreamingChatCompletion({
      model: 'gemini-2.0-flash-001',
      messages: [
        { role: 'system', content: '你是一位创意作家。' },
        { role: 'user', content: '写一个简短的科幻故事开头' }
      ],
      maxTokens: 150,
      temperature: 0.9
    });
    
    console.log('流已创建，在实际应用中，您需要处理来自ReadableStream的数据块');
    console.log('示例处理代码:');
    console.log(`
    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // 处理流式数据块
      const decoder = new TextDecoder();
      const chunk = decoder.decode(value);
      // 解析并显示增量文本
    }
    `);
  } catch (error: any) {
    console.error('流式输出错误:', error.message);
  }
  
  // 5. 使用不同模型
  console.log('\n5. 使用不同模型示例');
  try {
    console.log('Gemini提供多种模型选择:');
    console.log('- gemini-2.0-flash-001: 轻量级模型，适合简单任务，响应快速');
    console.log('- gemini-2.0-pro-001: 高性能模型，适合复杂推理和多模态任务');
    console.log('- gemini-1.5-flash: 平衡性能和成本的模型');
    console.log('- gemini-1.5-pro: 支持超长上下文的高级模型');
    
    const proResult = await gemini.generateText({
      prompt: '简要介绍人工智能对社会的影响',
      model: 'gemini-2.0-pro-001',
      maxTokens: 100,
      temperature: 0.7
    });
    
    console.log('\nGemini Pro回答:');
    console.log(proResult.text);
  } catch (error: any) {
    console.error('使用不同模型错误:', error.message);
  }
  
  // 6. 使用高级参数
  console.log('\n6. 使用高级参数示例');
  try {
    const advancedResult = await gemini.chatCompletion({
      model: 'gemini-2.0-flash-001',
      messages: [
        { role: 'system', content: '你是一位专业的写作助手。' },
        { role: 'user', content: '请写一个简短的餐厅评论。' }
      ],
      maxTokens: 200,
      temperature: 0.7,
      topP: 0.95
    });
    
    console.log('高级参数结果:');
    console.log(advancedResult.text);
  } catch (error: any) {
    console.error('高级参数示例错误:', error.message);
  }
  
  console.log('\n===== 示例结束 =====');
  console.log('更多关于Gemini API的信息，请访问: https://ai.google.dev/gemini-api/docs');
}

// 检查API密钥是否已设置
if (GEMINI_API_KEY === 'your-gemini-api-key') {
  console.log('请设置你的Gemini API密钥后再运行此示例。');
  console.log('可以通过环境变量设置: export GEMINI_API_KEY="你的密钥"');
  console.log('您可以在Google AI Studio获取API密钥: https://aistudio.google.com/app/apikey');
} else {
  // 运行示例
  main().catch(console.error);
} 