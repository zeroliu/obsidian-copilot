import { ChainType } from "@/chainFactory";
import ChatSingleMessage from "@/components/ChatComponents/ChatSingleMessage";
import { SimilarNotes } from "@/components/ChatComponents/SimilarNotes";
import { SuggestedPrompts } from "@/components/ChatComponents/SuggestedPrompts";
import { VAULT_VECTOR_STORE_STRATEGY } from "@/constants";
import ChatModelManager from "@/LLMProviders/chatModelManager";
import { ChatMessage } from "@/sharedState";
import VectorStoreManager from "@/VectorStoreManager";
import { App } from "obsidian";
import React, { useEffect, useState } from "react";

interface ChatMessagesProps {
  chatHistory: ChatMessage[];
  currentAiMessage: string;
  loading?: boolean;
  app: App;
  indexVaultToVectorStore: VAULT_VECTOR_STORE_STRATEGY;
  currentChain: ChainType;
  onInsertAtCursor: (message: string) => void;
  onRegenerate: (messageIndex: number) => void;
  onEdit: (messageIndex: number, newMessage: string) => void;
  onDelete: (messageIndex: number) => void;
  onSelectSuggestedPrompt: (prompt: string) => void;
  chatModelManager: ChatModelManager;
  vectorStoreManager: VectorStoreManager;
  debug: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  chatHistory,
  currentAiMessage,
  chatModelManager,
  vectorStoreManager,
  loading,
  currentChain,
  indexVaultToVectorStore,
  app,
  debug,
  onInsertAtCursor,
  onRegenerate,
  onEdit,
  onDelete,
  onSelectSuggestedPrompt,
}) => {
  const [loadingDots, setLoadingDots] = useState("");

  const scrollToBottom = () => {
    const chatMessagesContainer = document.querySelector(".chat-messages");
    if (chatMessagesContainer) {
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
  };

  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [loading]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (loading) {
      intervalId = setInterval(() => {
        setLoadingDots((dots) => (dots.length < 6 ? dots + "." : ""));
      }, 200);
    } else {
      setLoadingDots("");
    }
    return () => clearInterval(intervalId);
  }, [loading]);

  if (!chatHistory.filter((message) => message.isVisible).length && !currentAiMessage) {
    return (
      <div
        style={{
          width: "100%",
          flex: 1,
          display: "flex",
          justifyContent: "center",
          padding: "1rem",
          overflow: "auto",
        }}
      >
        <div
          style={{
            flexDirection: "column",
            width: "90%",
            maxWidth: "800px",
            display: "flex",
            gap: "2rem",
            margin: "auto",
          }}
        >
          <SimilarNotes
            workspace={app.workspace}
            vault={app.vault}
            chatModelManager={chatModelManager}
            vectorStoreManager={vectorStoreManager}
            debug={debug}
          />
          <SuggestedPrompts chainType={currentChain} onClick={onSelectSuggestedPrompt} />
          {currentChain === ChainType.VAULT_QA_CHAIN && (
            <div
              style={{
                border: "1px solid var(--background-modifier-border)",
                padding: "1rem",
                borderRadius: "var(--radius-s)",
              }}
            >
              Please note that this is a retrieval-based QA. Questions should contain keywords and
              concepts that exist literally in your vault
            </div>
          )}
          {currentChain === ChainType.VAULT_QA_CHAIN &&
            indexVaultToVectorStore === VAULT_VECTOR_STORE_STRATEGY.NEVER && (
              <div
                style={{
                  border: "1px solid var(--background-modifier-border)",
                  padding: "1rem",
                  borderRadius: "var(--radius-s)",
                }}
              >
                ⚠️ Your auto-index strategy is set to <b>NEVER</b>. Before proceeding, click the{" "}
                <span style={{ color: "var(--color-blue" }}>Refresh Index</span> button below or run
                the{" "}
                <span style={{ color: "var(--color-blue" }}>
                  Copilot command: Index (refresh) vault for QA
                </span>{" "}
                to update the index.
              </div>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-messages">
      {chatHistory.map(
        (message, index) =>
          message.isVisible && (
            <ChatSingleMessage
              key={index}
              message={message}
              app={app}
              isStreaming={false}
              onInsertAtCursor={() => {
                onInsertAtCursor(message.message);
              }}
              onRegenerate={() => onRegenerate(index)}
              onEdit={(newMessage) => onEdit(index, newMessage)}
              onDelete={() => onDelete(index)}
            />
          )
      )}
      {(currentAiMessage || loading) && (
        <ChatSingleMessage
          key={`ai_message_${currentAiMessage}`}
          message={{
            sender: "AI",
            message: currentAiMessage || loadingDots,
            isVisible: true,
            timestamp: null,
          }}
          app={app}
          isStreaming={true}
          onDelete={() => {}}
        />
      )}
    </div>
  );
};

export default ChatMessages;
