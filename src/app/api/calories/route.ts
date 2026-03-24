import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { brand, ingredients, type, amount } = await request.json()

    if (!brand && !ingredients) {
      return NextResponse.json(
        { error: 'Please provide a brand or product name' },
        { status: 400 }
      )
    }

    const foodDescription = [
      brand && `Brand: ${brand}`,
      ingredients && `Product: ${ingredients}`,
      type && `Type: ${type} cat food`,
      amount && `Daily amount: ${amount}`,
    ].filter(Boolean).join('\n')

    // Single call with optional web search - Claude decides if it needs to search
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 1,
        },
      ],
      messages: [
        {
          role: 'user',
          content: `You are a cat nutrition expert. Look up the caloric content for this specific cat food product and calculate the daily caloric intake.

${foodDescription}

If you're confident you know the exact calorie data for this specific product, you can answer directly. Otherwise, search for it.

Your final message must contain ONLY a JSON object (no markdown, no backticks, no explanation before or after):
{"calories_per_day": <number>, "per_serving": <number>, "servings_per_day": <number>, "confidence": "high" | "medium" | "low", "notes": "<source of calorie data>"}`,
        },
      ],
    })

    // Find the last text block containing our JSON
    const textBlocks = message.content.filter(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    )

    let data = null
    // Search from last to first for the JSON response
    for (let i = textBlocks.length - 1; i >= 0; i--) {
      const cleaned = textBlocks[i].text.replace(/```json\n?|\n?```/g, '').trim()
      const jsonMatch = cleaned.match(/\{[\s\S]*"calories_per_day"[\s\S]*?\}/)
      if (jsonMatch) {
        try {
          data = JSON.parse(jsonMatch[0])
          break
        } catch {
          continue
        }
      }
    }

    if (!data) throw new Error('No valid JSON in response')

    return NextResponse.json(data)
  } catch (error) {
    console.error('Calories error:', error)
    return NextResponse.json(
      { error: 'Failed to estimate calories. Please try again.' },
      { status: 500 }
    )
  }
}
