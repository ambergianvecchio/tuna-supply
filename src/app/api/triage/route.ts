import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { tags, notes } = await request.json()

    if ((!tags || tags.length === 0) && (!notes || !notes.trim())) {
      return NextResponse.json(
        { error: 'Please provide symptoms to analyze' },
        { status: 400 }
      )
    }

    const symptomDescription = [
      tags?.length > 0 ? `Symptoms observed: ${tags.join(', ')}` : '',
      notes ? `Additional details: ${notes}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `You are a veterinary triage assistant. A cat named Tuna (female, born January 17, 2023) is showing the following symptoms. Provide triage guidance.

${symptomDescription}

Return ONLY valid JSON (no markdown, no backticks) with this exact structure:
{
  "urgency": "watch" | "call_vet" | "go_now",
  "explanation": "Short, clear explanation of the assessment and reasoning",
  "monitor_list": ["specific thing to watch for 1", "specific thing to watch for 2", "specific thing to watch for 3"]
}

Urgency levels:
- "watch": Mild symptoms that can be monitored at home for 24-48 hours
- "call_vet": Should schedule a vet appointment within 1-2 days
- "go_now": Emergency — needs immediate veterinary attention

Always err on the side of caution. Multiple simultaneous symptoms increase urgency. Consider Tuna's age (young adult cat) in your assessment.

Important: This is triage guidance only, not a diagnosis. Always remind that professional veterinary advice should be sought.`,
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
    console.error('Triage error:', error)
    return NextResponse.json(
      { error: 'Failed to get triage advice. Please try again.' },
      { status: 500 }
    )
  }
}
