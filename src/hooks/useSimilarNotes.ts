import { useCallback, useState } from "react";
import { search } from "@orama/orama";
import { HybridRetriever } from "@/search/hybridRetriever";
import { TFile, Vault, Workspace } from "obsidian";
import ChatModelManager from "@/LLMProviders/chatModelManager";
import VectorStoreManager from "@/VectorStoreManager";
import { Embeddings } from "@langchain/core/embeddings";
import { CHUNK_SIZE } from "@/constants";

interface SimilarNote {
  title: string;
  content: string;
  path: string;
  score: number;
}

interface Props {
  workspace: Workspace;
  vault: Vault;
  chatModelManager: ChatModelManager;
  vectorStoreManager: VectorStoreManager;
  debug: boolean;
}

type SimilarNotesError = "INDEX_NOT_FOUND" | "NO_ACTIVE_FILE";

export function useLoadSimilarNotes({
  workspace,
  vault,
  chatModelManager,
  vectorStoreManager,
  debug,
}: Props) {
  const [triggered, setTriggered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SimilarNotesError | null>(null);
  const [similarNotes, setSimilarNotes] = useState<SimilarNote[]>([]);
  const [queriedActiveFile, setQueriedActiveFile] = useState<string | null>(null);

  const trigger = useCallback(async () => {
    setTriggered(true);
    const activeFile = workspace.getActiveFile();
    if (!activeFile) return;

    setLoading(true);
    setQueriedActiveFile(activeFile.path);
    const [error, similarNotes] = await findSimilarNotes(
      vault,
      chatModelManager,
      vectorStoreManager,
      activeFile,
      debug
    );
    setError(error);
    setSimilarNotes(similarNotes);
    setLoading(false);
  }, [chatModelManager, debug, vault, vectorStoreManager, workspace]);

  return {
    trigger,
    loading,
    error,
    similarNotes,
    triggered,
    queriedActiveFile,
  };
}

async function findSimilarNotes(
  vault: Vault,
  chatModelManager: ChatModelManager,
  vectorStoreManager: VectorStoreManager,
  activeFile: TFile,
  debug: boolean
): Promise<[SimilarNotesError | null, SimilarNote[]]> {
  const content = await vault.cachedRead(activeFile);
  const activeFilePath = activeFile.path;
  await vectorStoreManager.waitForInitialization();
  const db = vectorStoreManager.getDb();

  const singleDoc = await search(db, {
    term: "",
    limit: 1,
  });

  if (singleDoc.hits.length === 0) {
    return ["INDEX_NOT_FOUND", []];
  }

  const hybridRetriever = new HybridRetriever(
    db,
    vault,
    chatModelManager.getChatModel(),
    vectorStoreManager.getEmbeddingsManager().getEmbeddingsAPI() as Embeddings,
    {
      minSimilarityScore: 0.3,
      maxK: 20,
    },
    debug
  );

  const truncatedContent = content.length > CHUNK_SIZE ? content.slice(0, CHUNK_SIZE) : content;
  const similarDocs = await hybridRetriever.getRelevantDocuments(truncatedContent, {
    runName: "no_hyde",
  });
  return [
    null,
    similarDocs
      .filter((doc) => doc.metadata.path !== activeFilePath)
      .map((doc) => ({
        title: doc.metadata.title,
        content: doc.pageContent,
        path: doc.metadata.path,
        score: doc.metadata.score || 0,
      }))
      .sort((a, b) => b.score - a.score),
  ];
}
