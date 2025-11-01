'use server';

/**
 * @fileOverview Stock forecasting AI agent.
 *
 * - forecastStock - A function that handles the stock forecasting process.
 * - ForecastStockInput - The input type for the forecastStock function.
 * - ForecastStockOutput - The return type for the forecastStock function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ForecastStockInputSchema = z.object({
  historicalSalesData: z.string().describe('Historical sales data in JSON format.'),
  ingredientList: z.string().describe('List of ingredients in JSON format.'),
});
export type ForecastStockInput = z.infer<typeof ForecastStockInputSchema>;

const ForecastStockOutputSchema = z.object({
  restockSuggestions: z.string().describe('Restock suggestions in JSON format.'),
  reasoning: z.string().describe('Reasoning behind the restock suggestions.'),
});
export type ForecastStockOutput = z.infer<typeof ForecastStockOutputSchema>;

export async function forecastStock(input: ForecastStockInput): Promise<ForecastStockOutput> {
  return forecastStockFlow(input);
}

const prompt = ai.definePrompt({
  name: 'forecastStockPrompt',
  input: {schema: ForecastStockInputSchema},
  output: {schema: ForecastStockOutputSchema},
  prompt: `You are an AI assistant helping a fast food restaurant administrator optimize inventory planning.

  Analyze the historical sales data and ingredient list to predict demand for ingredients and generate restock suggestions.

  Consider factors such as time of day, day of week, and popularity of an ingredient in different dishes.

  Historical Sales Data: {{{historicalSalesData}}}
  Ingredient List: {{{ingredientList}}}

  Provide restock suggestions in JSON format, and explain the reasoning behind your suggestions.
  Ensure the restockSuggestions field is valid JSON and includes specific quantities for each ingredient.
  The "reasoning" field should clearly justify the restock suggestions based on sales data and ingredient usage patterns.
  `,
});

const forecastStockFlow = ai.defineFlow(
  {
    name: 'forecastStockFlow',
    inputSchema: ForecastStockInputSchema,
    outputSchema: ForecastStockOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
