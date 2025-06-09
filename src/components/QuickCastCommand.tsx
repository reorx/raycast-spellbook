import { useEffect, useMemo } from "react";

import { Detail, getPreferenceValues, LaunchProps, openCommandPreferences } from "@raycast/api";

import { PromptTemplate } from "../types";
import { getPromptTemplateSync } from "../utils/templates";
import { PromptRunner } from "./PromptRunner";


type Props = LaunchProps & {
  slotNumber: number
}

export default function QuickCastCommand({launchContext, slotNumber}: Props) {
  const openPreferences = launchContext?.openPreferences
  const {promptTemplatesDir, promptTemplateName = ''} = getPreferenceValues()

  const template = useMemo<PromptTemplate | null>(() => {
    if (!promptTemplateName) return null
    return getPromptTemplateSync(promptTemplatesDir, promptTemplateName)
  }, [promptTemplatesDir, promptTemplateName])

  useEffect(() => {
    if (openPreferences) {
      openCommandPreferences()
    }
  }, [openPreferences])

  if (openPreferences) {
    return <Detail markdown={`Opening command preferences...`} />
  }

  if (!template) {
    return <Detail markdown={`Please set a prompt template for slot ${slotNumber} in command preferences`} />
  }

  return <PromptRunner template={template} />
}
