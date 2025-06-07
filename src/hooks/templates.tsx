import { useState, useEffect, useRef } from "react";

import { readdir, readFile } from "fs/promises";
import path from "path";

import { PromptTemplate } from "../types";


async function getPromptTemplates(dir: string): Promise<PromptTemplate[]> {
  const files = await readdir(dir)
  const templates = await Promise.all(files.map(async (file) => ({
    name: file,
    content: await readFile(path.join(dir, file), 'utf8')
  })))
  return templates
}

export function usePromptTemplates(dir: string) {
  const [templates, setTemplates] = useState<PromptTemplate[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

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
  }, [dir]);

  return { templates, isLoading, error };
}
