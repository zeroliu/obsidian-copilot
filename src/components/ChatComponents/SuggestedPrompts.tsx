import { ChainType } from "@/chainFactory";
import { Card, CardItem } from "@/components/ChatComponents/Card";
import { ClipboardPaste, MessageSquare } from "lucide-react";
import React, { useMemo } from "react";

interface NotePrompt {
  title: string;
  prompts: string[];
}
const SUGGESTED_PROMPTS: Record<string, NotePrompt> = {
  activeNote: {
    title: "Active Note Insights",
    prompts: [
      `Provide three follow-up questions worded as if I'm asking you based on {activeNote}?`,
      `What key questions does {activeNote} answer?`,
      `Give me a quick recap of {activeNote} in two sentences.`,
    ],
  },
  quoteNote: {
    title: "Note Link Chat",
    prompts: [
      `Based on [[<note>]], what improvements should we focus on next?`,
      `Summarize the key points from [[<note>]].`,
      `Summarize the recent updates from [[<note>]].`,
      `Roast my writing in [[<note>]] and give concrete actionable feedback`,
    ],
  },
  fun: {
    title: "Test LLM",
    prompts: [
      `9.11 and 9.8, which is bigger?`,
      `What's the longest river in the world?`,
      `If a lead ball and a feather are dropped simultaneously from the same height, which will reach the ground first?`,
    ],
  },
  qaVault: {
    title: "Vault Q&A",
    prompts: [
      `What insights can I gather about <topic> from my notes?`,
      `Explain <concept> based on my stored notes.`,
      `Highlight important details on <topic> from my notes.`,
      `Based on my notes on <topic>, what is the question that I should be asking, but am not?`,
    ],
  },
};

const PROMPT_KEYS: Record<ChainType, Array<keyof typeof SUGGESTED_PROMPTS>> = {
  [ChainType.LLM_CHAIN]: ["activeNote", "quoteNote", "fun"],
  [ChainType.VAULT_QA_CHAIN]: ["qaVault", "qaVault", "quoteNote"],
  [ChainType.COPILOT_PLUS_CHAIN]: ["activeNote", "quoteNote", "fun"],
};

function getRandomPrompt(chainType: ChainType = ChainType.LLM_CHAIN) {
  const keys = PROMPT_KEYS[chainType] || PROMPT_KEYS[ChainType.LLM_CHAIN];

  // For repeated keys, shuffle once and take multiple items
  const shuffledPrompts: Record<string, string[]> = {};

  return keys.map((key) => {
    if (!shuffledPrompts[key]) {
      shuffledPrompts[key] = [...SUGGESTED_PROMPTS[key].prompts].sort(() => Math.random() - 0.5);
    }
    return {
      title: SUGGESTED_PROMPTS[key].title,
      text: shuffledPrompts[key].pop() || SUGGESTED_PROMPTS[key].prompts[0],
    };
  });
}

interface SuggestedPromptsProps {
  onClick: (text: string) => void;
  chainType: ChainType;
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ chainType, onClick }) => {
  const prompts = useMemo(() => getRandomPrompt(chainType), [chainType]);
  return (
    <Card title="Suggested Prompts">
      {prompts.map((prompt, i) => (
        <CardItem
          key={i}
          onClick={() => onClick(prompt.text)}
          leftIcon={<MessageSquare size={16} />}
          rightIcon={<ClipboardPaste size={16} />}
          isLast={i === prompts.length - 1}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <b style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{prompt.title}</b>
            <div style={{ whiteSpace: "normal" }}>{prompt.text}</div>
          </div>
        </CardItem>
      ))}
    </Card>
  );
};
