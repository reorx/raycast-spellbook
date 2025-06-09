import { useEffect, useState } from "react";

import { AnthropicProvider } from "@ai-sdk/anthropic";
import { LanguageModelUsage, streamText } from "ai";

import { PromptOptions } from "../types";
import { getProvider } from "../utils/providers";


export function useGenerateText(
  prompt: string,
  providerName: string,
  modelName: string,
  options: PromptOptions,
  { onStart, onError, onFinish }: {
    onStart?: () => void,
    onError?: (error: Error) => void,
    onFinish?: (usage: LanguageModelUsage) => void,
  } = {},
) {
  const [text, setText] = useState<string>("");
  const [reasoning, setReasoning] = useState<string>("");
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState<LanguageModelUsage | null>(null);

  const handleStart = () => {
    setIsLoading(true);
    onStart?.();
  }

  const handleFinish = (usage: LanguageModelUsage) => {
    setUsage(usage);
    onFinish?.(usage);
  }

  const handleError = (error: Error) => {
    setError(error);
    onError?.(error);
  }

  const runStreamText = async (abortController: AbortController) => {
    console.log('Running stream text:\n', providerName, modelName, options, prompt.slice(0, 100), '...', prompt.slice(-100));
    // get model
    const provider = getProvider(providerName) as AnthropicProvider;
    const model = provider(modelName);
    // console.log('Model', model);
    // TODO: implement get provider options
    // const providerOptions = getProviderOptions(promptTemplate);

    const result = streamText({
      model,
      prompt,
      abortSignal: abortController.signal,
    });

    let _text = "";

    // https://ai-sdk.dev/docs/ai-sdk-core/generating-text#fullstream-property
    for await (const part of result.fullStream) {
      switch (part.type) {
        case 'text-delta':
          _text += part.textDelta
          setText(_text);
          break;
        case 'reasoning':
          setReasoning(part.textDelta);
          break;
        case 'finish':
          handleFinish(part.usage);
          break;
        case 'error':
          // https://ai-sdk.dev/docs/ai-sdk-core/error-handling#handling-streaming-errors-streaming-with-error-support
          handleError(part.error as Error);
          break;
      }
    }
  }

  useEffect(() => {
    const abortController = new AbortController();
    if (prompt) {
      handleStart();

      runStreamText(abortController).catch(handleError).finally(() => {
        setIsLoading(false);
      });
    }

    return () => {
      abortController.abort();
    }
  }, [prompt, options]);

  return { text, reasoning, error, usage, isLoading };
}
