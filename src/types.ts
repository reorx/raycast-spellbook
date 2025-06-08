/* prompt template */

interface PromptTemplateBase {
  name: string
  content: string
  provider?: string
  model?: string
}

export interface PromptOptions {
  reasoning?: boolean
  temperature?: number
  maxTokens?: number
}

export type PromptTemplate = PromptTemplateBase & PromptOptions & {
  path: string
  argumentKeys: string[]
}

export type PromptTemplateFormValues = PromptTemplateBase & PromptOptions & {
  // NOTE workaround for Form has no support for number fields
  temperatureString?: string
  maxTokensString?: string
}
