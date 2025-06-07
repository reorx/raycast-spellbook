import { readdir, readFile } from "fs/promises";
import path from "path";

import { PromptTemplate } from "../types";


export async function getPromptTemplates(dir: string): Promise<PromptTemplate[]> {
  const files = await readdir(dir)

  const templatesPromises = []
  for (const file of files) {
    const filePath = path.join(dir, file)
    templatesPromises.push(
      readPromptTemplate(filePath)
    )
  }
  return Promise.all(templatesPromises)
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

export async function readPromptTemplate(filePath: string): Promise<PromptTemplate> {
  const rawContent = await readFile(filePath, 'utf8')

  let content = rawContent
  let provider = ''
  let model = ''

  // Check for frontmatter
  if (rawContent.startsWith('---\n')) {
    const endIndex = rawContent.indexOf('\n---\n', 4)
    if (endIndex !== -1) {
      const frontmatterText = rawContent.slice(4, endIndex)
      content = rawContent.slice(endIndex + 5) // Skip the closing ---\n

      const frontmatter = parseFrontmatter(frontmatterText)
      provider = frontmatter.provider || ''
      model = frontmatter.model || ''
    }
  }

  return {
    name: path.parse(filePath).name,
    content,
    path: filePath,
    provider,
    model,
  }
}

export function getSubtitle(template: PromptTemplate): string {
  return `${template.provider || 'Default provider'} • ${template.model || 'Default model'}`
}
