import { writeFile, mkdir, rm } from "fs/promises";
import path from "path";

import { parseFrontmatter, readPromptTemplate } from "../templates";


describe('parseFrontmatter', () => {
  test('parses basic key-value pairs', () => {
    const frontmatter = `provider: openai
model: gpt-4o`;

    const result = parseFrontmatter(frontmatter);

    expect(result).toEqual({
      provider: 'openai',
      model: 'gpt-4o'
    });
  });

  test('handles empty frontmatter', () => {
    const result = parseFrontmatter('');
    expect(result).toEqual({});
  });

  test('handles frontmatter with extra whitespace', () => {
    const frontmatter = `  provider  :   openai
  model:gpt-4o   `;

    const result = parseFrontmatter(frontmatter);

    expect(result).toEqual({
      provider: 'openai',
      model: 'gpt-4o'
    });
  });

  test('ignores lines without colons', () => {
    const frontmatter = `provider: openai
this line has no colon
model: gpt-4o`;

    const result = parseFrontmatter(frontmatter);

    expect(result).toEqual({
      provider: 'openai',
      model: 'gpt-4o'
    });
  });

  test('handles values with colons', () => {
    const frontmatter = `provider: openai
url: https://api.openai.com:443/v1`;

    const result = parseFrontmatter(frontmatter);

    expect(result).toEqual({
      provider: 'openai',
      url: 'https://api.openai.com:443/v1'
    });
  });
});

describe('readPromptTemplate', () => {
  const testDir = path.join(__dirname, 'test-templates');

  beforeAll(async () => {
    await mkdir(testDir, { recursive: true });
  });

  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  test('reads template with frontmatter', async () => {
    const testFile = path.join(testDir, 'test-with-frontmatter.md');
    const content = `---
provider: openai
model: gpt-4o
---

This is the actual prompt content.
It can have multiple lines.`;

    await writeFile(testFile, content, 'utf8');

    const result = await readPromptTemplate(testFile);

    expect(result).toEqual({
      name: 'test-with-frontmatter.md',
      content: '\nThis is the actual prompt content.\nIt can have multiple lines.',
      path: testFile,
      provider: 'openai',
      model: 'gpt-4o'
    });
  });

  test('reads template without frontmatter', async () => {
    const testFile = path.join(testDir, 'test-no-frontmatter.md');
    const content = `This is a simple prompt without frontmatter.`;

    await writeFile(testFile, content, 'utf8');

    const result = await readPromptTemplate(testFile);

    expect(result).toEqual({
      name: 'test-no-frontmatter.md',
      content: 'This is a simple prompt without frontmatter.',
      path: testFile,
      provider: '',
      model: ''
    });
  });

  test('handles incomplete frontmatter (no closing delimiter)', async () => {
    const testFile = path.join(testDir, 'test-incomplete-frontmatter.md');
    const content = `---
provider: openai
model: gpt-4o

This content has frontmatter start but no closing delimiter.`;

    await writeFile(testFile, content, 'utf8');

    const result = await readPromptTemplate(testFile);

    expect(result).toEqual({
      name: 'test-incomplete-frontmatter.md',
      content: content, // Should include the whole content since frontmatter is invalid
      path: testFile,
      provider: '',
      model: ''
    });
  });

    test('handles empty frontmatter section', async () => {
    const testFile = path.join(testDir, 'test-empty-frontmatter.md');
    const content = `---
---

Just some content here.`;

    await writeFile(testFile, content, 'utf8');

    const result = await readPromptTemplate(testFile);

    expect(result).toEqual({
      name: 'test-empty-frontmatter.md',
      content: content, // Full content since frontmatter parsing fails with empty section
      path: testFile,
      provider: '',
      model: ''
    });
  });

  test('handles frontmatter with partial fields', async () => {
    const testFile = path.join(testDir, 'test-partial-frontmatter.md');
    const content = `---
provider: anthropic
description: A test prompt
---

Content here.`;

    await writeFile(testFile, content, 'utf8');

    const result = await readPromptTemplate(testFile);

    expect(result).toEqual({
      name: 'test-partial-frontmatter.md',
      content: '\nContent here.',
      path: testFile,
      provider: 'anthropic',
      model: '' // Should be empty since not specified
    });
  });
});
