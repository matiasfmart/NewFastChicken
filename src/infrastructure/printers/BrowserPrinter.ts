/**
 * Browser Printer Implementation
 *
 * 🟨 INFRASTRUCTURE LAYER - Implementation
 * - Implementa IPrinter usando window.print()
 * - Optimizado para impresoras térmicas 80mm
 * - Funciona con cualquier impresora configurada en el sistema
 */

import type { IPrinter } from './IPrinter';

export class BrowserPrinter implements IPrinter {
  /**
   * Imprime contenido de texto plano
   * Convierte el texto a HTML pre-formateado y lo imprime
   * Soporta marcadores especiales para estilos ({{BRAND:texto}})
   */
  async print(content: string): Promise<void> {
    // Procesar contenido para detectar marcadores especiales
    let processedContent = this.escapeHTML(content);

    // Reemplazar marcador {{BRAND:texto}} con HTML estilizado
    processedContent = processedContent.replace(
      /\{\{BRAND:(.*?)\}\}/g,
      '<span class="brand-text">$1</span>'
    );

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Ticket</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }

            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: 'Courier New', monospace;
              font-size: 14px;
              font-weight: 600;
              line-height: 1.5;
              width: 80mm;
              padding: 5mm;
              color: #000;
              background: #fff;
            }

            pre {
              font-family: 'Courier New', monospace;
              font-size: 14px;
              font-weight: 600;
              white-space: pre-wrap;
              word-wrap: break-word;
              margin: 0;
            }

            /* Estilo especial para el nombre de la marca */
            .brand-text {
              font-size: 20px;
              font-weight: 900;
              letter-spacing: 2px;
              text-transform: uppercase;
              display: inline-block;
            }

            @media print {
              body {
                width: 80mm;
                margin: 0;
                padding: 5mm;
              }
            }
          </style>
        </head>
        <body>
          <pre>${processedContent}</pre>
        </body>
      </html>
    `;

    return this.printHTML(html);
  }

  /**
   * Imprime contenido HTML
   * Abre ventana de impresión del navegador
   */
  async printHTML(html: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Window.print() no está disponible en este entorno');
    }

    return new Promise((resolve, reject) => {
      try {
        // Crear iframe oculto para impresión
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.style.visibility = 'hidden';

        document.body.appendChild(iframe);

        const iframeWindow = iframe.contentWindow;
        const iframeDocument = iframe.contentDocument;

        if (!iframeWindow || !iframeDocument) {
          throw new Error('No se pudo crear el iframe de impresión');
        }

        // ✅ Flag para prevenir doble impresión
        let hasBeenPrinted = false;

        // Escribir HTML en el iframe
        iframeDocument.open();
        iframeDocument.write(html);
        iframeDocument.close();

        // Esperar a que cargue el contenido
        iframe.onload = () => {
          if (hasBeenPrinted) return; // ✅ Prevenir duplicados
          hasBeenPrinted = true;

          try {
            // Trigger print dialog
            iframeWindow.focus();
            iframeWindow.print();

            // Cleanup después de un delay
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
              resolve();
            }, 1000);
          } catch (error) {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            reject(error);
          }
        };

        // Fallback si onload no se dispara
        setTimeout(() => {
          if (hasBeenPrinted) return; // ✅ Prevenir duplicados
          hasBeenPrinted = true;

          if (document.body.contains(iframe)) {
            try {
              iframeWindow.focus();
              iframeWindow.print();
              setTimeout(() => {
                if (document.body.contains(iframe)) {
                  document.body.removeChild(iframe);
                }
                resolve();
              }, 1000);
            } catch (error) {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
              reject(error);
            }
          }
        }, 500);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Verifica si window.print() está disponible
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.print === 'function';
  }

  /**
   * Escapa caracteres HTML especiales
   */
  private escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Singleton instance
export const browserPrinter = new BrowserPrinter();
