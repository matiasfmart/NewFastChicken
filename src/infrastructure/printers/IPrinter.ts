/**
 * Printer Interface
 *
 * 🟦 DOMAIN LAYER - Interface Definition
 * - Define contrato para implementaciones de impresión
 * - Permite múltiples implementaciones (Browser, Thermal, etc.)
 * - Inversión de dependencias
 */

export interface IPrinter {
  /**
   * Imprime contenido de texto plano
   * @param content - Contenido formateado para imprimir
   * @returns Promise que se resuelve cuando se inicia la impresión
   */
  print(content: string): Promise<void>;

  /**
   * Imprime contenido HTML
   * @param html - Contenido HTML para imprimir
   * @returns Promise que se resuelve cuando se inicia la impresión
   */
  printHTML(html: string): Promise<void>;

  /**
   * Verifica si la impresora está disponible
   * @returns true si la impresora está disponible
   */
  isAvailable(): boolean;
}
