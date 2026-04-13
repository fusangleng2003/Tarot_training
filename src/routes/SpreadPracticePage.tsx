import { useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSpreadById } from "../data/spreads";
import { tarotCards } from "../data/cards";
import { TarotCard } from "../components/card/TarotCard";
import { GestureCardDrawer } from "../components/card/GestureCardDrawer";
import {
  analyzeSpread,
  buildSpreadAnalysisPrompt,
  GEMINI_MODELS,
  getGeminiApiKey,
  getGeminiModel,
  setGeminiModel,
  setGeminiApiKey,
  type GeminiModelId,
  type SpreadAnalysisInput,
} from "../services/gemini";
import type {
  CardOrientation,
  TarotCard as TarotCardType,
} from "../types/tarot";

interface DrawnCard {
  card: TarotCardType;
  orientation: CardOrientation;
  revealed: boolean;
}

type DrawMode = "system" | "manual" | "gesture";
type ReversalMode = "upright-only" | "light" | "balanced";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createShuffledDeck(): TarotCardType[] {
  return shuffle([...tarotCards]);
}

function getOrientationByMode(mode: ReversalMode): CardOrientation {
  if (mode === "upright-only") return "upright";
  if (mode === "light") {
    return Math.random() < 0.25 ? "reversed" : "upright";
  }
  return Math.random() < 0.5 ? "reversed" : "upright";
}

type AnalysisStep = "idle" | "form" | "loading" | "done" | "error";

