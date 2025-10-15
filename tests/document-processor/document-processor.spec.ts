import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { DocumentProcessor } from '../../src/lib/document-processor'

const fixturePath = (fileName: string) =>
  path.join(__dirname, 'fixtures-' + fileName)

describe('DocumentProcessor.performAIExtraction', () => {
  const processor = new DocumentProcessor({ enableAdvancedFeatures: true })
  const extractor = (processor as unknown as {
    performAIExtraction: (text: string) => Promise<{ data: unknown; confidence: number }>
  }).performAIExtraction.bind(processor)

  it('extracts nafkah, mutaah and income from GU v GV judgment snippet', async () => {
    const text = fs.readFileSync(fixturePath('gu-v-gv.txt'), 'utf-8')
    const result = await extractor(text)
    const data = result.data as Record<string, unknown>
    console.log('extracted data', data)

    expect(data.nafkahIddahAmount).toBe(0)
    expect(data.mutaahLumpSum).toBe(36000)
    expect(data.mutaahAmount).toBeCloseTo(5.1, 1)
    expect(data.husbandIncome).toBeCloseTo(3183, 0)
  })

  it('derives mutaah per-day rate from lump sum when only duration sentence follows', async () => {
    const text = fs.readFileSync(fixturePath('alt-duration.txt'), 'utf-8')
    const result = await extractor(text)
    const data = result.data as Record<string, number>

    expect(data.mutaahLumpSum).toBe(25000)
    expect(data.mutaahAmount).toBeCloseTo(4.9, 1)
    expect(data.marriageDuration).toBe(170)
    expect(data.nafkahIddahAmount).toBe(0)
  })
})
