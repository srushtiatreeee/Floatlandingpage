import { corsHeaders } from '../_shared/cors.ts'

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

interface SubtaskRequest {
  taskTitle: string
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const { taskTitle }: SubtaskRequest = await req.json()

    if (!taskTitle || typeof taskTitle !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Task title is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Call OpenAI API using the standard Chat Completions format
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that breaks down big tasks into simple, clear subtasks. Given a main task title, return a list of 5 to 7 clear, short subtasks needed to complete it. The subtasks should be practical and written in plain language. Return them as a plain JSON array. Do not include any extra text or explanations.
Main task: "Plan a wedding"
Example output:
[
  "Book wedding venue",
  "Hire photographer", 
  "Send invitations",
  "Arrange catering",
  "Plan wedding ceremony",
  "Choose wedding dress",
  "Plan honeymoon"
]
Now generate subtasks for this task:`
          },
          {
            role: 'user',
            content: `"${taskTitle}"`
          }
        ]
      }),
    })

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${openAIResponse.status}`)
    }

    const openAIData = await openAIResponse.json()
    
    // Extract content from the standard Chat Completions response
    if (!openAIData.choices || !openAIData.choices[0] || !openAIData.choices[0].message) {
      throw new Error('No content received from OpenAI')
    }

    const content = openAIData.choices[0].message.content

    // Parse the JSON array from the response
    let subtasks: string[]
    try {
      subtasks = JSON.parse(content)
      if (!Array.isArray(subtasks)) {
        throw new Error('Response is not an array')
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content)
      // Fallback: try to extract subtasks from text
      subtasks = content
        .split('\n')
        .filter((line: string) => line.trim().length > 0)
        .map((line: string) => line.replace(/^[-*•]\s*/, '').trim())
        .slice(0, 7)
    }

    return new Response(
      JSON.stringify({ subtasks }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error generating subtasks:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate subtasks',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})