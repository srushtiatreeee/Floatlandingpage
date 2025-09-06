import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

interface SearchRequest {
  query: string
  userId: string
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

    const { query, userId }: SearchRequest = await req.json()

    if (!query || typeof query !== 'string' || !userId) {
      return new Response(
        JSON.stringify({ error: 'Query and userId are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create Supabase client with service role key for database access
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Generate embedding for the search query using OpenAI
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
      }),
    })

    if (!embeddingResponse.ok) {
      const errorData = await embeddingResponse.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${embeddingResponse.status}`)
    }

    const embeddingData = await embeddingResponse.json()
    
    if (!embeddingData.data || !embeddingData.data[0] || !embeddingData.data[0].embedding) {
      throw new Error('No embedding received from OpenAI')
    }

    const queryEmbedding = embeddingData.data[0].embedding

    // Perform vector similarity search on tasks
    // Note: This assumes you have a vector column and similarity function set up
    // For now, we'll do a simple text search as a fallback
    const { data: tasks, error: searchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .textSearch('title', query, {
        type: 'websearch',
        config: 'english'
      })
      .limit(5)

    if (searchError) {
      console.error('Search error:', searchError)
      // Fallback to simple ILIKE search if text search fails
      const { data: fallbackTasks, error: fallbackError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .ilike('title', `%${query}%`)
        .limit(5)

      if (fallbackError) {
        throw new Error(`Search failed: ${fallbackError.message}`)
      }

      return new Response(
        JSON.stringify({ results: fallbackTasks || [] }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ results: tasks || [] }),
      {
        status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error performing smart search:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to perform smart search',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})