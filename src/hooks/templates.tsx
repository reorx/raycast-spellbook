import { useState, useEffect, useRef } from "react";

import { BrowserExtension, getSelectedText } from "@raycast/api";

import { PromptTemplate } from "../types";
import { getPromptTemplates, renderPrompt } from "../utils/templates";


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

export function useRenderPrompt(promptTemplate: PromptTemplate) {
  const [prompt, setPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const processRenderPrompt = async () => {
    const args: Record<string, string> = {};

    for (const key of promptTemplate.argumentKeys) {
      switch (key) {
        case "browser-tab":
          try {
            args[key] = await BrowserExtension.getContent({
              format: "markdown",
            })
          } catch (err) {
            setError(err as Error);
            setIsLoading(false);
            return
          }
          break;
        case "selection":
          try {
            args[key] = await getSelectedText()
          } catch {
            console.info('no selection found');
            setError(new Error('No selection found'));
            setIsLoading(false);
            return
          }
          break;
        default:
          args[key] = "";
          break;
      }
    }

    setPrompt(renderPrompt(promptTemplate, args));
    setIsLoading(false);
  }

  useEffect(() => {
    processRenderPrompt();
  }, [promptTemplate])


  return {prompt, isLoading, error}
}
