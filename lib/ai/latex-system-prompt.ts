import { readFileSync } from 'fs';
import { join } from 'path';

let systemPromptCache: string | null = null;
let knowledgeBaseCache: string | null = null;

function getSystemPromptGuide(): string {
  if (!systemPromptCache) {
    systemPromptCache = readFileSync(
      join(process.cwd(), 'lib', 'ai', 'system-prompt.md'),
      'utf-8'
    );
  }
  return systemPromptCache;
}

function getKnowledgeBase(): string {
  if (!knowledgeBaseCache) {
    knowledgeBaseCache = readFileSync(
      join(process.cwd(), 'lib', 'ai', 'latex-knowledge.md'),
      'utf-8'
    );
  }
  return knowledgeBaseCache;
}

export function buildSystemPrompt(documentContent?: string): string {
  const guide = getSystemPromptGuide();
  const knowledge = getKnowledgeBase();

  const documentSection = documentContent?.trim()
    ? `
## Documento Atual do Usuário

O usuário está editando o seguinte documento LaTeX. Use este contexto para gerar código compatível, detectar erros, e entender quais pacotes já estão carregados.

\`\`\`latex
${documentContent}
\`\`\`
`
    : `
## Documento Atual do Usuário

O documento está vazio. O usuário provavelmente quer começar um novo documento — ofereça um template completo se fizer sentido.
`;

  return `${guide}

${documentSection}

## Referência LaTeX

Use a referência abaixo para responder perguntas sobre pacotes, comandos, ambientes e boas práticas.

${knowledge}
`;
}
