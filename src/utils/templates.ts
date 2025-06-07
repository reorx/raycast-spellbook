import { readdir, readFile, writeFile, rename } from "fs/promises";
import path from "path";

import { PromptTemplate, PromptTemplateFormValues, Frontmatter } from "../types";


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

export function createFrontmatterContent(frontmatter: Frontmatter): string {
  if (!frontmatter.provider && !frontmatter.model) {
    return ''
  }

  let content = '---\n'
  if (frontmatter.provider) {
    content += `provider: ${frontmatter.provider}\n`
  }
  if (frontmatter.model) {
    content += `model: ${frontmatter.model}\n`
  }
  content += '---\n'

  return content
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
    content: content.trim(),
    path: filePath,
    provider,
    model,
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
    model: templateData.model
  })

  const fileContent = frontmatterContent + '\n' + templateData.content

  await writeFile(filePath, fileContent, 'utf8')
}

export function initPromptTemplate(): PromptTemplateFormValues {
  return {
    name: '',
    content: '',
    model: '',
    provider: '',
  }
}
