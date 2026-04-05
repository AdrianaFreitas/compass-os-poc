'use server'

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic() // reads ANTHROPIC_API_KEY automatically

export interface LexArchResult {
  layer: string
  constituent: string
  controlName: string
  controlObjective: string
  technicalSafeguards: string[]
  eoeItems: string[]
  poeItems: string[]
  maturityLevel: 'ML-2' | 'ML-3'
  thesisRef: string
  owaspRef: string
  jurisdictionMapping: string[]
}

export async function compileArticle(articleText: string): Promise<LexArchResult> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are LexArch, a regulatory compliance mapping expert. Map the following regulatory article to the COMPASS AI governance framework.

ARTICLE TEXT:
${articleText}

Respond ONLY with valid JSON matching this exact structure:
{
  "layer": "training|model|rag|orchestration|runtime",
  "constituent": "data_governance|model_security|output_integrity|human_oversight|ethics_fairness",
  "controlName": "5-8 word title for the control",
  "controlObjective": "One sentence describing what this control achieves",
  "technicalSafeguards": ["safeguard 1", "safeguard 2", "safeguard 3"],
  "eoeItems": ["Evidence of Existence item 1", "Evidence of Existence item 2"],
  "poeItems": ["Proof of Execution item 1 (monthly/quarterly/annually)", "Proof of Execution item 2 (frequency)"],
  "maturityLevel": "ML-2 or ML-3",
  "thesisRef": "ISO/standard/article reference",
  "owaspRef": "§x.x format or empty string",
  "jurisdictionMapping": ["EU", "US", "CN"] (include only applicable ones)
}`
      }
    ]
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude API')
  }

  const jsonMatch = content.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No JSON found in Claude response')
  }

  return JSON.parse(jsonMatch[0]) as LexArchResult
}
