import { useState, useEffect, useRef } from "react";

import { PromptTemplate } from "../types";
import { getPromptTemplates } from "../utils/templates";


export function usePromptTemplates(dir: string) {
  const [templates, setTemplates] = useState<PromptTemplate[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [updatedAt, setUpdatedAt] = useState(0);
  const hasRunFor = useRef(-1);

  useEffect(() => {
    if (hasRunFor.current === updatedAt) return;
    hasRunFor.current = updatedAt;

    console.log("Loading prompt templates from:", dir);

    (async () => {
      try {
        const result = await getPromptTemplates(dir);
        console.log("Loaded templates:", result.length);
        setTemplates(result);
      } catch (err) {
        console.error("Failed to load templates:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [dir, updatedAt]);

  return { templates, isLoading, error, setUpdatedAt };
}
