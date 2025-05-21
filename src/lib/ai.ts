import OpenAI from 'openai';
import { supabase } from './supabase';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

const titlePrompt = `Generate a concise, professional title (3-5 words) for a legal conversation based on the user's message.`;

export async function generateTitle(userMessage: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4.1',
      messages: [
        { role: 'system', content: titlePrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    return completion.choices[0]?.message?.content || 'New Legal Inquiry';
  } catch (error) {
    console.error('Error generating title:', error);
    return 'New Legal Inquiry';
  }
}

export async function sendMessageToWebhook(message: string, chatId: string): Promise<string> {
  try {
    const response = await fetch('https://n8n.srv799397.hstgr.cloud/webhook/lawpro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message,
        chatId
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Webhook Response Data:', data);

    // Handle array response format
    if (Array.isArray(data) && data.length > 0) {
      let responseText = '';
      if (data[0].output?.response) {
        responseText = data[0].output.response;
      } else if (typeof data[0].response === 'string') {
        responseText = data[0].response;
      }
      if (responseText) {
        return formatResponse(responseText);
      }
    }
    
    // Handle object response format
    if (typeof data === 'object' && data !== null) {
      let responseText = '';
      if (data.output?.response) {
        responseText = data.output.response;
      } else if (typeof data.response === 'string') {
        responseText = data.response;
      }
      if (responseText) {
        return formatResponse(responseText);
      }
    }

    console.error('Unexpected webhook response format:', data);
    throw new Error('Invalid response format from webhook');
  } catch (error) {
    console.error('Error sending message to webhook:', error);
    throw error;
  }
}

function formatResponse(text: string): string {
  // Replace plain hyphens with bullet points
  text = text.replace(/^\s*-\s*/gm, '• ');
  
  // Add line breaks between sections
  text = text.replace(/\.\s+(?=[A-Z])/g, '.\n\n');
  
  // Add emphasis to important phrases
  text = text.replace(
    /(IMPORTANT|NOTE|WARNING|CRITICAL|immediately|must|required by law)/gi,
    '**$1**'
  );
  
  // Format numbered lists
  text = text.replace(/^\d+\.\s+/gm, (match) => `\n${match}`);
  
  // Add spacing after bullet points for better readability
  text = text.replace(/•\s*([^\n]+)/g, '• $1\n');
  
  return text.trim();
}