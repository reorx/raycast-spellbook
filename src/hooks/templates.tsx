import { useState, useEffect, useRef } from "react";

import { BrowserExtension, Clipboard, getSelectedText } from "@raycast/api";

import { PromptTemplate } from "../types";
import { getPromptTemplates, renderPrompt } from "../utils/templates";


export function usePromptTemplates(dir: string) {
  const [templates, setTemplates] = useState<PromptTemplate[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  // use this to trigger a re-fetch of the templates
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

/*
export function usePromptTemplate(dir: string, name: string) {
  const [template, setTemplate] = useState<PromptTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // do nothing if no name is provided
    if (!name) return;

    (async () => {
      setIsLoading(true);
      try {
        const template = await getPromptTemplate(dir, name)
        setTemplate(template)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [dir, name])

  return {template, isLoading, error}
}
*/

export function useRenderPrompt(promptTemplate: PromptTemplate) {
  const [prompt, setPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const hasRun = useRef(false);

  const processRenderPrompt = async () => {
    const args: Record<string, string> = {};

    let err: Error | null = null;
    for (const key of promptTemplate.argumentKeys) {
      try {
        let value: string | null = null;
        switch (key) {
          case "browser-tab":
            value = await BrowserExtension.getContent({
              format: "markdown",
            })
            break;
          case "selection":
            // console.log('Getting selection');
            // Currently there's a bug in Raycast where getSelectedText() returns clipboard text the first time it's called in useEffect, then throws an error the second time if there's no text selected.
            // although calling useEffect twice is probably caused by StrictMode, this bug makes development quite difficult.
            value = await getSelectedText()
            // Found a workaround from raycast chatgpt plugin, but it doesn't work any better.
            break;
          case "clipboard":
            value = await Clipboard.readText() || ''
            break;
          default:
            value = "";
            break;
        }
        args[key] = value;
      } catch (_err) {
        err = _err as Error
        break
      }
    }
    setPrompt(err ? '' : renderPrompt(promptTemplate, args));
    setError(err);
    setIsLoading(false);
  }

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    processRenderPrompt();
  }, [promptTemplate])


  return {prompt, isLoading, error}
}
