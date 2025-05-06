/**
 * 直接使用特定AI模型的示例
 * 这个示例展示如何直接导入和使用特定的AI模型，而不是通过统一的AisAPI接口
 */

// 直接导入需要的AI模型
import { GPT, Claude, Gemini } from '../src';
import { TextGenerationParams, ImageGenerationParams } from '../src/types';

async function main() {
  console.log('===== 直接使用特定AI模型示例 =====');
  
  // ===== 使用GPT (OpenAI) =====
  const gpt = new GPT({
    apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
    model: 'gpt-4'
  });
  
  console.log('1. 使用GPT生成文本');
  try {
    const gptTextParams: TextGenerationParams = {
      prompt: '请用简单的语言解释量子物理',
      maxTokens: 200,
      temperature: 0.7
    };
    
    const gptResult = await gpt.generateText(gptTextParams);
    console.log('GPT回答:', gptResult.text);
    console.log('Token使用:', gptResult.usage);
    
    // 生成图像
    const gptImageParams: ImageGenerationParams = {
      prompt: '一只穿着宇航服的猫咪在太空中漂浮',
      n: 1,
      size: '512x512'
    };
    
    console.log('\n2. 使用GPT生成图像');
    const imageResult = await gpt.generateImage(gptImageParams);
    console.log('图像URL:', imageResult.urls);
  } catch (error) {
    console.error('GPT调用错误:', error);
  }
  
  // ===== 使用Claude (Anthropic) =====
  const claude = new Claude({
    apiKey: process.env.ANTHROPIC_API_KEY || 'your-anthropic-api-key',
    model: 'claude-3-opus-20240229'
  });
  
  console.log('\n3. 使用Claude生成文本');
  try {
    const claudeResult = await claude.generateText({
      prompt: '请用简单的语言解释量子物理',
      maxTokens: 200
    });
    
    console.log('Claude回答:', claudeResult.text);
    console.log('Token使用:', claudeResult.usage);
  } catch (error) {
    console.error('Claude调用错误:', error);
  }
  
  // ===== 使用Gemini (Google) =====
  const gemini = new Gemini({
    apiKey: process.env.GEMINI_API_KEY || 'your-gemini-api-key'
  });
  
  console.log('\n4. 使用Gemini生成文本');
  try {
    const geminiResult = await gemini.generateText({
      prompt: '请用简单的语言解释量子物理',
      maxTokens: 200
    });
    
    console.log('Gemini回答:', geminiResult.text);
    console.log('Token使用:', geminiResult.usage);
  } catch (error) {
    console.error('Gemini调用错误:', error);
  }
}

// 运行示例
main().catch(error => {
  console.error('程序执行出错:', error);
}); 