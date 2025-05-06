/**
 * OpenAI API使用示例
 * 展示如何使用GPT和相关功能
 */

import { GPT } from '../src';
import { ChatMessage } from '../src/types';

async function main() {
  console.log('===== OpenAI API使用示例 =====');
  
  // 创建GPT实例
  const gpt = new GPT({
    apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
    model: 'gpt-4o'  // 默认使用最新的GPT-4o
  });
  
  // 1. 基本文本生成 (传统completions API)
  console.log('\n1. 基本文本生成 (传统completions API)');
  try {
    const result = await gpt.generateText({
      prompt: '请用简短的语言解释什么是量子计算',
      maxTokens: 150,
      temperature: 0.7,
      model: 'gpt-3.5-turbo-instruct'  // 使用传统completions需要指定兼容模型
    });
    
    console.log('回答:', result.text);
    console.log('Token使用:', result.usage);
  } catch (error: any) {
    console.error('文本生成错误:', error.message);
  }
  
  // 2. 聊天完成 API (推荐方式)
  console.log('\n2. 聊天完成 API (ChatGPT)');
  try {
    const messages: ChatMessage[] = [
      { role: 'system', content: '你是一个专业的科学顾问，擅长简洁易懂地解释复杂概念。' },
      { role: 'user', content: '请简单解释一下黑洞是什么，以及它们如何形成？' }
    ];
    
    const chatResult = await gpt.chatCompletion({
      model: 'gpt-4',
      messages,
      temperature: 0.5,
      maxTokens: 300
    });
    
    console.log('ChatGPT回答:', chatResult.text);
    console.log('Token使用:', chatResult.usage);
  } catch (error: any) {
    console.error('聊天API错误:', error.message);
  }
  
  // 3. 多轮对话
  console.log('\n3. 多轮对话示例');
  try {
    // 初始化对话历史
    const conversation: ChatMessage[] = [
      { role: 'system', content: '你是一名友好的人工智能助手。' }
    ];
    
    // 第一轮问答
    conversation.push({ role: 'user', content: '你好！请问你叫什么名字？' });
    
    let response = await gpt.chatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [...conversation],
      temperature: 0.7
    });
    
    console.log('用户: 你好！请问你叫什么名字？');
    console.log('AI:', response.text);
    
    // 添加AI回复到对话历史
    conversation.push({ role: 'assistant', content: response.text });
    
    // 第二轮问答
    conversation.push({ role: 'user', content: '你能帮我写一首简短的诗吗？主题是春天。' });
    
    response = await gpt.chatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [...conversation],
      temperature: 0.7
    });
    
    console.log('用户: 你能帮我写一首简短的诗吗？主题是春天。');
    console.log('AI:', response.text);
    
    // 添加AI回复到对话历史
    conversation.push({ role: 'assistant', content: response.text });
    
    // 第三轮问答
    conversation.push({ role: 'user', content: '这首诗用英语怎么说？' });
    
    response = await gpt.chatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [...conversation],
      temperature: 0.7
    });
    
    console.log('用户: 这首诗用英语怎么说？');
    console.log('AI:', response.text);
  } catch (error: any) {
    console.error('多轮对话错误:', error.message);
  }
  
  // 4. 图像生成 (DALL-E)
  console.log('\n4. 图像生成 (DALL-E)');
  try {
    const imageResult = await gpt.generateImage({
      prompt: '一只戴着宇航员头盔的可爱猫咪，在太空中漂浮，有星星和行星在背景中',
      n: 1,
      size: '1024x1024',
      model: 'dall-e-3'
    });
    
    console.log('生成的图像URL:');
    imageResult.urls.forEach(url => console.log(url));
  } catch (error: any) {
    console.error('图像生成错误:', error.message);
  }
  
  // 5. 向量嵌入 (Embeddings)
  console.log('\n5. 向量嵌入 (Embeddings)');
  try {
    const texts = [
      '人工智能是计算机科学的一个分支',
      '机器学习是人工智能的一个子领域',
      '深度学习是机器学习的一种技术'
    ];
    
    const embeddingResult = await gpt.createEmbedding({
      model: 'text-embedding-3-small',
      input: texts
    });
    
    console.log(`生成了 ${embeddingResult.data.length} 个嵌入向量`);
    console.log(`每个向量维度: ${embeddingResult.data[0].embedding.length}`);
    console.log('Token使用:', embeddingResult.usage);
    
    // 演示向量相似度计算
    console.log('\n向量相似度示例:');
    const vector1 = embeddingResult.data[0].embedding;
    const vector2 = embeddingResult.data[1].embedding;
    
    // 计算余弦相似度
    function cosineSimilarity(a: number[], b: number[]): number {
      const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
      const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
      const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
      return dotProduct / (magnitudeA * magnitudeB);
    }
    
    const similarity = cosineSimilarity(vector1, vector2);
    console.log(`"${texts[0]}" 和 "${texts[1]}" 的相似度: ${similarity.toFixed(4)}`);
  } catch (error: any) {
    console.error('向量嵌入错误:', error.message);
  }
  
  // 6. 生成 JSON 格式内容
  console.log('\n6. 生成 JSON 格式内容');
  try {
    const jsonResponse = await gpt.chatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: '你是一个生成结构化数据的助手。' },
        { role: 'user', content: '生成一个包含3名虚构科学家的JSON数组，每人包含姓名、专业领域、主要成就和出生年份字段。' }
      ],
      responseFormat: { type: 'json_object' }
    });
    
    console.log('JSON响应:');
    console.log(jsonResponse.text);
    
    // 解析JSON
    try {
      const parsedData = JSON.parse(jsonResponse.text);
      console.log('成功解析JSON数据:', !!parsedData);
    } catch (e) {
      console.error('JSON解析失败');
    }
  } catch (error: any) {
    console.error('JSON生成错误:', error.message);
  }
  
  // 7. 模型列表
  console.log('\n7. 获取可用模型列表');
  try {
    const models = await gpt.listModels();
    console.log(`发现 ${models.data.length} 个可用模型`);
    
    // 只显示前5个
    const modelNames = models.data.slice(0, 5).map((model: any) => model.id);
    console.log('部分模型:', modelNames);
  } catch (error: any) {
    console.error('获取模型列表错误:', error.message);
  }
}

// 注: 如果要测试语音相关功能，需要实现文件上传机制
// 运行示例
main().catch(error => {
  console.error('程序执行出错:', error);
}); 