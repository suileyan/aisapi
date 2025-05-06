/**
 * Anthropic (Claude) API使用示例
 * 展示如何使用Claude的各项功能
 */

import { Claude } from './index';
import { AnthropicOptions } from './providers/anthropic';

// 请将你的API密钥替换为实际值
// 推荐使用环境变量存储API密钥
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'your-anthropic-api-key';

async function main() {
  console.log('===== Anthropic(Claude) API使用示例 =====');
  
  // 创建Claude实例
  const claude = new Claude({
    apiKey: ANTHROPIC_API_KEY,
    model: 'claude-3-7-sonnet-20250219',  // 默认使用Sonnet模型，开发者可以根据需要更改
    anthropicVersion: '2024-06-23'  // 使用最新API版本
  } as AnthropicOptions);
  
  // 1. 基本文本生成
  console.log('\n1. 基本文本生成');
  try {
    const result = await claude.generateText({
      prompt: '请用简短的语言解释什么是大型语言模型',
      maxTokens: 200,
      temperature: 0.7,
      systemMessage: '你是一位AI研究专家，请简明扼要地回答问题。'
    });
    
    console.log('回答:', result.text);
    console.log('Token使用:', result.usage);
  } catch (error: any) {
    console.error('文本生成错误:', error.message);
  }
  
  // 2. 聊天完成示例
  console.log('\n2. 多轮对话示例');
  try {
    const chatResult = await claude.chatCompletion({
      messages: [
        { role: 'user', content: '你好，请介绍一下自己' },
        { role: 'assistant', content: '我是Claude，一个由Anthropic开发的AI助手。我擅长自然语言处理、回答问题和提供帮助。' },
        { role: 'user', content: '你能帮我写一首关于春天的短诗吗？' }
      ],
      systemMessage: '你是一位才华横溢的诗人，善于创作优美的诗歌。请保持诗歌简短优雅。',
      temperature: 0.8,
      maxTokens: 250
    });
    
    console.log('Claude回答:');
    console.log(chatResult.text);
    console.log('\nToken使用:', chatResult.usage);
  } catch (error: any) {
    console.error('聊天完成错误:', error.message);
  }
  
  // 3. JSON格式生成
  console.log('\n3. JSON格式生成');
  try {
    const jsonResult = await claude.generateJSON({
      prompt: '请给我三个世界著名的科学家，包含姓名、主要成就和出生年份',
      temperature: 0.5,
      systemMessage: '你是数据格式化专家。请将回答格式化为有效的JSON，包含数组和对象。'
    });
    
    console.log('JSON结果:');
    console.log(JSON.stringify(jsonResult.data, null, 2));
  } catch (error: any) {
    console.error('JSON生成错误:', error.message);
  }
  
  // 4. 计算token数量
  console.log('\n4. 计算token数量');
  try {
    const tokensResult = await claude.countTokens(
      [
        { role: 'user', content: '什么是量子计算？它与传统计算有什么区别？' }
      ], 
      '你是一位量子计算专家，请详细解释相关概念。'
    );
    
    console.log('Token计数结果:');
    console.log(`- 输入token数: ${tokensResult.input_tokens}`);
  } catch (error: any) {
    console.error('计算token错误:', error.message);
  }
  
  // 5. 工具调用示例
  console.log('\n5. 工具调用示例');
  try {
    const toolsResult = await claude.chatCompletion({
      messages: [
        { role: 'user', content: '我想了解上海今天的天气' }
      ],
      systemMessage: '你是一位助手，可以调用天气API来回答用户问题。',
      tools: [
        {
          name: 'get_weather',
          description: '获取指定城市的天气信息',
          input_schema: {
            type: 'object',
            properties: {
              location: { 
                type: 'string',
                description: '城市名称，如"北京"、"上海"等'
              },
              unit: { 
                type: 'string',
                enum: ['celsius', 'fahrenheit'],
                description: '温度单位，默认为摄氏度(celsius)'
              }
            },
            required: ['location']
          }
        }
      ]
    });
    
    console.log('工具调用结果:');
    console.log(toolsResult.text);
    
    // 提取工具调用数据(如果有)
    const rawResponse = toolsResult.rawResponse as any;
    const toolUses = rawResponse.content.filter((item: any) => item.type === 'tool_use');
    
    if (toolUses.length > 0) {
      console.log('\n工具调用详情:');
      console.log(JSON.stringify(toolUses, null, 2));
      
      // 在实际应用中，这里可以执行工具调用，然后将结果返回给Claude
      console.log('\n模拟工具调用并返回结果...');
      
      // 假设我们有一个天气API返回的结果
      const weatherResult = {
        location: '上海',
        temperature: 24,
        condition: '多云',
        humidity: 65,
        wind: '东北风 3级'
      };
      
      // 继续对话，发送工具结果
      const continueResult = await claude.chatCompletion({
        messages: [
          { role: 'user', content: '我想了解上海今天的天气' },
          { 
            role: 'assistant', 
            content: JSON.stringify([{
              type: 'tool_use',
              id: toolUses[0].id,
              name: 'get_weather',
              input: { location: '上海', unit: 'celsius' }
            }])
          },
          { 
            role: 'user', 
            content: JSON.stringify([{
              type: 'tool_result',
              tool_use_id: toolUses[0].id,
              content: JSON.stringify(weatherResult)
            }])
          }
        ],
        systemMessage: '你是一位助手，可以调用天气API来回答用户问题。请根据API返回的结果，提供友好的天气描述。'
      });
      
      console.log('\n带工具结果的回答:');
      console.log(continueResult.text);
    }
  } catch (error: any) {
    console.error('工具调用错误:', error.message);
  }
  
  // 6. 流式输出示例（此示例仅展示概念，实际使用需要处理流式数据）
  console.log('\n6. 流式输出示例');
  try {
    console.log('开始流式输出（此处仅展示请求结构，未处理流式数据）:');
    
    const stream = await claude.createStreamingChatCompletion({
      messages: [
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
  
  // 7. 多模态示例（图像）
  console.log('\n7. 多模态示例（图像分析）');
  console.log('注意: 这个示例需要有一个可访问的图像URL');
  
  const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg';
  
  try {
    console.log(`使用图像URL: ${imageUrl}`);
    
    const imageResult = await claude.generateTextWithImage({
      prompt: '请详细描述这张图片，包括你看到的主要元素和整体氛围。',
      image: {
        url: imageUrl
      },
      maxTokens: 300,
      temperature: 0.7,
      systemMessage: '你是一位细致的图像分析师，请提供详细的图像描述。'
    });
    
    console.log('图像分析结果:');
    console.log(imageResult.text);
    console.log('\nToken使用:', imageResult.usage);
  } catch (error: any) {
    console.error('图像分析错误:', error.message);
  }
}

// 检查API密钥是否已设置
if (ANTHROPIC_API_KEY === 'your-anthropic-api-key') {
  console.log('请设置你的Anthropic API密钥后再运行此示例。');
  console.log('可以通过环境变量设置: export ANTHROPIC_API_KEY="你的密钥"');
} else {
  // 运行示例
  main().catch(console.error);
} 