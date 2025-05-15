import OpenAI from 'openai';
import { supabase } from './supabase';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

const systemPrompt = `You are LawPro, an AI legal assistant. Keep these rules in mind:

RESPONSE FORMAT:
- Keep responses under 150 words
- Use simple, clear language
- Break information into bullet points when possible
- Always remind users that consulting a real lawyer is recommended
- If the user explicitly asks for a lawyer or legal representation, indicate that you will show available lawyers in your area

LAWYER RECOMMENDATIONS:
- Only show lawyer recommendations when explicitly requested
- Do not include specific lawyer information in your response
- The system will handle displaying lawyer cards separately`;

const titlePrompt = `Generate a concise, professional title (3-5 words) for a legal conversation based on the user's message.`;

const dialogTitlePrompt = `Generate a short, descriptive title (2-4 words) for a dialog box based on its content. The title should be clear and accessible for screen readers.`;

export async function getAIResponse(userMessage: string, sessionId: string): Promise<{ response: string; showLawyers: boolean }> {
  try {
    // Enhanced pattern matching for lawyer requests
    const needsLawyer = /(?:find|get|need|want|looking for|recommend|suggest|refer|contact|speak|talk|consult|hire|meet).*(?:lawyer|attorney|legal representation|legal help|legal advice|legal counsel|legal professional|legal expert|legal consultation)/i.test(userMessage) || 
    /(?:lawyer|attorney|legal).+(?:near|around|in|available|nearby)/i.test(userMessage);

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4.1',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 800,    // Increased from 300 to 800
    });

    let response = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';
    
    // If the user needs a lawyer, append a transition message
    if (needsLawyer) {
      response += "\n\nI'll show you some qualified legal professionals who might be able to help with your case.";
    }

    return {
      response,
      showLawyers: needsLawyer
    };
  } catch (error) {
    console.error('Error getting AI response:', error);
    return { 
      response: 'I apologize, but I encountered an error. Please try again later.',
      showLawyers: false
    };
  }
}

export async function generateTitle(userMessage: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4.1',
      messages: [
        { role: 'system', content: titlePrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.3,
      max_tokens: 100,    // Increased from 50 to 100
    });

    return completion.choices[0]?.message?.content || 'New Legal Inquiry';
  } catch (error) {
    console.error('Error generating title:', error);
    return 'New Legal Inquiry';
  }
}

export async function generateDialogTitle(content: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4.1',
      messages: [
        { role: 'system', content: dialogTitlePrompt },
        { role: 'user', content: content }
      ],
      temperature: 0.3,
      max_tokens: 100,    // Increased from 50 to 100
    });

    return completion.choices[0]?.message?.content || 'Dialog';
  } catch (error) {
    console.error('Error generating dialog title:', error);
    return 'Dialog';
  }
}

export async function findLocalLawyers(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('lawyers_real')
      .select('*')
      .limit(3);

    if (error) {
      console.error('Error fetching lawyers:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in findLocalLawyers:', error);
    return [];
  }
}