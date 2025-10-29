// This file is machine-generated - edit with care!
'use server';

/**
 * @fileOverview AI-powered SEO keyword suggestion agent.
 *
 * - suggestSeoKeywords - A function that suggests SEO keywords for a given text.
 * - SuggestSeoKeywordsInput - The input type for the suggestSeoKeywords function.
 * - SuggestSeoKeywordsOutput - The return type for the suggestSeoKeywords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSeoKeywordsInputSchema = z.object({
  pageContent: z.string().describe('The content of the web page to analyze for SEO keywords.'),
});
export type SuggestSeoKeywordsInput = z.infer<typeof SuggestSeoKeywordsInputSchema>;

const SuggestSeoKeywordsOutputSchema = z.object({
  keywords: z.array(z.string()).describe('An array of suggested SEO keywords for the page content.'),
  explanation: z.string().describe('Explanation of why these keywords are suggested.'),
});
export type SuggestSeoKeywordsOutput = z.infer<typeof SuggestSeoKeywordsOutputSchema>;

export async function suggestSeoKeywords(input: SuggestSeoKeywordsInput): Promise<SuggestSeoKeywordsOutput> {
  return suggestSeoKeywordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSeoKeywordsPrompt',
  input: {schema: SuggestSeoKeywordsInputSchema},
  output: {schema: SuggestSeoKeywordsOutputSchema},
  prompt: `You are an SEO expert. Analyze the following web page content and suggest relevant SEO keywords.

Page Content: {{{pageContent}}}

Provide an array of keywords and an explanation of why these keywords are suggested.`,
});

const suggestSeoKeywordsFlow = ai.defineFlow(
  {
    name: 'suggestSeoKeywordsFlow',
    inputSchema: SuggestSeoKeywordsInputSchema,
    outputSchema: SuggestSeoKeywordsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
