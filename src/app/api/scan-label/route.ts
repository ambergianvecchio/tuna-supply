import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { image } = await request.json()

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: 'Please provide an image' },
        { status: 400 }
      )
    }

    // image is a base64 data URL like "data:image/jpeg;base64,..."
    const matches = image.match(/^data:(image\/\w+);base64,(.+)$/)
    if (!matches) {
      return NextResponse.json(
        { error: 'Invalid image format' },
        { status: 400 }
      )
    }

    const mediaType = matches[1] as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
    const base64Data = matches[2]

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: `Read the ingredient list from this cat food label. Return ONLY the ingredients as a comma-separated list, exactly as they appear on the label. Do not add any commentary, analysis, or extra text — just the raw ingredient list. If you cannot read an ingredient list from this image, return: "Could not read ingredients from this image. Please try a clearer photo."`,
            },
          ],
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    return NextResponse.json({ ingredients: content.text })
  } catch (error) {
    console.error('Scan label error:', error)
    return NextResponse.json(
      { error: 'Failed to read the label. Please try again.' },
      { status: 500 }
    )
  }
}
