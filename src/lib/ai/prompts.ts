// PRD-compliant script generation prompts

export const SYSTEM_PROMPT = `你是一位资深知识博主内容策划专家，专门帮助专业人士将复杂知识转化为通俗易懂的口播内容。

【核心要求】

1. **脚本结构**（严格按照此结构）：
   - 【钩子】3秒 - 必须瞬间抓住注意力
   - 【痛点】10秒 - 引发共鸣的问题或困惑
   - 【知识点】60秒 - 核心内容，分点讲解
   - 【互动】5秒 - 引导评论或思考
   - 【结尾】5秒 - 行动号召

2. **通俗化表达**：
   - 将专业术语转化为"说人话"
   - 用生活化比喻解释复杂概念
   - 避免学术腔和官方腔

3. **去口水话**：
   - 删除"那么"、"这个"、"那个"等冗余词
   - 每句话必须有信息量
   - 保持紧凑节奏，不拖沓

4. **埋点设计**（必须包含3个互动点）：
   - 用🎯标记互动位置
   - 类型：提问/悬念/争议/投票
   - 位置：开头钩子1个，中间1个，结尾前1个

5. **字数控制**：
   - 严格控制在500-800字
   - 约3-5分钟口播时长
   - 每分钟160-180字的语速

6. **风格要求**：
   - 亲切自然，像朋友聊天
   - 有节奏感，长短句结合
   - 适当使用emoji增加趣味性`;

export function buildPrompt(params: {
  topic: string;
  domain: string;
  duration: number;
}) {
  return `请为以下选题生成符合知识博主风格的口播稿：

【选题信息】
- 标题：${params.topic}
- 领域：${params.domain}
- 时长：约${params.duration}分钟
- 字数：${params.duration * 160}-${params.duration * 180}字

【参考结构】

【钩子】（3秒，约20字）
用一个问题、惊人事实或反直觉观点开场，让观众产生"为什么？"的好奇。
示例：
- "你有没有发现，越专业的人反而越不会讲课？"
- "一个价值10万的知识，其实只需要3分钟就能讲清楚。"

【痛点】（10秒，约50字）
描述目标观众的具体困扰，引发共鸣。
示例：
- "很多人学了十几年专业知识，一开口就把人讲睡着了。"
- "想把知识分享出去，却发现没人愿意听..."

【知识点】（60秒，约300字）
分3-4个小点讲解，每点用「首先/其次/最后」等连接词。
- 第一点：核心概念解释（用比喻）
- 第二点：具体方法/步骤
- 第三点：实际案例
- 🎯 插入一个互动点
- 第四点：进阶技巧或常见误区

【互动】（5秒，约30字）
引导观众参与，用🎯标记。
示例：
- "🎯 你在学习时遇到过这种情况吗？评论区告诉我"
- "🎯 觉得有用的话，双击屏幕让我知道"

【结尾】（5秒，约30字）
总结+行动号召。
示例：
- "关注我，每天分享一个知识变现技巧！"
- "下期我们聊更实战的方法，不见不散！"

【输出要求】
请直接输出完整的口播稿，严格按照上述结构标记【钩子】【痛点】等标签。`;
}

export function parseScript(content: string) {
  // 提取各个部分
  const sections = {
    hook: extractSection(content, '钩子'),
    pain: extractSection(content, '痛点'),
    knowledge: extractSection(content, '知识点'),
    interaction: extractSection(content, '互动'),
    ending: extractSection(content, '结尾'),
    fullContent: cleanContent(content)
  };

  // 提取所有互动点
  const hooks = findHooks(content);

  // 统计字数
  const wordCount = countWords(sections.fullContent);

  // 验证结构完整性
  const validation = validateScript(sections, hooks);

  return {
    content: sections.fullContent,
    sections,
    hooks,
    keywords: extractKeywords(content),
    wordCount,
    validation,
    // 如果验证不通过，标记需要优化
    needsOptimization: !validation.isValid
  };
}

function extractSection(content: string, sectionName: string): string {
  const regex = new RegExp(`【${sectionName}】([\\s\\S]*?)(?=【|$)`, 'i');
  const match = content.match(regex);
  return match ? cleanText(match[1]) : '';
}

function cleanText(text: string): string {
  return text
    .trim()
    // 删除多余空行
    .replace(/\n{3,}/g, '\n\n')
    // 删除行首空格
    .replace(/^\s+/gm, '');
}

function cleanContent(content: string): string {
  return content
    // 删除结构标记，保留内容
    .replace(/【[^】]+】/g, '')
    // 删除多余空行
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function findHooks(content: string): Array<{position: string; text: string; type: string}> {
  const hooks: Array<{position: string; text: string; type: string}> = [];
  
  // 查找🎯标记的互动点
  const regex = /🎯\s*([^🎯\n]+)/g;
  let match;
  let count = 0;
  
  while ((match = regex.exec(content)) !== null) {
    count++;
    const text = match[1].trim();
    hooks.push({
      position: getHookPosition(count),
      text,
      type: classifyHookType(text)
    });
  }
  
  return hooks;
}

function getHookPosition(index: number): string {
  const positions = ['开头', '中间', '结尾前'];
  return positions[index - 1] || '其他位置';
}

function classifyHookType(text: string): string {
  if (/吗？|呢？|吧？/.test(text)) return '提问';
  if (/想知道|猜猜|秘密/.test(text)) return '悬念';
  if (/同意|看法|觉得/.test(text)) return '观点征集';
  if (/双击|关注|转发/.test(text)) return '行动号召';
  return '互动';
}

function countWords(content: string): number {
  // 中文字符计数
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  // 英文单词计数
  const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
  return chineseChars + englishWords;
}

function validateScript(sections: any, hooks: any): {isValid: boolean; issues: string[]} {
  const issues: string[] = [];
  
  // 检查结构完整性
  if (!sections.hook) issues.push('缺少【钩子】部分');
  if (!sections.pain) issues.push('缺少【痛点】部分');
  if (!sections.knowledge) issues.push('缺少【知识点】部分');
  if (!sections.interaction) issues.push('缺少【互动】部分');
  if (!sections.ending) issues.push('缺少【结尾】部分');
  
  // 检查字数
  const wordCount = countWords(sections.fullContent);
  if (wordCount < 400) issues.push(`字数过少（${wordCount}字），建议500-800字`);
  if (wordCount > 1000) issues.push(`字数过多（${wordCount}字），建议控制在800字以内`);
  
  // 检查互动点数量
  if (hooks.length < 3) {
    issues.push(`互动点不足（${hooks.length}个），建议至少3个`);
  }
  
  // 检查钩子长度
  if (sections.hook && countWords(sections.hook) > 50) {
    issues.push('钩子过长，建议控制在30字以内');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

function extractKeywords(content: string): string[] {
  // 更智能的关键词提取
  const commonWords = new Set([
    '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也',
    '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那',
    '我们', '咱们', '大家', '各位', '其实', '可能', '应该', '需要', '可以', '就是', '所以'
  ]);
  
  // 提取2-4字的中文词组
  const words = content.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
  const freq: Record<string, number> = {};
  
  words.forEach(word => {
    if (!commonWords.has(word) && word.length >= 2 && word.length <= 4) {
      freq[word] = (freq[word] || 0) + 1;
    }
  });
  
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
}
