import { readFileSync } from "fs";
import { readdir, readFile, writeFile, rename } from "fs/promises";
import path from "path";

import { PromptTemplate, PromptTemplateFormValues, PromptOptions } from "../types";


export async function getPromptTemplates(dir: string): Promise<PromptTemplate[]> {
  const files = await readdir(dir)

  const templatesPromises = []
  for (const file of files) {
    if (!file.endsWith('.md')) continue
    const filePath = path.join(dir, file)
    templatesPromises.push(
      readPromptTemplate(filePath)
    )
  }
  return Promise.all(templatesPromises)
}

export function getPromptTemplateSync(dir: string, name: string): PromptTemplate {
  const filePath = path.join(dir, `${name}.md`)
  return readPromptTemplateSync(filePath)
}

export function parseFrontmatter(frontmatterText: string): Record<string, string> {
  const frontmatter: Record<string, string> = {}
  const lines = frontmatterText.split('\n')

  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim()
      const value = line.slice(colonIndex + 1).trim()
      frontmatter[key] = value
    }
  }

  return frontmatter
}

export function createFrontmatterContent(frontmatter: Record<string, string|boolean|number|undefined>): string {
  if (!frontmatter.provider && !frontmatter.model) {
    return ''
  }

  let content = '---\n'
  for (const [key, value] of Object.entries(frontmatter)) {
    if (value !== undefined) {
      content += `${key}: ${value}\n`
    }
  }
  content += '---\n'

  return content
}

export function parseArgumentKeys(content: string): string[] {
  // use regex to find all {argument-key} in the content
  const argumentKeys = content.match(/\{([^}]+)\}/g)
  return argumentKeys?.map(key => key.slice(1, -1)) || []
}

export async function readPromptTemplate(filePath: string): Promise<PromptTemplate> {
  const rawContent = await readFile(filePath, 'utf8')
  return parsePromptTemplate(filePath, rawContent)
}

export function readPromptTemplateSync(filePath: string): PromptTemplate {
  const rawContent = readFileSync(filePath, 'utf8')
  return parsePromptTemplate(filePath, rawContent)
}

export function parsePromptTemplate(filePath: string, rawContent: string): PromptTemplate {
  let content = rawContent
  let frontmatter: Record<string, string> = {}

  // Check for frontmatter
  if (rawContent.startsWith('---\n')) {
    const endIndex = rawContent.indexOf('\n---\n', 4)
    if (endIndex !== -1) {
      const frontmatterText = rawContent.slice(4, endIndex)
      content = rawContent.slice(endIndex + 5) // Skip the closing ---\n

      frontmatter = parseFrontmatter(frontmatterText)
    }
  }
  // trim content
  content = content.trim()

  // check for argument keys
  const argumentKeys = parseArgumentKeys(content)

  return {
    name: path.parse(filePath).name,
    content,
    path: filePath,
    argumentKeys,
    provider: frontmatter.provider || '',
    model: frontmatter.model || '',
    ...frontmatter,
  }
}

export function getSubtitle(template: PromptTemplate): string {
  return `${template.provider || 'Default provider'} • ${template.model || 'Default model'}`
}

export async function createOrUpdatePromptTemplate(
  templateData: PromptTemplateFormValues,
  initialValues: PromptTemplateFormValues,
  dir: string
): Promise<void> {
  console.log('Creating or updating template:', templateData)
  const filePath = path.join(dir, `${templateData.name}.md`)

  if (initialValues.name && templateData.name !== initialValues.name) {
    // move the file
    const oldFilePath = path.join(dir, `${initialValues.name}.md`)
    await rename(oldFilePath, filePath)
  }

  const frontmatterContent = createFrontmatterContent({
    provider: templateData.provider,
    model: templateData.model,
    temperature: templateData.temperatureString,
    reasoning: templateData.reasoning,
    maxTokens: templateData.maxTokensString,
  })

  const fileContent = frontmatterContent + '\n' + templateData.content

  await writeFile(filePath, fileContent, 'utf8')
}

export function toPromptTemplateFormValues(template: PromptTemplate): PromptTemplateFormValues {
  return {
    name: template.name,
    content: template.content,
    provider: template.provider,
    model: template.model,
    reasoning: template.reasoning,
    temperatureString: template.temperature?.toString() || '',
    maxTokensString: template.maxTokens?.toString() || '',
  }
}

export const defaultPromptTemplate: PromptTemplate = {
    name: '',
    content: '',
    path: '',
    argumentKeys: [],
}

export function renderPrompt(template: PromptTemplate, variables?: Record<string, string>): string {
  let prompt = template.content
  if (variables) {
    for (const [key, value] of Object.entries(variables)) {
      prompt = prompt.replace(`{${key}}`, value)
    }
  }
  return prompt
}

export function getPromptOptions(template: PromptTemplate): PromptOptions {
  return {
    temperature: template.temperature,
    reasoning: template.reasoning,
    maxTokens: template.maxTokens,
  }
}
