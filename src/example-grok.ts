/**
 * Grok (xAI) API使用示例
 * 展示如何使用Grok的各项功能
 */

import { Grok } from './index';
import { GrokOptions } from './providers/grok';

// 请将你的API密钥替换为实际值
// 推荐使用环境变量存储API密钥
const GROK_API_KEY = process.env.GROK_API_KEY || 'your-grok-api-key';

async function main() {
  console.log('===== Grok (xAI) API使用示例 =====');
  
  // 创建Grok实例
  const grok = new Grok({
    apiKey: GROK_API_KEY,
    model: 'grok-3-beta',  // 默认使用最新模型
  } as GrokOptions);
  
  // 1. 基本文本生成
  console.log('\n1. 基本文本生成');
  try {
    const result = await grok.generateText({
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
    const chatResult = await grok.chatCompletion({
      model: 'grok-3-beta',
      messages: [
        { role: 'system', content: '你是一位细心的助手，能够提供有用的建议。' },
        { role: 'user', content: '你好，请介绍一下自己' },
        { role: 'assistant', content: '你好！我是Grok，一个由xAI开发的AI助手。我旨在提供有用、准确和易懂的回答。有什么我可以帮助你的吗？' },
        { role: 'user', content: '你能帮我列出学习编程的三个建议吗？' }
      ],
      temperature: 0.8,
      maxTokens: 250
    });
    
    console.log('Grok回答:');
    console.log(chatResult.text);
    console.log('\nToken使用:', chatResult.usage);
  } catch (error: any) {
    console.error('聊天完成错误:', error.message);
  }
  
  // 3. JSON格式生成
  console.log('\n3. JSON格式生成');
  try {
    const jsonResult = await grok.generateJSON({
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
    
    const stream = await grok.createStreamingChatCompletion({
      model: 'grok-3-beta',
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
  
  // 5. 使用高级参数
  console.log('\n5. 使用高级参数示例');
  try {
    const advancedResult = await grok.chatCompletion({
      model: 'grok-3-beta',
      messages: [
        { role: 'system', content: '你是一位专业的写作助手。' },
        { role: 'user', content: '请写一个简短的餐厅评论。' }
      ],
      maxTokens: 200,
      temperature: 0.7,
      topP: 0.95,
      presencePenalty: 0.5,
      frequencyPenalty: 0.5,
      stop: ['结束', '###']
    });
    
    console.log('高级参数结果:');
    console.log(advancedResult.text);
  } catch (error: any) {
    console.error('高级参数示例错误:', error.message);
  }
  
  // 6. 使用grok-2模型
  console.log('\n6. 使用grok-2模型（经济版本）');
  try {
    const grok2Result = await grok.generateText({
      prompt: '简要介绍什么是人工智能',
      model: 'grok-2',
      maxTokens: 100,
      temperature: 0.7
    });
    
    console.log('Grok 2回答:');
    console.log(grok2Result.text);
  } catch (error: any) {
    console.error('Grok 2错误:', error.message);
  }
}

// 检查API密钥是否已设置
if (GROK_API_KEY === 'your-grok-api-key') {
  console.log('请设置你的Grok API密钥后再运行此示例。');
  console.log('可以通过环境变量设置: export GROK_API_KEY="你的密钥"');
  console.log('您可以在 https://x.ai/ 的API页面获取密钥。');
} else {
  // 运行示例
  main().catch(console.error);
} 