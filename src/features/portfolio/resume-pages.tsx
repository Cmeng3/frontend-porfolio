"use client";
import { useEffect, useRef, useState } from "react";
import type { PDFDocumentLoadingTask } from "pdfjs-dist";

export function ResumePages({ url, title }: { url: string; title: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Loading CV…");
  useEffect(() => {
    const target = container.current;
    if (!target) return;
    let cancelled = false;
    let task: PDFDocumentLoadingTask | undefined;
    target.replaceChildren();
    async function render() {
      try {
        const pdfjs = await import("pdfjs-dist");
        if (cancelled) return;
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
        task = pdfjs.getDocument({ url });
        const pdf = await task.promise;
        for (let number = 1; number <= Math.min(pdf.numPages, 20); number++) {
          if (cancelled) return;
          const page = await pdf.getPage(number);
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: 1500 / base.width });
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          canvas.setAttribute("role", "img");
          canvas.setAttribute("aria-label", `${title}, page ${number}`);
          await page.render({ canvas, viewport }).promise;
          if (cancelled) return;
          target?.appendChild(canvas);
          page.cleanup();
        }
        if (!cancelled)
          setStatus(
            pdf.numPages > 20 ? "Download the PDF to read all pages." : "",
          );
      } catch {
        if (!cancelled)
          setStatus(
            "The preview could not load. You can still download the CV above.",
          );
      }
    }
    void render();
    return () => {
      cancelled = true;
      void task?.destroy();
      target.replaceChildren();
    };
  }, [url, title]);
  return (
    <section aria-label="CV preview">
      <p role="status">{status}</p>
      <div ref={container} className="resume-pages" />
    </section>
  );
}
