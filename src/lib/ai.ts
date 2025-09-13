import OpenAI from 'openai'
import { AIExtractionResult } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function extractLegalData(text: string): Promise<AIExtractionResult> {
  try {
    const prompt = `
You are an advanced legal AI assistant specialized in Singapore Syariah Court case analysis for the Legal Aid Bureau (LAB). Your task is to extract financial data that will be used to update the eBantu formula calculations for nafkah iddah and mutaah.

EXTRACTION REQUIREMENTS:
1. Husband's monthly income (SGD) - Look for salary, wages, employment income
2. Nafkah iddah amount awarded (monthly SGD) - Post-divorce maintenance for 3 months
3. Mutaah amount awarded (daily SGD) - Consolatory gift
4. Marriage duration (in months) - Calculate from marriage to divorce/separation
5. Case classification flags - Identify special circumstances

LAB FORMULA CONTEXT:
- Standard Nafkah Iddah: 0.14 × husband_income + 47 (rounded to nearest hundred)
- Standard Mutaah: 0.00096 × husband_income + 0.85 (rounded to nearest integer)
- High Income Threshold: >$4,000/month requires special review
- Exclude: Consent orders, outliers, cases with extraordinary circumstances

JUDGMENT TEXT:
${text}

RESPOND IN JSON FORMAT:
{
  "husbandIncome": number | null,
  "nafkahIddah": number | null, 
  "mutaah": number | null,
  "marriageDuration": number | null,
  "confidence": number (0-1),
  "reasoning": "detailed explanation including formula verification",
  "caseClassification": {
    "isConsentOrder": boolean,
    "isHighIncome": boolean,
    "isOutlier": boolean,
    "specialCircumstances": string[]
  },
  "extractedEntities": [
    {
      "entity": "entity_name",
      "value": "extracted_value", 
      "confidence": number (0-1),
      "sourceText": "relevant quote from judgment"
    }
  ],
  "formulaVerification": {
    "nafkahIddahExpected": number,
    "mutaahExpected": number,
    "matchesFormula": boolean,
    "deviationReason": string | null
  }
}

CRITICAL INSTRUCTIONS:
- Extract only explicitly stated amounts from the judgment
- Verify against LAB formula calculations  
- Flag cases that deviate from standard formulas
- Identify consent orders (look for "parties agree", "by consent", "settlement")
- Flag high income cases (>$4,000/month)
- Note any extraordinary circumstances affecting awards
- Provide source text snippets for verification
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a legal document analysis expert specializing in Singapore Syariah Court cases. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    try {
      const result = JSON.parse(content) as AIExtractionResult
      return result
    } catch (error) {
      // If JSON parsing fails, return a basic result
      console.warn('Failed to parse AI response:', error)
      return {
        husbandIncome: null,
        nafkahIddah: null,
        mutaah: null,
        marriageDuration: null,
        confidence: 0.1,
        reasoning: 'Failed to parse AI response',
        extractedEntities: []
      }
    }
  } catch (error) {
    console.error('AI extraction error:', error)
    return {
      husbandIncome: null,
      nafkahIddah: null,
      mutaah: null,
      marriageDuration: null,
      confidence: 0,
      reasoning: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      extractedEntities: []
    }
  }
}

export async function detectConsentOrder(text: string): Promise<{ isConsentOrder: boolean; confidence: number }> {
  try {
    const prompt = `
Analyze this Singapore Syariah Court judgment to determine if it's a consent order.

Look for indicators such as:
- "consent judgment"
- "parties have agreed"
- "by consent"
- "consent order"
- "agreed terms"
- Similar phrases indicating mutual agreement

Text:
${text}

Respond with JSON only:
{
  "isConsentOrder": boolean,
  "confidence": number (0-1)
}
`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a legal document classifier. Respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 100,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return { isConsentOrder: false, confidence: 0 }
    }

    try {
      const result = JSON.parse(content)
      return {
        isConsentOrder: result.isConsentOrder || false,
        confidence: result.confidence || 0
      }
    } catch {
      return { isConsentOrder: false, confidence: 0 }
    }
  } catch (error) {
    console.error('Consent order detection error:', error)
    return { isConsentOrder: false, confidence: 0 }
  }
}

export async function summarizeCase(text: string): Promise<string> {
  try {
    const prompt = `
Provide a concise summary of this Singapore Syariah Court case, focusing on:
- Key financial details (income, maintenance amounts)
- Marriage duration
- Main legal issues
- Court's decision

Keep summary under 200 words.

Text:
${text}
`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a legal case summarizer. Provide clear, factual summaries.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 300,
    })

    return response.choices[0]?.message?.content || 'Unable to generate summary'
  } catch (error) {
    console.error('Case summarization error:', error)
    return 'Error generating summary'
  }
}