/**
 * 豆包(Doubao) API使用示例
 * 展示如何使用豆包API的各项功能
 */

import { Doubao } from './index';
import { DoubaoOptions } from './providers/doubao';

// 请将你的API密钥和接入点ID替换为实际值
// 推荐使用环境变量存储API密钥
const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY || 'your-doubao-api-key';
// 注意：豆包API必须使用推理接入点ID（而非模型名称）
const DOUBAO_ENDPOINT_ID = process.env.DOUBAO_ENDPOINT_ID || 'ep-xxxxxxxxxx';

async function main() {
  console.log('===== 豆包(Doubao) API使用示例 =====');
  
  // 创建豆包实例
  const doubao = new Doubao({
    apiKey: DOUBAO_API_KEY,
    // 通过火山引擎创建的推理接入点ID
    endpointId: DOUBAO_ENDPOINT_ID,
    // 可选：指定默认模型（用于记录，不影响API调用）
    model: 'Doubao-pro-32k'
  } as DoubaoOptions);
  
  // 1. 基本文本生成
  console.log('\n1. 基本文本生成');
  try {
    const result = await doubao.generateText({
      prompt: '请用简短的语言介绍一下中国传统节日',
      maxTokens: 300,
      temperature: 0.7,
      systemMessage: '用简洁有教育意义的语言回答问题'
    });
    
    console.log('回答:', result.text);
    console.log('Token使用:', result.usage);
  } catch (error: any) {
    console.error('文本生成错误:', error.message);
  }
  
  // 2. 聊天完成示例
  console.log('\n2. 多轮对话示例');
  try {
    const chatResult = await doubao.chatCompletion({
      model: DOUBAO_ENDPOINT_ID, // 必须使用接入点ID
      messages: [
        { role: 'system', content: '你是一位细心的助手，能够提供有用的建议。' },
        { role: 'user', content: '你好，请介绍一下自己' },
        { role: 'assistant', content: '你好！我是豆包(Doubao)，一个由字节跳动开发的AI助手。我可以帮助你回答问题、提供信息和进行对话。有什么我可以帮助你的吗？' },
        { role: 'user', content: '请推荐三本中国古典文学名著并简要介绍' }
      ],
      temperature: 0.8,
      maxTokens: 500
    });
    
    console.log('豆包回答:');
    console.log(chatResult.text);
    console.log('\nToken使用:', chatResult.usage);
  } catch (error: any) {
    console.error('聊天完成错误:', error.message);
  }
  
  // 3. JSON格式生成
  console.log('\n3. JSON格式生成');
  try {
    const jsonResult = await doubao.generateJSON({
      prompt: '请列出中国五大名山，包含名称、所在省份和海拔高度',
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
    
    const stream = await doubao.createStreamingChatCompletion({
      model: DOUBAO_ENDPOINT_ID,
      messages: [
        { role: 'system', content: '你是一位创意作家。' },
        { role: 'user', content: '写一个简短的关于人工智能与人类合作的故事开头' }
      ],
      maxTokens: 200,
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
    const advancedResult = await doubao.chatCompletion({
      model: DOUBAO_ENDPOINT_ID,
      messages: [
        { role: 'system', content: '你是一位专业的写作助手。' },
        { role: 'user', content: '请写一段关于人工智能伦理的短文。' }
      ],
      maxTokens: 300,
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
  
  // 6. 不同模型比较（在实际使用中需要不同的接入点ID）
  console.log('\n6. 不同模型比较示例（实际使用需要不同的接入点ID）');
  console.log('注意：此示例仅用于说明如何使用不同模型，请使用正确的接入点ID替换');
  console.log('Pro模型适合复杂任务，Lite模型适合简单任务和低成本场景');
  console.log('模型上下文窗口：4k/8k/32k表示能处理的最大token数量');
  
  console.log(`
  // 使用Pro模型（复杂任务）
  const doubaoProResult = await doubao.generateText({
    prompt: "复杂分析问题",
    model: "your-pro-endpoint-id",  // 接入点ID，非模型名称
    temperature: 0.3
  });
  
  // 使用Lite模型（简单任务）
  const doubaoLiteResult = await doubao.generateText({
    prompt: "简单问题",
    model: "your-lite-endpoint-id",  // 接入点ID，非模型名称
    temperature: 0.7
  });
  `);
}

// 检查API密钥和接入点ID是否已设置
if (DOUBAO_API_KEY === 'your-doubao-api-key' || DOUBAO_ENDPOINT_ID === 'ep-xxxxxxxxxx') {
  console.log('请设置你的豆包API密钥和接入点ID后再运行此示例。');
  console.log('可以通过环境变量设置:');
  console.log('export DOUBAO_API_KEY="你的密钥"');
  console.log('export DOUBAO_ENDPOINT_ID="ep-xxxxxxxxxx"');
  console.log('您可以在火山引擎平台获取密钥和创建接入点: https://console.volcengine.com/ark/');
} else {
  // 运行示例
  main().catch(console.error);
} 