"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { forecastStock } from '@/lib/actions';
import type { ForecastStockOutput } from '@/ai/flows/stock-forecasting';
import { inventory } from '@/lib/data'; // Using this as a placeholder for historical data
import { Loader2, Zap } from 'lucide-react';

export function ForecastingClient() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ForecastStockOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleForecast = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            // NOTE: In a real app, historical sales data would come from a database of completed orders.
            // We use the current inventory as a placeholder for the structure.
            const historicalSalesData = JSON.stringify(inventory.map(item => ({...item, sales: Math.floor(Math.random() * 200) })));
            const ingredientList = JSON.stringify(inventory);

            const response = await forecastStock({ historicalSalesData, ingredientList });
            
            // Attempt to parse JSON from the AI response
            try {
                const parsedSuggestions = JSON.parse(response.restockSuggestions);
                setResult({
                    restockSuggestions: parsedSuggestions,
                    reasoning: response.reasoning
                });
            } catch (e) {
                 // If parsing fails, use the raw string
                 console.error("Failed to parse restock suggestions JSON from AI", e);
                 setResult({
                    restockSuggestions: response.restockSuggestions,
                    reasoning: response.reasoning
                 });
            }
        } catch (e) {
            console.error(e);
            setError("Ocurrió un error al generar la previsión. Intente de nuevo.");
        } finally {
            setLoading(false);
        }
    }
    
    // Type guard to check if suggestions are an array
    const suggestionsAreArray = (suggestions: any): suggestions is { ingredient: string, quantity: number, reason: string }[] => {
        return Array.isArray(suggestions);
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Generar Previsión</CardTitle>
                    <CardDescription>
                        Haga clic en el botón para que la IA analice los datos y genere sugerencias de reposición.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleForecast} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                        {loading ? "Analizando..." : "Generar Sugerencias"}
                    </Button>
                </CardContent>
            </Card>

            {error && <p className="text-destructive">{error}</p>}
            
            {result && (
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sugerencias de Reposición</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {suggestionsAreArray(result.restockSuggestions) ? (
                                <ul className="space-y-2">
                                    {result.restockSuggestions.map((item, index) => (
                                        <li key={index} className="flex justify-between border-b pb-2">
                                            <span className="font-medium">{item.ingredient}</span>
                                            <span className="font-bold text-primary">Reponer {item.quantity}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                // Render as preformatted text if it's not a parsable array
                                <pre className="whitespace-pre-wrap text-sm">{typeof result.restockSuggestions === 'string' ? result.restockSuggestions : JSON.stringify(result.restockSuggestions, null, 2)}</pre>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Razonamiento de la IA</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground whitespace-pre-line">{result.reasoning}</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
