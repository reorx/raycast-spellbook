export interface PromptTemplate {
  name: string
  content: string
  path: string
  provider: string
  model: string
}

export interface Frontmatter {
  provider?: string
  model?: string
}

export type PromptTemplateFormValues = Omit<PromptTemplate, 'path'>
