# LLM Chatbot with TOON Storage

Example chatbot using ToonDB for efficient conversation history storage.

## Features

- Store conversation history in TOON format
- 40-60% token savings on context
- Fast retrieval of recent messages
- Support for multiple conversation threads

## Setup

```bash
cd examples/llm-chatbot
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

## Code Example

```typescript
import { ToonDB } from '@toondb/client';
import OpenAI from 'openai';

const db = new ToonDB({
  url: process.env.SUPABASE_URL!,
  apiKey: process.env.SUPABASE_API_KEY!
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

// Store conversation in TOON format
async function saveConversation(userId: string, messages: any[]) {
  const toonContent = db.converter.jsonToToon({
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp
    }))
  });
  
  await db.tables.create({
    name: `conversation_${userId}`,
    toonContent
  });
}

// Retrieve conversation history
async function getConversation(userId: string) {
  const table = await db.tables.get(`conversation_${userId}`);
  return table.data.messages;
}

// Chat with context
async function chat(userId: string, userMessage: string) {
  // Get conversation history
  const history = await getConversation(userId);
  
  // Add user message
  const messages = [
    ...history,
    { role: 'user', content: userMessage, timestamp: Date.now() }
  ];
  
  // Convert to TOON for context (saves tokens!)
  const toonContext = await db.converter.jsonToToon({ messages });
  
  // Call OpenAI with reduced token context
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `Previous conversation in TOON format:\\n${toonContext}`
      },
      { role: 'user', content: userMessage }
    ]
  });
  
  // Save updated conversation
  messages.push({
    role: 'assistant',
    content: response.choices[0].message.content,
    timestamp: Date.now()
  });
  
  await saveConversation(userId, messages);
  
  return response.choices[0].message.content;
}

// Example usage
const response = await chat('user123', 'What is TOON format?');
console.log(response);
```

## Token Savings Example

**JSON Format (150+ tokens):**

```json
{
  "messages": [
    {"role": "user", "content": "Hi", "timestamp": 1234567890},
    {"role": "assistant", "content": "Hello!", "timestamp": 1234567891},
    {"role": "user", "content": "How are you?", "timestamp": 1234567892}
  ]
}
```

**TOON Format (65 tokens, ~57% savings):**

```toon
messages[3]{role,content,timestamp}:
  user,Hi,1234567890
  assistant,Hello!,1234567891
  user,How are you?,1234567892
```

## Advanced Features

### Conversation Branching

```typescript
// Create conversation branch
async function createBranch(userId: string, branchPoint: number) {
  const history = await getConversation(userId);
  const branch = history.slice(0, branchPoint);
  
  await db.tables.create({
    name: `conversation_${userId}_branch_${Date.now()}`,
    toonContent: await db.converter.jsonToToon({ messages: branch })
  });
}
```

### Message Search

```typescript
// Search messages
async function searchMessages(userId: string, query: string) {
  const results = await db.queries.execute(
    `conversation_${userId}`,
    `SELECT * FROM messages WHERE content LIKE '%${query}%'`
  );
  
  return results.results;
}
```

### Conversation Summary

```typescript
// Generate summary with reduced tokens
async function summarizeConversation(userId: string) {
  const history = await getConversation(userId);
  const toonContext = await db.converter.jsonToToon({ messages: history });
  
  const summary = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'user',
      content: `Summarize this conversation:\\n${toonContext}`
    }]
  });
  
  return summary.choices[0].message.content;
}
```

## Deployment

See [DEPLOYMENT.md](../../docs/DEPLOYMENT.md) for production deployment guide.

## License

MIT

