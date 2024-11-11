import ChainManager from "@/LLMProviders/chainManager";
import { SetChainOptions } from "@/aiParams";
import { ChainType } from "@/chainFactory";
import { BaseChatMemory } from "langchain/memory";
import { useCallback, useState } from "react";

/**
 * React hook to manage state related to model, chain and memory in Chat component.
 */
export function useAIState(
  chainManager: ChainManager
): [
  string,
  (model: string) => void,
  ChainType,
  (chain: ChainType, options?: SetChainOptions) => void,
  () => void,
] {
  const langChainParams = chainManager.getLangChainParams();
  const [currentModelKey, setCurrentModelKey] = useState<string>(langChainParams.modelKey);
  const [currentChain, setCurrentChain] = useState<ChainType>(langChainParams.chainType);
  const [, setChatMemory] = useState<BaseChatMemory | null>(chainManager.memoryManager.getMemory());

  const clearChatMemory = useCallback(() => {
    chainManager.memoryManager.clearChatMemory();
    setChatMemory(chainManager.memoryManager.getMemory());
  }, [chainManager]);

  const setModelKey = useCallback(
    (newModelKey: string) => {
      chainManager.createChainWithNewModel(newModelKey);
      setCurrentModelKey(newModelKey);
    },
    [chainManager]
  );

  const setChain = useCallback(
    (newChain: ChainType, options?: SetChainOptions) => {
      chainManager.setChain(newChain, options);
      setCurrentChain(newChain);
    },
    [chainManager]
  );

  return [currentModelKey, setModelKey, currentChain, setChain, clearChatMemory];
}
