/**
 * AisAPI类集成中国AI大模型示例 (更新版)
 * 
 * 此示例展示如何使用AisAPI类统一管理和调用多个中国AI大模型提供商，
 * 包括最新集成的阿里巴巴千问(Qwen)。
 * 
 * 运行此示例前，请确保设置环境变量:
 * MOONSHOT_API_KEY=your_moonshot_api_key
 * SPARK_API_KEY=your_spark_api_key
 * SPARK_APP_ID=your_spark_app_id
 * SPARK_API_SECRET=your_spark_secret
 * ZHIPU_API_KEY=your_zhipu_api_key
 * ERNIE_API_KEY=your_ernie_api_key
 * ERNIE_SECRET_KEY=your_ernie_secret_key
 * QWEN_API_KEY=your_qwen_api_key
 */

import { AisAPI, SparkModel, ZhipuModel, ErnieModel, QwenModel } from './index';

async function main() {
  // 创建AisAPI实例，配置多个中国AI提供商
  const ais = new AisAPI({
    moonshot: {
      apiKey: process.env.MOONSHOT_API_KEY,
      model: 'moonshot-v1-8k'
    },
    spark: {
      apiKey: process.env.SPARK_API_KEY,
      appId: process.env.SPARK_APP_ID,
      apiSecret: process.env.SPARK_API_SECRET,
      model: SparkModel.PRO
    },
    zhipu: {
      apiKey: process.env.ZHIPU_API_KEY,
      model: ZhipuModel.GLM_3_TURBO
    },
    ernie: {
      apiKey: process.env.ERNIE_API_KEY,
      secretKey: process.env.ERNIE_SECRET_KEY,
      model: ErnieModel.ERNIE_BOT
    },
    qwen: {
      apiKey: process.env.QWEN_API_KEY,
      model: QwenModel.TURBO
    },
    // 设置默认提供商为Moonshot (Kimi)
    defaultProvider: 'moonshot'
  });

  try {
    // 显示可用的提供商
    console.log('已配置的AI提供商:', ais.getProviders());
    console.log('默认提供商:', ais.getDefaultProvider()?.name);
    console.log('\n');

    // 使用默认提供商(Moonshot)生成文本
    console.log('=== 使用默认提供商(Moonshot) ===');
    const response1 = await ais.generateText({
      prompt: '用简洁的语言解释什么是向量数据库',
      maxTokens: 200
    });
    console.log(response1.text);
    console.log('\n');

    // 使用讯飞星火生成文本
    console.log('=== 使用讯飞星火 ===');
    const response2 = await ais.generateText({
      prompt: '用简洁的语言解释什么是向量数据库',
      maxTokens: 200
    }, 'spark');
    console.log(response2.text);
    console.log('\n');

    // 使用智谱AI生成文本
    console.log('=== 使用智谱AI ===');
    const response3 = await ais.generateText({
      prompt: '用简洁的语言解释什么是向量数据库',
      maxTokens: 200
    }, 'zhipu');
    console.log(response3.text);
    console.log('\n');

    // 使用百度文心一言生成文本
    console.log('=== 使用百度文心一言 ===');
    const response4 = await ais.generateText({
      prompt: '用简洁的语言解释什么是向量数据库',
      maxTokens: 200
    }, 'ernie');
    console.log(response4.text);
    console.log('\n');
    
    // 使用阿里巴巴千问生成文本
    console.log('=== 使用阿里巴巴千问 ===');
    const response5 = await ais.generateText({
      prompt: '用简洁的语言解释什么是向量数据库',
      maxTokens: 200
    }, 'qwen');
    console.log(response5.text);
    console.log('\n');

    // 切换默认提供商并使用
    console.log('=== 切换默认提供商到千问 ===');
    ais.setDefaultProvider('qwen');
    console.log('新的默认提供商:', ais.getDefaultProvider()?.name);
    
    const response6 = await ais.generateText({
      prompt: '中文大语言模型的未来发展趋势',
      maxTokens: 300,
      temperature: 0.7
    });
    console.log(response6.text);
    console.log('\n');

    // 使用同一提供商生成JSON格式响应
    console.log('=== 生成JSON格式响应 ===');
    const response7 = await ais.generateJSON({
      prompt: '列出5个中国城市及其著名景点，以JSON格式返回',
      temperature: 0.2
    });
    console.log(JSON.stringify(response7, null, 2));
    console.log('\n');
    
    // 多提供商对比测试
    console.log('=== 多提供商对比测试 ===');
    const testQuestion = '如果你要推荐一个中国的旅游城市，你会推荐哪里？为什么？';
    console.log(`问题: ${testQuestion}\n`);
    
    // 遍历所有提供商进行回答
    for (const providerName of ais.getProviders()) {
      console.log(`--- ${providerName} 的回答 ---`);
      try {
        const response = await ais.generateText({
          prompt: testQuestion,
          maxTokens: 250,
          temperature: 0.7
        }, providerName);
        console.log(response.text);
        console.log('\n');
      } catch (error) {
        console.error(`${providerName} 响应错误:`, error);
      }
    }

  } catch (error) {
    console.error('发生错误:', error);
  }
}

// 执行主函数
main().catch(console.error); 