import { memo, useMemo } from "react";

import { Detail, getPreferenceValues, showToast, Toast } from "@raycast/api";

import { useGenerateText } from "../hooks/ai";
import { useRenderPrompt } from "../hooks/templates";
import { PromptTemplate } from "../types";
import { getPromptOptions } from "../utils/templates";


export function PromptRunner({ template }: {
  template: PromptTemplate
}) {
  const {prompt, isLoading: isLoadingPrompt, error: promptError} = useRenderPrompt(template);
  // console.log('prompt:', prompt.slice(0, 100))

  const options = useMemo(() => getPromptOptions(template), [template]);
  const pref = getPreferenceValues<ExtensionPreferences>();

  const { text, error, isLoading } = useGenerateText(
    prompt,
    template.provider || pref.defaultProvider,
    template.model || pref.defaultModel,
    options,
    {
      onStart: () => {
        showToast({
          style: Toast.Style.Animated,
          title: "Generating text",
        })
      },
      onError: (error) => {
        showToast({
          style: Toast.Style.Failure,
          title: "Error",
          message: `Error generating text: ${error.message}`,
        })
      },
      onFinish: (usage) => {
        console.log('Usage', usage);
        showToast({
          style: Toast.Style.Success,
          title: "Text generated",
          message: `Tokens: P=${usage.promptTokens} C=${usage.completionTokens}`,
        })
      }
    }
  );

  if (promptError) {
    return <Detail markdown={`Error rendering prompt: ${promptError}`} />;
  }

  return(
    <Detail
      markdown={error ? text + formatError(error) : text}
      isLoading={isLoadingPrompt || isLoading}
    />
  )
}


function formatError(error: Error): string {
  return `\n\n> Error: ${error.message}`;
}

export const PromptRunnerMemo = memo(PromptRunner);
