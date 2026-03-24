import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { ingredients } = await request.json()

    if (!ingredients || typeof ingredients !== 'string' || !ingredients.trim()) {
      return NextResponse.json(
        { error: 'Please provide an ingredient list' },
        { status: 400 }
      )
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a cat nutrition expert. Analyze this cat food ingredient list and return a JSON response.

Ingredient list: ${ingredients}

Return ONLY valid JSON (no markdown, no backticks) with this exact structure:
{
  "rating": "excellent" | "good" | "fair" | "avoid",
  "protein_sources": [{"name": "ingredient name", "quality": "high" | "medium" | "low"}],
  "red_flags": [{"ingredient": "name", "concern": "why it's concerning for cats"}],
  "highlights": ["positive aspects of this food"],
  "summary": "A short plain-English summary of the overall picture for a cat owner"
}

Rating criteria:
- excellent: Named meat/fish as first ingredients, no concerning additives, good nutritional profile
- good: Decent protein sources, minor concerns only
- fair: Some quality issues, fillers, or concerning ingredients
- avoid: Significant red flags, low-quality proteins, harmful additives

Red flags to watch for: carrageenan, BHA, BHT, artificial colors (Red 40, Yellow 5, etc.), unnamed meat byproducts, corn syrup, excessive corn/wheat/soy as primary ingredients, propylene glycol, ethoxyquin, sodium nitrite, menadione.

If the input doesn't appear to be a cat food ingredient list, return:
{"error": "This doesn't look like a cat food ingredient list. Please paste the ingredients from a cat food label."}`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    const cleaned = content.text.replace(/```json\n?|\n?```/g, '').trim()
    const data = JSON.parse(cleaned)

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Analyze error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze ingredients. Please try again.' },
      { status: 500 }
    )
  }
}
