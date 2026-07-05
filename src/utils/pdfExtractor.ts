import * as pdfjsLib from 'pdfjs-dist';

// ── Worker setup ──────────────────────────────────────────────────────────────
// Use Vite's asset URL pattern to bundle the worker file that ships with
// pdfjs-dist so the version always matches (no CDN mismatch errors).
// The `new URL(..., import.meta.url)` syntax is supported natively by Vite.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

/**
 * Extracts plain, typing-practice-ready text from a PDF file.
 * Works fully in the browser — no server needed.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          reject(new Error('The file appears to be empty.'));
          return;
        }

        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          verbosity: 0, // suppress console noise
        });

        const pdf = await loadingTask.promise;
        const pageTexts: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();

          // Build page text; preserve word separation via hasEOL flag
          let pageText = '';
          for (const item of content.items as any[]) {
            const str: string = item.str ?? '';
            const hasEOL: boolean = item.hasEOL ?? false;
            if (str) {
              pageText += str;
              if (hasEOL) pageText += ' ';
            }
          }
          pageTexts.push(pageText);
        }

        // Join pages and clean up whitespace / control chars
        const raw = pageTexts.join(' ');
        const cleaned = raw
          .replace(/[\r\n\t\f\v]+/g, ' ')  // newlines → space
          .replace(/\s{2,}/g, ' ')           // collapse multiple spaces
          .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '') // strip non-printable ASCII
          .trim();

        if (!cleaned || cleaned.length < 20) {
          reject(new Error(
            'Could not extract enough text. This PDF may be image-based (scanned) ' +
            'or use an unsupported encoding.'
          ));
          return;
        }

        // Cap at 3000 chars so the typing test stays manageable
        resolve(cleaned.slice(0, 3000));
      } catch (err: any) {
        console.error('[PDF] Extraction failed:', err);
        reject(new Error(
          'PDF parsing failed. Make sure the file is not password-protected or corrupted.'
        ));
      }
    };

    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.readAsArrayBuffer(file);
  });
}
