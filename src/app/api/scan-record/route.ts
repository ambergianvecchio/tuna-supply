import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const PROMPT = `Extract vet record information from this document (vet receipt, vaccine card, medication label, patient summary, etc).

If the document contains MULTIPLE records (e.g. multiple vaccines, a visit with vaccines and medications), return a JSON ARRAY of records. If it's a single record, return a single JSON object.

Each record should have this structure:
{
  "type": "visit" | "vaccine" | "medication" | "note",
  "date": "YYYY-MM-DD" or null,
  "vet_name": "clinic or vet name" or null,
  "notes": "summary of visit or relevant details" or null,
  "medication": {
    "name": "medication name" or null,
    "dosage": "dosage info" or null,
    "frequency": "how often" or null,
    "start_date": "YYYY-MM-DD" or null,
    "end_date": "YYYY-MM-DD" or null
  },
  "vaccine": {
    "name": "vaccine name" or null,
    "next_due_date": "YYYY-MM-DD" or null
  }
}

Guidelines:
- Determine the record type from context (vaccine card = "vaccine", prescription = "medication", visit summary = "visit", other = "note")
- Extract dates in YYYY-MM-DD format
- Include any vet/clinic name visible
- For medications, extract dosage and frequency if visible
- For vaccines, extract the next due date if visible
- Put any other useful details in notes
- Return ONLY valid JSON (no markdown, no backticks)
- If you cannot read the document, return: {"error": "Could not read this document. Please try a clearer photo."}`

export async function POST(request: Request) {
  try {
    const { file, fileType } = await request.json()

    if (!file || typeof file !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a file' },
        { status: 400 }
      )
    }

    // Parse the data URL
    const matches = file.match(/^data:([^;]+);base64,(.+)$/)
    if (!matches) {
      return NextResponse.json(
        { error: 'Invalid file format' },
        { status: 400 }
      )
    }

    const mimeType = matches[1]
    const base64Data = matches[2]
    const isPdf = mimeType === 'application/pdf' || fileType === 'pdf'

    // Build the content block based on file type
    const fileBlock: Anthropic.Messages.ContentBlockParam = isPdf
      ? {
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: base64Data,
          },
        }
      : {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: base64Data,
          },
        }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            fileBlock,
            { type: 'text', text: PROMPT },
          ],
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

    // Normalize to always return an array
    const records = Array.isArray(data) ? data : [data]

    return NextResponse.json({ records })
  } catch (error) {
    console.error('Scan record error:', error)
    return NextResponse.json(
      { error: 'Failed to read the document. Please try again.' },
      { status: 500 }
    )
  }
}
