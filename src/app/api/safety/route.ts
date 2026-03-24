import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { item } = await request.json()

    if (!item || typeof item !== 'string' || !item.trim()) {
      return NextResponse.json(
        { error: 'Please provide an item to check' },
        { status: 400 }
      )
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `You are a veterinary safety expert for cats. Determine if the following item is safe for cats.

Item: ${item}

Return ONLY valid JSON (no markdown, no backticks) with this exact structure:
{
  "status": "safe" | "caution" | "toxic",
  "explanation": "2-3 sentence explanation of why this is safe/cautious/toxic for cats. Be specific.",
  "exposure_note": "If toxic or caution, provide practical advice. If safe, set to null."
}

Consider these categories:
- Plants: Many houseplants are toxic to cats (lilies are extremely dangerous, pothos, dieffenbachia, etc.)
- Foods: Onions, garlic, grapes, raisins, chocolate, caffeine, alcohol, xylitol are toxic
- Cleaning products: Chemical exposure risks vary by product
- Essential oils: Many are toxic to cats (tea tree, eucalyptus, peppermint, citrus oils, etc.)
- Medications: Most human medications are dangerous for cats

Be accurate and specific. If unsure about a specific product, err on the side of caution.`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    const cleaned = content.text.replace(/```json\n?|\n?```/g, '').trim()
    const data = JSON.parse(cleaned)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Safety check error:', error)
    return NextResponse.json(
      { error: 'Failed to check safety. Please try again.' },
      { status: 500 }
    )
  }
}
