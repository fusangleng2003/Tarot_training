import { useMemo, type ComponentPropsWithoutRef } from "react";
import Markdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Props {
  text: string;
  isStreaming: boolean;
}

interface ParsedSection {
  number: number;
  title: string;
  content: string;
}

interface ParsedResult {
  title: string;
  sections: ParsedSection[];
}

/* ------------------------------------------------------------------ */
/*  Section visual config                                              */
/* ------------------------------------------------------------------ */

const SECTION_META: Record<
  number,
  { icon: string; color: string; bg: string }
> = {
  1: { icon: "🃏", color: "#d4a843", bg: "rgba(212,168,67,0.06)" },
  2: { icon: "🌙", color: "#7c5cbf", bg: "rgba(124,92,191,0.06)" },
  3: { icon: "🔮", color: "#60a5fa", bg: "rgba(96,165,250,0.06)" },
  4: { icon: "🎯", color: "#e8729a", bg: "rgba(232,114,154,0.06)" },
  5: { icon: "⚡", color: "#fbbf24", bg: "rgba(251,191,36,0.06)" },
  6: { icon: "✦", color: "#d4a843", bg: "rgba(212,168,67,0.10)" },
};

const DEFAULT_META = { icon: "◇", color: "#c9b8f0", bg: "rgba(201,184,240,0.06)" };

/* ------------------------------------------------------------------ */
/*  Markdown → section parser                                          */
/* ------------------------------------------------------------------ */

function parseResult(text: string): ParsedResult {
  let title = "";
  const sections: ParsedSection[] = [];

  const lines = text.split("\n");
  let current: ParsedSection | null = null;
  let buffer: string[] = [];

  for (const line of lines) {
    // Main title: ### 解读：…
    const titleMatch = line.match(/^###\s+(.+)/);
    if (titleMatch && !title) {
      title = titleMatch[1].replace(/^解读[：:]\s*/, "").trim();
      continue;
    }

    // Section header: #### N. Title
    const secMatch = line.match(/^####\s*(\d+)\.\s*(.+)/);
    if (secMatch) {
      if (current) {
        current.content = buffer.join("\n").trim();
        sections.push(current);
      }
      current = {
        number: parseInt(secMatch[1]),
        title: secMatch[2].trim(),
        content: "",
      };
      buffer = [];
      continue;
    }

    if (current) {
      buffer.push(line);
    }
  }

  // Flush last section
  if (current) {
    current.content = buffer.join("\n").trim();
    sections.push(current);
  }

  return { title, sections };
}

/* ------------------------------------------------------------------ */
/*  Custom react-markdown components                                   */
/* ------------------------------------------------------------------ */

const mdComponents = {
  strong: ({ children }: ComponentPropsWithoutRef<"strong">) => (
    <span className="text-mystic-moon font-semibold">{children}</span>
  ),
  em: ({ children }: ComponentPropsWithoutRef<"em">) => (
    <span className="text-mystic-star italic">{children}</span>
  ),
  p: ({ children }: ComponentPropsWithoutRef<"p">) => (
    <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
  ),
  ul: ({ children }: ComponentPropsWithoutRef<"ul">) => (
    <ul className="space-y-1.5 my-2">{children}</ul>
  ),
  li: ({ children }: ComponentPropsWithoutRef<"li">) => (
    <li className="flex gap-2 text-mystic-star/90">
      <span className="text-mystic-glow/50 mt-1 shrink-0 text-[10px]">◆</span>
      <span className="flex-1">{children}</span>
    </li>
  ),
  hr: () => <div className="border-t border-mystic-veil/30 my-4" />,
};

/* ------------------------------------------------------------------ */
/*  Section card                                                       */
/* ------------------------------------------------------------------ */

function SectionCard({
  section,
  isLast,
  isStreaming,
}: {
  section: ParsedSection;
  isLast: boolean;
  isStreaming: boolean;
}) {
  const meta = SECTION_META[section.number] ?? DEFAULT_META;
  const isSummary = section.number === 6;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div
        className="rounded-lg overflow-hidden"
        style={{
          border: isSummary
            ? `2px solid ${meta.color}60`
            : `1px solid ${meta.color}25`,
          background: isSummary ? meta.bg : "rgba(26,20,53,0.35)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2.5 px-4 py-2.5"
          style={{ borderBottom: `1px solid ${meta.color}15` }}
        >
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
            style={{ background: `${meta.color}15` }}
          >
            {meta.icon}
          </span>
          <h4
            className="text-sm font-heading tracking-wide"
            style={{ color: meta.color }}
          >
            {section.title}
          </h4>
          {isLast && isStreaming && (
            <span
              className="ml-auto w-1.5 h-4 rounded-full animate-pulse"
              style={{ background: meta.color }}
            />
          )}
        </div>

        {/* Content */}
        {section.content && (
          <div className="px-4 py-3 text-sm text-mystic-star/85">
            {isSummary ? (
              <div
                className="py-3 px-4 rounded-md text-center text-[15px] leading-relaxed"
                style={{ background: `${meta.color}0c` }}
              >
                <Markdown components={mdComponents}>
                  {section.content}
                </Markdown>
              </div>
            ) : (
              <Markdown components={mdComponents}>{section.content}</Markdown>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function AnalysisResultView({ text, isStreaming }: Props) {
  const parsed = useMemo(() => parseResult(text), [text]);

  // Not enough structure yet — show raw streaming text
  if (!parsed.title && parsed.sections.length === 0) {
    return (
      <div className="text-sm text-mystic-star/85 leading-relaxed whitespace-pre-wrap">
        {text}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 ml-0.5 bg-mystic-glow rounded-full animate-pulse align-middle" />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Title */}
      {parsed.title && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-1"
        >
          <div className="flex items-center justify-center gap-3 mb-1.5">
            <span className="h-px flex-1 max-w-16 bg-gradient-to-r from-transparent to-mystic-gold/40" />
            <span className="text-mystic-gold/70 text-xs tracking-widest font-heading">
              ✦
            </span>
            <span className="h-px flex-1 max-w-16 bg-gradient-to-l from-transparent to-mystic-gold/40" />
          </div>
          <h3 className="text-base font-heading text-mystic-moon/90 tracking-wider">
            {parsed.title}
          </h3>
          <div className="flex items-center justify-center gap-3 mt-1.5">
            <span className="h-px flex-1 max-w-16 bg-gradient-to-r from-transparent to-mystic-gold/40" />
            <span className="text-mystic-gold/70 text-xs tracking-widest font-heading">
              ✦
            </span>
            <span className="h-px flex-1 max-w-16 bg-gradient-to-l from-transparent to-mystic-gold/40" />
          </div>
        </motion.div>
      )}

      {/* Section cards */}
      <AnimatePresence>
        {parsed.sections.map((section, i) => (
          <SectionCard
            key={section.number}
            section={section}
            isLast={i === parsed.sections.length - 1}
            isStreaming={isStreaming}
          />
        ))}
      </AnimatePresence>

      {/* Streaming indicator when between sections */}
      {isStreaming && parsed.sections.length > 0 && (
        <div className="flex justify-center py-2">
          <span className="text-mystic-star/30 text-xs animate-pulse">
            解读中...
          </span>
        </div>
      )}
    </div>
  );
}
