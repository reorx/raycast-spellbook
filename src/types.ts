interface PromptTemplateBase {
  name: string
  content: string
  provider: string
  model: string
}

export type PromptTemplate = PromptTemplateBase & PromptOptions & {
  path: string
  argumentKeys: string[]
}

export interface PromptOptions {
  temperature?: number
  reasoning?: boolean
  maxTokens?: number
}

export type PromptTemplateFormValues = PromptTemplateBase & PromptOptions & {
  // NOTE workaround for Form has no support for number fields
  temperatureString?: string
  maxTokensString?: string
}
