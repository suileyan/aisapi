/**
 * DeepSeek API使用示例
 * 展示如何使用DeepSeek和特有功能
 */

import { DeepSeek } from './index';
import { DeepSeekOptions, DeepSeekProvider } from './providers/deepseek';

// 请将你的API密钥替换为实际值
// 推荐使用环境变量存储API密钥
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'your-deepseek-api-key';

async function main() {
  console.log('===== DeepSeek API使用示例 =====');
  
  // 创建DeepSeek实例，启用缓存监控
  const deepseek = new DeepSeek({
    apiKey: DEEPSEEK_API_KEY,
    model: 'deepseek-chat',  // 默认使用通用对话模型
    enableCacheMonitoring: true  // 启用缓存监控
  } as DeepSeekOptions);
  
  // 1. 基本文本生成
  console.log('\n1. 基本文本生成');
  try {
    const result = await deepseek.generateText({
      prompt: '请用简短的语言解释什么是大型语言模型',
      maxTokens: 200,
      temperature: 0.7
    });
    
    console.log('回答:', result.text);
    console.log('Token使用:', result.usage);
    
    // 显示缓存信息
    if (result.cacheInfo) {
      console.log('缓存信息:');
      console.log(`- 缓存命中Token: ${result.cacheInfo.hitTokens}`);
      console.log(`- 缓存未命中Token: ${result.cacheInfo.missTokens}`);
      console.log(`- 缓存命中率: ${(result.cacheInfo.hitRate || 0) * 100}%`);
      console.log(`- 估计节省成本: $${(result.cacheInfo.estimatedSavings || 0).toFixed(6)}`);
    }
  } catch (error: any) {
    console.error('文本生成错误:', error.message);
  }
  
  // 2. 链式推理 (Chain-of-Thought)
  console.log('\n2. 链式推理示例 (使用deepseek-reasoner模型)');
  try {
    const cotResult = await (deepseek as DeepSeekProvider).chainOfThought({
      prompt: '如果一个球从10米高的地方落下，它的动能是如何变化的？请详细分析',
      temperature: 0.3,
      maxTokens: 500
    });
    
    console.log('链式推理回答:');
    console.log(cotResult.text);
    console.log('\nToken使用:', cotResult.usage);
    
    // 显示缓存信息
    if (cotResult.cacheInfo) {
      console.log('缓存信息:');
      console.log(`- 缓存命中率: ${(cotResult.cacheInfo.hitRate || 0) * 100}%`);
      console.log(`- 估计节省成本: $${(cotResult.cacheInfo.estimatedSavings || 0).toFixed(6)}`);
    }
  } catch (error: any) {
    console.error('链式推理错误:', error.message);
  }
  
  // 3. JSON格式生成
  console.log('\n3. JSON格式生成');
  try {
    const jsonResult = await (deepseek as DeepSeekProvider).generateJSON({
      prompt: '请给我三个世界著名的科学家，包含姓名、主要成就和出生年份，以JSON格式返回',
      temperature: 0.5
    });
    
    console.log('JSON结果:');
    console.log(JSON.stringify(jsonResult.data, null, 2));
  } catch (error: any) {
    console.error('JSON生成错误:', error.message);
  }
  
  // 4. 缓存统计信息
  console.log('\n4. 缓存统计信息');
  const cacheStats = (deepseek as DeepSeekProvider).getCacheStats();
  console.log('缓存使用总结:');
  console.log(`- 总请求数: ${cacheStats.totalRequests}`);
  console.log(`- 总缓存命中Token: ${cacheStats.totalHitTokens}`);
  console.log(`- 总缓存未命中Token: ${cacheStats.totalMissTokens}`);
  console.log(`- 总输出Token: ${cacheStats.totalOutputTokens}`);
  console.log(`- 总体缓存命中率: ${(cacheStats.hitRate * 100).toFixed(2)}%`);
  console.log(`- 总计节省成本: $${cacheStats.estimatedSavings.toFixed(6)}`);
  
  // 5. 连续多次调用以展示缓存效果
  console.log('\n5. 连续多次调用相同提示以展示缓存效果');
  const prompt = '请简要解释量子计算的基本原理';
  
  console.log('第一次调用 (可能没有缓存命中):');
  try {
    const firstCall = await deepseek.generateText({ prompt, maxTokens: 100 });
    console.log(`- 缓存命中Token: ${firstCall.cacheInfo?.hitTokens || 0}`);
    console.log(`- 缓存未命中Token: ${firstCall.cacheInfo?.missTokens || 0}`);
    console.log(`- 缓存命中率: ${((firstCall.cacheInfo?.hitRate || 0) * 100).toFixed(2)}%`);
    
    console.log('\n第二次调用 (应该有缓存命中):');
    const secondCall = await deepseek.generateText({ prompt, maxTokens: 100 });
    console.log(`- 缓存命中Token: ${secondCall.cacheInfo?.hitTokens || 0}`);
    console.log(`- 缓存未命中Token: ${secondCall.cacheInfo?.missTokens || 0}`);
    console.log(`- 缓存命中率: ${((secondCall.cacheInfo?.hitRate || 0) * 100).toFixed(2)}%`);
    
    console.log('\n第三次调用 (应该有更高的缓存命中):');
    const thirdCall = await deepseek.generateText({ prompt, maxTokens: 100 });
    console.log(`- 缓存命中Token: ${thirdCall.cacheInfo?.hitTokens || 0}`);
    console.log(`- 缓存未命中Token: ${thirdCall.cacheInfo?.missTokens || 0}`);
    console.log(`- 缓存命中率: ${((thirdCall.cacheInfo?.hitRate || 0) * 100).toFixed(2)}%`);
    
    // 更新后的缓存统计
    console.log('\n更新后的缓存统计:');
    const updatedStats = (deepseek as DeepSeekProvider).getCacheStats();
    console.log(`- 总体缓存命中率: ${(updatedStats.hitRate * 100).toFixed(2)}%`);
    console.log(`- 总计节省成本: $${updatedStats.estimatedSavings.toFixed(6)}`);
  } catch (error: any) {
    console.error('缓存测试错误:', error.message);
  }
  
  // 重置缓存统计信息
  console.log('\n重置缓存统计信息');
  (deepseek as DeepSeekProvider).resetCacheStats();
  console.log('缓存统计已重置');
}

// 检查API密钥是否已设置
if (DEEPSEEK_API_KEY === 'your-deepseek-api-key') {
  console.log('请设置你的DeepSeek API密钥后再运行此示例。');
  console.log('可以通过环境变量设置: export DEEPSEEK_API_KEY="你的密钥"');
} else {
  // 运行示例
  main().catch(console.error);
} 