import { Card, CardItem } from "@/components/ChatComponents/Card";
import { useLoadSimilarNotes } from "@/hooks/useSimilarNotes";
import ChatModelManager from "@/LLMProviders/chatModelManager";
import VectorStoreManager from "@/VectorStoreManager";
import { ExternalLink, RotateCcw, ScrollText } from "lucide-react";
import { Vault, Workspace } from "obsidian";
import React, { ReactElement } from "react";

interface SimilarNoteProps {
  title: string;
  score: number;
  path: string;
  onClick: () => void;
  content: string;
  isLast?: boolean;
}

export function SimilarNoteCard({
  title,
  score,
  path,
  onClick,
  content,
  isLast,
}: SimilarNoteProps) {
  return (
    <CardItem
      leftIcon={<ScrollText size={16} style={{ color: "var(--text-muted)" }} />}
      rightIcon={<ExternalLink size={16} />}
      isLast={isLast}
      onClick={onClick}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <b style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{title}</b>
          <div style={{ fontSize: "0.8rem", color: "var(--text-success)" }}>
            {(score * 100).toFixed(0)}% match
          </div>
        </div>
        <div
          style={{
            width: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {content}
        </div>
        <div
          style={{
            width: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: "var(--text-muted)",
          }}
        >
          {path}
        </div>
      </div>
    </CardItem>
  );
}

interface SimilarNotesContentProps {
  similarNotes: SimilarNoteProps[];
  onClick: () => void;
  loading: boolean;
  error: string | null;
}

function SimilarNotesContent({
  similarNotes,
  onClick,
  loading,
  error,
}: SimilarNotesContentProps): ReactElement {
  if (loading) {
    return <div>Loading</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (similarNotes.length === 0) {
    return <div>No similar notes found</div>;
  }

  return (
    <>
      {similarNotes.map((note, i) => (
        <SimilarNoteCard
          key={i}
          {...note}
          isLast={i === similarNotes.length - 1}
          onClick={onClick}
        />
      ))}
    </>
  );
}

interface SimilarNotesProps {
  workspace: Workspace;
  vault: Vault;
  chatModelManager: ChatModelManager;
  vectorStoreManager: VectorStoreManager;
  debug: boolean;
}

export function SimilarNotes({
  workspace,
  vault,
  chatModelManager,
  vectorStoreManager,
  debug,
}: SimilarNotesProps) {
  const { loading, error, similarNotes, trigger, triggered, queriedActiveFile } =
    useLoadSimilarNotes({
      workspace,
      vault,
      chatModelManager,
      vectorStoreManager,
      debug,
    });

  return (
    <Card
      title="Similar Notes"
      description={queriedActiveFile}
      cta={
        <button onClick={trigger} className="clickable-icon" title="Refresh similar notes">
          <RotateCcw size={16} />
        </button>
      }
    >
      <div
        style={{
          maxHeight: similarNotes.length > 0 ? "20rem" : undefined,
          minHeight: "5rem",
          overflow: "auto",
        }}
        className="similar-notes-content"
      >
        {!triggered ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <button onClick={trigger}>Find Similar Notes</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <SimilarNotesContent
              onClick={() => {}}
              similarNotes={similarNotes.map((note) => ({
                ...note,
                onClick: () => {},
              }))}
              loading={loading}
              error={error}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
