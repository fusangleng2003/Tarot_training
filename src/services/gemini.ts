const GEMINI_KEY_STORAGE = "tarot_gemini_api_key";
const GEMINI_MODEL_STORAGE = "tarot_gemini_model";

export const GEMINI_MODELS = [
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    description: "均衡速度与质量，适合日常塔罗解读",
  },
  {
    id: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash-Lite",
    description: "更省成本、更低延迟",
  },
  {
    id: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    description: "推理更强，速度通常更慢",
  },
] as const;

export type GeminiModelId = (typeof GEMINI_MODELS)[number]["id"];
const DEFAULT_GEMINI_MODEL: GeminiModelId = "gemini-2.5-flash";

export function getGeminiApiKey(): string {
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    localStorage.getItem(GEMINI_KEY_STORAGE) ||
    ""
  );
}

export function setGeminiApiKey(key: string) {
  localStorage.setItem(GEMINI_KEY_STORAGE, key);
}

export function getGeminiModel(): GeminiModelId {
  const storedModel = localStorage.getItem(GEMINI_MODEL_STORAGE);
  return GEMINI_MODELS.some((model) => model.id === storedModel)
    ? (storedModel as GeminiModelId)
    : DEFAULT_GEMINI_MODEL;
}

export function setGeminiModel(model: GeminiModelId) {
  localStorage.setItem(GEMINI_MODEL_STORAGE, model);
}

export const TAROT_READER_SYSTEM_PROMPT = `你是我的塔罗解读辅助。请用「故事化氛围」+「理性拆解」的结合方式回答，目标是根据牌义与现实逻辑给出洞察。

【回答结构要求】

1. 牌面基础（简短但精准）：说明每张牌的核心含义（正位/逆位），给3-5个关键词。

2. 画面与氛围（要写成场景感）：不是玄学，而是用图像→心理象征→人性瞬间的方式表达，例如"这张牌像是两个人靠得有点过近，气息都在同一条线上。""有人在低光的房间里，把手机亮度调到最低。""像站在海风里眺望比现在更远的地方。"要求必须有画面、必须可代入。

3. 现实解读（给2-3条'可能性分支'）：每一条都要能"读起来像一个小故事"，不要给绝对预测，不迎合浪漫，也不夸大负面，必须符合现实逻辑（人性、关系动力、心理状态），例如"如果对方近期确实情绪不稳，这张牌更像……""如果你们的连接还没有明说，那它提示的是……""如果你们两个人都在等时机，那更像是……"。

4. 直觉校准：分为三类——高度契合牌义、合理但属于个人联想、走偏/脑补/浪漫化/过度悲观（需要指出原因），重点是必须指出我的错位，但语气保持冷静与客观，不要迎合温柔。

5. 现实提醒：说明哪些内容"只是趋势或氛围"，哪些"无法预测"，哪些"需要现实行为才能推动"，哪些"必须避免过度依赖塔罗"，一句话总结：塔罗指导情绪，不指导人生结论。

6. 总结（氛围化一句话）：必须有画面感+核心洞察，不超过25字，读完让人"懂了"，例如"你们已经靠得很近了，下一步需要抬头一起看远处。""情绪是真的，但卡点是习惯性的自我防御。"

【我的提问格式】
我每次会这样输入：
问题：……；
抽到的牌：1.……（正/逆） 2.……（正/逆） 3.……（正/逆）；
我的直觉：……；
背景：无/或补充必要背景；
请按照上面你自己的回答结构解读。`;

export interface SpreadAnalysisInput {
  question: string;
  cards: Array<{
    position: string;
    positionDescription?: string;
    cardName: string;
    orientation: "upright" | "reversed";
  }>;
  intuition: string;
  background: string;
  selfInterpretation?: string;
}

export function buildSpreadAnalysisPrompt(input: SpreadAnalysisInput): string {
  const cardsText = input.cards
    .map(
      (c, i) =>
        `${i + 1}. ${c.position}${c.positionDescription ? `（${c.positionDescription}）` : ""}：${c.cardName}（${c.orientation === "upright" ? "正位" : "逆位"}）`
    )
    .join("\n");

  return `问题：${input.question}；
抽到的牌：
${cardsText}；
我的直觉：${input.intuition || "暂无"}；
我的初步解读：${input.selfInterpretation || "暂无"}；
背景：${input.background || "无"}；
请按照上面你自己的回答结构解读。`;
}

export async function analyzeSpread(
  input: SpreadAnalysisInput,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const apiKey = getGeminiApiKey();
  const model = getGeminiModel();
  if (!apiKey) {
    throw new Error("请先设置 Gemini API Key");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: TAROT_READER_SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: buildSpreadAnalysisPrompt(input) }],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 4096,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API 错误 (${response.status}): ${err}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("无法读取响应流");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (!jsonStr || jsonStr === "[DONE]") continue;

      try {
        const parsed = JSON.parse(jsonStr);
        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) onChunk(text);
      } catch {
        // skip malformed chunks
      }
    }
  }
}