export function SpreadPracticePage() {
  const { spreadId } = useParams<{ spreadId: string }>();
  const navigate = useNavigate();
  const spread = getSpreadById(spreadId ?? "");

  // Card drawing state
  const [drawMode, setDrawMode] = useState<DrawMode>("system");
  const [reversalMode, setReversalMode] = useState<ReversalMode>("light");
  const [drawnCards, setDrawnCards] = useState<(DrawnCard | null)[]>(
    () => spread?.positions.map(() => null) ?? []
  );
  const [deckOrder, setDeckOrder] = useState<TarotCardType[]>(() =>
    createShuffledDeck()
  );
  const [notes, setNotes] = useState("");
  const [cardSearch, setCardSearch] = useState("");
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);

  // AI analysis state
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>("idle");
  const [question, setQuestion] = useState("");
  const [intuition, setIntuition] = useState("");
  const [background, setBackground] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [analysisError, setAnalysisError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  // API key state
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState(() => getGeminiApiKey());
  const [selectedModel, setSelectedModel] = useState<GeminiModelId>(() =>
    getGeminiModel()
  );
  const [gestureTargetPos, setGestureTargetPos] = useState<number | null>(null);

  const drawCard = useCallback(
    (posIndex: number) => {
      if (drawnCards[posIndex]) return;
      const usedIds = drawnCards.filter(Boolean).map((d) => d!.card.id);
      const card = deckOrder.find((deckCard) => !usedIds.includes(deckCard.id));
      if (!card) return;
      const orientation = getOrientationByMode(reversalMode);

      setDrawnCards((prev) => {
        const next = [...prev];
        next[posIndex] = { card, orientation, revealed: false };
        return next;
      });
    },
    [deckOrder, drawnCards, reversalMode]
  );

  const revealCard = useCallback((posIndex: number) => {
    setDrawnCards((prev) => {
      const next = [...prev];
      if (next[posIndex]) {
        next[posIndex] = { ...next[posIndex]!, revealed: true };
      }
      return next;
    });
  }, []);

  const drawAll = useCallback(() => {
    const positions = spread?.positions ?? [];
    const selectedDeck = deckOrder.slice(0, positions.length);
    setDrawnCards(
      positions.map((_, i) => ({
        card: selectedDeck[i],
        orientation: getOrientationByMode(reversalMode),
        revealed: true,
      }))
    );
  }, [deckOrder, reversalMode, spread]);

  const assignManualCard = useCallback((posIndex: number, cardId: string) => {
    const selectedCard = tarotCards.find((card) => card.id === cardId);
    if (!selectedCard) return;

    setDrawnCards((prev) => {
      const next = prev.map((item, index) => {
        if (index !== posIndex && item?.card.id === cardId) {
          return null;
        }
        return item;
      });

      next[posIndex] = {
        card: selectedCard,
        orientation: next[posIndex]?.orientation ?? "upright",
        revealed: true,
      };
      return next;
    });
  }, []);

  const updateManualOrientation = useCallback(
    (posIndex: number, orientation: CardOrientation) => {
      setDrawnCards((prev) => {
        const next = [...prev];
        if (!next[posIndex]) return prev;
        next[posIndex] = { ...next[posIndex]!, orientation, revealed: true };
        return next;
      });
    },
    []
  );

  const clearManualCard = useCallback((posIndex: number) => {
    setDrawnCards((prev) => {
      const next = [...prev];
      next[posIndex] = null;
      return next;
    });
  }, []);

  const reset = () => {
    setDrawnCards(spread?.positions.map(() => null) ?? []);
    setDeckOrder(createShuffledDeck());
    setNotes("");
    setCardSearch("");
    setDraggingCardId(null);
    setAnalysisStep("idle");
    setAnalysisResult("");
    setAnalysisError("");
    setQuestion("");
    setIntuition("");
    setBackground("");
    setGestureTargetPos(null);
    abortRef.current?.abort();
  };

  const startAnalysis = () => {
    if (!getGeminiApiKey()) {
      setShowApiKeyInput(true);
      return;
    }
    setAnalysisStep("form");
  };

  const submitAnalysis = async () => {
    if (!question.trim()) return;

    const cards: SpreadAnalysisInput["cards"] = [];
    const positions = spread?.positions ?? [];
    for (const pos of positions) {
      const drawn = drawnCards[pos.index];
      if (!drawn?.revealed) continue;
      cards.push({
        position: pos.label,
        positionDescription: pos.description,
        cardName: drawn.card.name,
        orientation: drawn.orientation,
      });
    }

    const input: SpreadAnalysisInput = {
      question: question.trim(),
      cards,
      intuition: intuition.trim(),
      background: background.trim(),
      selfInterpretation: notes.trim(),
    };

    setAnalysisStep("loading");
    setAnalysisResult("");
    setAnalysisError("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await analyzeSpread(
        input,
        (chunk) => setAnalysisResult((prev) => prev + chunk),
        controller.signal
      );
      setAnalysisStep("done");
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") return;
      setAnalysisError((err as Error).message);
      setAnalysisStep("error");
    }
  };

  const saveApiKey = () => {
    setGeminiApiKey(apiKeyDraft.trim());
    setGeminiModel(selectedModel);
    setShowApiKeyInput(false);
    if (analysisStep === "idle" && drawnCards.every((card) => card?.revealed)) {
      setAnalysisStep("form");
    }
  };

  if (!spread) {
    return (
      <div className="p-10 text-center text-mystic-star">
        未找到该牌阵
        <button
          onClick={() => navigate("/spreads")}
          className="block mx-auto mt-4 text-mystic-gold text-sm"
        >
          返回牌阵列表
        </button>
      </div>
    );
  }

  const hasApiKey = !!getGeminiApiKey();
  const allRevealed =
    drawnCards.length > 0 && drawnCards.every((card) => card?.revealed);
  const filteredCards = tarotCards.filter((card) => {
    const keyword = cardSearch.trim().toLowerCase();
    if (!keyword) return true;
    return (
      card.name.toLowerCase().includes(keyword) ||
      card.nameEn.toLowerCase().includes(keyword)
    );
  });
  const usedCardIds = drawnCards
    .filter(Boolean)
    .map((item) => item!.card.id);
  const promptPreview =
    question.trim() && allRevealed
      ? buildSpreadAnalysisPrompt({
          question: question.trim(),
          cards: (spread.positions ?? [])
            .map((pos) => {
              const drawn = drawnCards[pos.index];
              if (!drawn?.revealed) return null;
              return {
                position: pos.label,
                positionDescription: pos.description,
                cardName: drawn.card.name,
                orientation: drawn.orientation,
              };
            })
            .filter(Boolean) as SpreadAnalysisInput["cards"],
          intuition: intuition.trim(),
          background: background.trim(),
          selfInterpretation: notes.trim(),
        })
      : "";

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate("/spreads")}
            className="text-mystic-star/60 text-sm hover:text-mystic-gold mb-2 flex items-center gap-1"
          >
            ← 返回牌阵列表
          </button>
          <h1 className="text-2xl font-heading text-mystic-gold">
            {spread.name}
          </h1>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <div className="flex rounded-lg border border-mystic-veil overflow-hidden">
            <button
              onClick={() => {
                setDrawMode("system");
                reset();
              }}
              className={`px-3 py-1.5 text-xs transition-colors ${
                drawMode === "system"
                  ? "bg-mystic-glow text-white"
                  : "text-mystic-star/70 hover:bg-mystic-deep/50"
              }`}
            >
              系统抽牌
            </button>
            <button
              onClick={() => {
                setDrawMode("manual");
                reset();
              }}
              className={`px-3 py-1.5 text-xs transition-colors ${
                drawMode === "manual"
                  ? "bg-mystic-glow text-white"
                  : "text-mystic-star/70 hover:bg-mystic-deep/50"
              }`}
            >
              手动输入
            </button>
            <button
              onClick={() => {
                setDrawMode("gesture");
                reset();
              }}
              className={`px-3 py-1.5 text-xs transition-colors ${
                drawMode === "gesture"
                  ? "bg-mystic-glow text-white"
                  : "text-mystic-star/70 hover:bg-mystic-deep/50"
              }`}
            >
              手势抽牌
            </button>
          </div>
          <button
            onClick={() => setShowApiKeyInput((v) => !v)}
            className={`px-3 py-1.5 border rounded text-xs transition-colors ${
              hasApiKey
                ? "border-emerald-700/50 text-emerald-400 hover:border-emerald-500"
                : "border-mystic-veil text-mystic-star/60 hover:border-mystic-glow"
            }`}
            title="设置 Gemini API Key"
          >
            {hasApiKey ? "API ✓" : "API Key"}
          </button>
          {drawMode === "system" && (
            <button
              onClick={drawAll}
              className="px-4 py-1.5 bg-mystic-glow text-white rounded text-xs hover:bg-mystic-glow/80"
            >
              一键抽牌
            </button>
          )}
          <button
            onClick={reset}
            className="px-4 py-1.5 border border-mystic-veil text-mystic-star rounded text-xs hover:border-mystic-glow"
          >
            重新开始
          </button>
        </div>
      </div>

      {/* API Key Input */}
      {showApiKeyInput && (
        <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-veil mb-6">
          <label className="text-xs text-mystic-star/70 block mb-2">
            Gemini API Key（存储在本地浏览器中）
          </label>
          <div className="mb-3">
            <label className="text-xs text-mystic-star/70 block mb-2">
              Gemini 模型
            </label>
            <select
              value={selectedModel}
              onChange={(e) => {
                const model = e.target.value as GeminiModelId;
                setSelectedModel(model);
                setGeminiModel(model);
              }}
              className="w-full bg-mystic-void/50 border border-mystic-veil rounded px-3 py-2 text-mystic-moon text-sm focus:outline-none focus:border-mystic-glow"
            >
              {GEMINI_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.label} · {model.description}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKeyDraft}
              onChange={(e) => setApiKeyDraft(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 bg-mystic-void/50 border border-mystic-veil rounded px-3 py-1.5 text-mystic-moon text-sm focus:outline-none focus:border-mystic-glow"
            />
            <button
              onClick={saveApiKey}
              disabled={!apiKeyDraft.trim()}
              className="px-4 py-1.5 bg-mystic-glow text-white rounded text-xs hover:bg-mystic-glow/80 disabled:opacity-40"
            >
              保存
            </button>
          </div>
        </div>
      )}

      {/* Spread Board */}
      <div className="bg-mystic-deep/30 rounded-xl border border-mystic-veil p-6 mb-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-heading text-mystic-gold">
              {drawMode === "system" ? "系统抽牌模式" : drawMode === "gesture" ? "手势抽牌模式" : "手动输入模式"}
            </div>
            <div className="text-xs text-mystic-star/60 mt-1">
              {drawMode === "system"
                ? "先洗整副牌，再按顺序抽出当前牌位；逆位概率取决于你的抽牌习惯。"
                : drawMode === "gesture"
                  ? "点击空牌位，在全屏界面中通过手势或点击从扇形牌阵中抽取一张牌。"
                  : "从下方牌库拖动卡牌到牌位，或点击“放入此位”完成选择。"}
            </div>
          </div>
          {(drawMode === "manual" || drawMode === "gesture") && (
            <div className="text-xs text-mystic-star/50">
              已选 {usedCardIds.length} / {spread.positions.length} 张
            </div>
          )}
        </div>
        {(drawMode === "system" || drawMode === "gesture") && (
          <div className="mb-5 rounded-lg border border-mystic-veil bg-mystic-void/20 p-3">
            <div className="mb-2 text-xs text-mystic-star/60">
              逆位习惯设置：真实塔罗里逆位多少，取决于你洗牌时是否会让牌自由旋转。
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setReversalMode("upright-only")}
                className={`rounded px-3 py-1.5 text-xs transition-colors ${
                  reversalMode === "upright-only"
                    ? "bg-mystic-gold text-mystic-void"
                    : "border border-mystic-veil text-mystic-star/70 hover:border-mystic-glow"
                }`}
              >
                仅正位
              </button>
              <button
                onClick={() => setReversalMode("light")}
                className={`rounded px-3 py-1.5 text-xs transition-colors ${
                  reversalMode === "light"
                    ? "bg-mystic-gold text-mystic-void"
                    : "border border-mystic-veil text-mystic-star/70 hover:border-mystic-glow"
                }`}
              >
                轻逆位（约25%）
              </button>
              <button
                onClick={() => setReversalMode("balanced")}
                className={`rounded px-3 py-1.5 text-xs transition-colors ${
                  reversalMode === "balanced"
                    ? "bg-mystic-gold text-mystic-void"
                    : "border border-mystic-veil text-mystic-star/70 hover:border-mystic-glow"
                }`}
              >
                自由逆位（约50%）
              </button>
            </div>
          </div>
        )}
        <div
          className={`grid gap-4 ${spread.positions.length <= 3 ? "grid-cols-3" : "grid-cols-5"} justify-items-center`}
        >
          {spread.positions.map((pos) => {
            const drawn = drawnCards[pos.index];
            return (
              <div key={pos.index} className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-mystic-gold/70 font-heading">
                  {pos.label}
                </span>

                {drawMode === "gesture" && !drawn ? (
                  <button
                    onClick={() => setGestureTargetPos(pos.index)}
                    className="w-20 h-32 rounded-lg border-2 border-dashed border-mystic-glow/40 hover:border-mystic-gold/60 flex flex-col items-center justify-center transition-colors group gap-1"
                  >
                    <span className="text-mystic-glow/40 group-hover:text-mystic-gold text-lg">✦</span>
                    <span className="text-mystic-star/30 group-hover:text-mystic-gold/60 text-[10px]">
                      手势抽牌
                    </span>
                  </button>
                ) : drawMode === "gesture" && drawn ? (
                  <TarotCard
                    card={drawn.card}
                    orientation={drawn.orientation}
                    size="sm"
                  />
                ) : !drawn && drawMode === "system" ? (
                  <button
                    onClick={() => drawCard(pos.index)}
                    className="w-20 h-32 rounded-lg border-2 border-dashed border-mystic-veil hover:border-mystic-gold/50 flex items-center justify-center transition-colors"
                  >
                    <span className="text-mystic-star/30 text-xs">
                      点击抽牌
                    </span>
                  </button>
                ) : !drawn?.revealed && drawMode === "system" ? (
                  <div
                    onClick={() => revealCard(pos.index)}
                    className="cursor-pointer"
                  >
                    <div className="w-20 h-32 rounded-lg border-2 border-mystic-gold/30 bg-gradient-to-b from-mystic-deep to-mystic-veil flex items-center justify-center hover:border-mystic-gold/60 transition-colors">
                      <span className="text-mystic-gold text-lg">✦</span>
                    </div>
                  </div>
                ) : drawMode === "manual" ? (
                  <div
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      const cardId =
                        event.dataTransfer.getData("text/plain") ||
                        draggingCardId;
                      if (cardId) assignManualCard(pos.index, cardId);
                      setDraggingCardId(null);
                    }}
                    className={`w-24 rounded-xl border border-dashed p-2 transition-colors ${
                      drawn
                        ? "border-mystic-gold/40 bg-mystic-deep/40"
                        : "border-mystic-veil bg-mystic-void/20 hover:border-mystic-gold/40"
                    }`}
                  >
                    {drawn ? (
                      <div className="space-y-2">
                        <div className="flex justify-center">
                          <TarotCard
                            card={drawn.card}
                            orientation={drawn.orientation}
                            size="sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <button
                            onClick={() =>
                              updateManualOrientation(pos.index, "upright")
                            }
                            className={`rounded px-1 py-1 text-[10px] ${
                              drawn.orientation === "upright"
                                ? "bg-mystic-gold text-mystic-void"
                                : "border border-mystic-veil text-mystic-star/70"
                            }`}
                          >
                            正位
                          </button>
                          <button
                            onClick={() =>
                              updateManualOrientation(pos.index, "reversed")
                            }
                            className={`rounded px-1 py-1 text-[10px] ${
                              drawn.orientation === "reversed"
                                ? "bg-mystic-gold text-mystic-void"
                                : "border border-mystic-veil text-mystic-star/70"
                            }`}
                          >
                            逆位
                          </button>
                        </div>
                        <button
                          onClick={() => clearManualCard(pos.index)}
                          className="w-full rounded border border-mystic-veil px-1 py-1 text-[10px] text-mystic-star/70 hover:border-mystic-glow"
                        >
                          清空
                        </button>
                      </div>
                    ) : (
                      <div className="flex h-32 flex-col items-center justify-center gap-2 text-center">
                        <span className="text-xs text-mystic-star/35">
                          拖一张牌到这里
                        </span>
                        <span className="text-[10px] text-mystic-star/25">
                          默认正位，可再切换
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <TarotCard
                    card={drawn.card}
                    orientation={drawn.orientation}
                    size="sm"
                  />
                )}

                {drawn?.revealed && (
                  <div className="text-center">
                    <div className="text-[10px] text-mystic-moon">
                      {drawn.card.name}
                    </div>
                    <div className="text-[8px] text-mystic-star/40">
                      {drawn.orientation === "upright" ? "正位" : "逆位"}
                    </div>
                  </div>
                )}

                <p className="text-[9px] text-mystic-star/40 text-center max-w-[100px]">
                  {pos.description.slice(0, 30)}...
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {drawMode === "manual" && (
        <div className="mb-6 rounded-xl border border-mystic-veil bg-mystic-deep/30 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-heading text-mystic-gold">手动选牌牌库</h3>
              <p className="mt-1 text-xs text-mystic-star/60">
                拖动卡牌到上方牌位，也可以先筛选再放入。
              </p>
            </div>
            <input
              type="text"
              value={cardSearch}
              onChange={(event) => setCardSearch(event.target.value)}
              placeholder="搜索牌名"
              className="w-44 rounded border border-mystic-veil bg-mystic-void/50 px-3 py-2 text-sm text-mystic-moon focus:outline-none focus:border-mystic-glow placeholder:text-mystic-star/30"
            />
          </div>

          <div className="grid max-h-[28rem] grid-cols-3 gap-3 overflow-y-auto pr-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {filteredCards.map((card) => {
              const alreadyUsed = usedCardIds.includes(card.id);
              return (
                <div
                  key={card.id}
                  draggable={!alreadyUsed}
                  onDragStart={(event) => {
                    if (alreadyUsed) {
                      event.preventDefault();
                      return;
                    }
                    event.dataTransfer.setData("text/plain", card.id);
                    setDraggingCardId(card.id);
                  }}
                  onDragEnd={() => setDraggingCardId(null)}
                  className={`rounded-lg border p-2 transition-colors ${
                    alreadyUsed
                      ? "border-mystic-veil/40 bg-mystic-void/20 opacity-45"
                      : "border-mystic-veil bg-mystic-void/10 hover:border-mystic-gold/40"
                  }`}
                >
                  <div className="flex justify-center">
                    <TarotCard card={card} size="sm" />
                  </div>
                  <div className="mt-2 text-center text-[10px] text-mystic-star/70">
                    {card.name}
                  </div>
                  {!alreadyUsed && (
                    <div className="mt-2 space-y-1">
                      {spread.positions.map((pos) => (
                        <button
                          key={`${card.id}-${pos.index}`}
                          onClick={() => assignManualCard(pos.index, card.id)}
                          className="w-full rounded border border-mystic-veil px-2 py-1 text-[10px] text-mystic-star/70 hover:border-mystic-glow"
                        >
                          放入{pos.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Story Guide + Analysis (after all revealed) */}
      {allRevealed && (
        <div className="space-y-4">
          {/* Card summary */}
          <div className="bg-mystic-deep/50 rounded-lg p-5 border border-mystic-veil">
            <h3 className="text-sm font-heading text-mystic-gold mb-3">
              牌面总览
            </h3>
            <div className="space-y-2">
              {spread.positions.map((pos) => {
                const drawn = drawnCards[pos.index];
                if (!drawn?.revealed) return null;
                return (
                  <div
                    key={pos.index}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="text-mystic-gold/60 font-heading text-xs min-w-[60px]">
                      {pos.label}：
                    </span>
                    <span className="text-mystic-star">
                      {drawn.card.name}（
                      {drawn.orientation === "upright" ? "正位" : "逆位"}）—{" "}
                      {(drawn.orientation === "upright"
                        ? drawn.card.keywords.upright
                        : drawn.card.keywords.reversed
                      ).join("、")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* My notes */}
          <div className="bg-mystic-deep/50 rounded-lg p-5 border border-mystic-veil">
            <h3 className="text-sm font-heading text-mystic-gold mb-2">
              我的解读
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="写下你对这次牌阵的解读..."
              className="w-full h-24 bg-mystic-void/50 border border-mystic-veil rounded p-3 text-mystic-moon text-sm resize-none focus:outline-none focus:border-mystic-glow placeholder:text-mystic-star/30"
            />
          </div>

          {/* AI Analysis Section */}
          {analysisStep === "idle" && (
            <button
              onClick={startAnalysis}
              className="w-full py-3 bg-gradient-to-r from-mystic-glow/80 to-purple-600/80 hover:from-mystic-glow hover:to-purple-600 text-white rounded-lg text-sm font-heading transition-all"
            >
              ✦ AI 牌阵解读
            </button>
          )}

          {analysisStep === "form" && (
            <div className="bg-mystic-deep/50 rounded-lg p-5 border border-mystic-glow/30">
              <h3 className="text-sm font-heading text-mystic-gold mb-4">
                ✦ AI 解读 — 填写你的信息
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-mystic-star/70 block mb-1">
                    你的问题 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="例如：我和他的关系接下来会怎样发展？"
                    className="w-full bg-mystic-void/50 border border-mystic-veil rounded px-3 py-2 text-mystic-moon text-sm focus:outline-none focus:border-mystic-glow placeholder:text-mystic-star/30"
                  />
                </div>
                <div>
                  <label className="text-xs text-mystic-star/70 block mb-1">
                    你的直觉（看到牌后的第一感受）
                  </label>
                  <textarea
                    value={intuition}
                    onChange={(e) => setIntuition(e.target.value)}
                    placeholder="例如：感觉整体偏积极，但中间那张牌让我有点不安..."
                    rows={2}
                    className="w-full bg-mystic-void/50 border border-mystic-veil rounded px-3 py-2 text-mystic-moon text-sm resize-none focus:outline-none focus:border-mystic-glow placeholder:text-mystic-star/30"
                  />
                </div>
                <div>
                  <label className="text-xs text-mystic-star/70 block mb-1">
                    背景补充（可选）
                  </label>
                  <textarea
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    placeholder="例如：我们认识三个月，最近联系变少了..."
                    rows={2}
                    className="w-full bg-mystic-void/50 border border-mystic-veil rounded px-3 py-2 text-mystic-moon text-sm resize-none focus:outline-none focus:border-mystic-glow placeholder:text-mystic-star/30"
                  />
                </div>
                <div className="rounded-lg border border-mystic-gold/20 bg-mystic-void/20 p-3">
                  <div className="mb-2 text-xs text-mystic-gold/80">
                    即将发送的牌面信息
                  </div>
                  <div className="space-y-1 text-xs text-mystic-star/75">
                {(spread.positions ?? []).map((pos) => {
                      const drawn = drawnCards[pos.index];
                      if (!drawn?.revealed) return null;
                      return (
                        <div key={`preview-${pos.index}`}>
                          {pos.label}：{drawn.card.name}（
                          {drawn.orientation === "upright" ? "正位" : "逆位"}）
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="rounded-lg border border-mystic-veil bg-mystic-void/30 p-3">
                  <div className="mb-1 text-xs text-mystic-star/70">
                    发送给 Gemini 的内容预览
                  </div>
                  <pre className="whitespace-pre-wrap text-xs leading-relaxed text-mystic-star/80 font-sans">
                    {promptPreview || "填写问题后，这里会显示最终发送给 Gemini 的整理内容。"}
                  </pre>
                </div>
                <div className="text-xs text-mystic-star/55">
                  当前模型：
                  {" "}
                  {GEMINI_MODELS.find((model) => model.id === selectedModel)
                    ?.label ?? selectedModel}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={submitAnalysis}
                    disabled={!question.trim()}
                    className="flex-1 py-2.5 bg-gradient-to-r from-mystic-glow/80 to-purple-600/80 hover:from-mystic-glow hover:to-purple-600 text-white rounded text-sm font-heading transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    开始解读
                  </button>
                  <button
                    onClick={() => setAnalysisStep("idle")}
                    className="px-4 py-2.5 border border-mystic-veil text-mystic-star rounded text-sm hover:border-mystic-glow"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}

          {(analysisStep === "loading" || analysisStep === "done") &&
            analysisResult && (
              <div className="bg-mystic-deep/50 rounded-lg p-5 border border-mystic-glow/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-heading text-mystic-gold">
                    ✦ AI 解读结果
                  </h3>
                  {analysisStep === "loading" && (
                    <span className="text-xs text-mystic-star/50 animate-pulse">
                      解读中...
                    </span>
                  )}
                </div>
                <div className="prose prose-invert prose-sm max-w-none text-mystic-star/90 leading-relaxed whitespace-pre-wrap">
                  {analysisResult}
                </div>
                {analysisStep === "done" && (
                  <div className="mt-4 pt-3 border-t border-mystic-veil flex gap-2">
                    <button
                      onClick={() => setAnalysisStep("form")}
                      className="px-3 py-1.5 border border-mystic-veil text-mystic-star/70 rounded text-xs hover:border-mystic-glow"
                    >
                      重新提问
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(analysisResult);
                      }}
                      className="px-3 py-1.5 border border-mystic-veil text-mystic-star/70 rounded text-xs hover:border-mystic-glow"
                    >
                      复制结果
                    </button>
                  </div>
                )}
              </div>
            )}

          {analysisStep === "loading" && !analysisResult && (
            <div className="bg-mystic-deep/50 rounded-lg p-8 border border-mystic-glow/30 text-center">
              <div className="text-mystic-gold animate-pulse text-lg mb-2">
                ✦
              </div>
              <p className="text-mystic-star/60 text-sm">
                正在连接 Gemini，解读你的牌阵...
              </p>
            </div>
          )}

          {analysisStep === "error" && (
            <div className="bg-mystic-deep/50 rounded-lg p-5 border border-red-500/30">
              <h3 className="text-sm font-heading text-red-400 mb-2">
                解读失败
              </h3>
              <p className="text-mystic-star/70 text-sm mb-3">
                {analysisError}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={submitAnalysis}
                  className="px-4 py-1.5 bg-mystic-glow text-white rounded text-xs hover:bg-mystic-glow/80"
                >
                  重试
                </button>
                <button
                  onClick={() => setAnalysisStep("form")}
                  className="px-4 py-1.5 border border-mystic-veil text-mystic-star rounded text-xs hover:border-mystic-glow"
                >
                  返回修改
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gesture card drawer overlay */}
      {gestureTargetPos !== null && (
        <GestureCardDrawer
          availableCards={tarotCards.filter((c) => !usedCardIds.includes(c.id))}
          reversalMode={reversalMode}
          positionLabel={spread.positions[gestureTargetPos]?.label ?? ""}
          onCardDrawn={(card, orientation) => {
            setDrawnCards((prev) => {
              const next = [...prev];
              next[gestureTargetPos] = { card, orientation, revealed: true };
              return next;
            });
            setGestureTargetPos(null);
          }}
          onClose={() => setGestureTargetPos(null)}
        />
      )}
    </div>
  );
}
