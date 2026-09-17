import { ExternalLink, safeUrl } from "./content-ui";
export function PdfPreview({ url, title }: { url: string; title: string }) {
  const safe = safeUrl(url);
  if (!safe) return null;
  return (
    <div className="pdf-preview-card">
      <iframe
        className="pdf-page-preview"
        src={safe + "#toolbar=0&navpanes=0&view=FitH"}
        title={title + " PDF preview"}
        loading="lazy"
      />
      <ExternalLink href={safe}>Preview PDF ↗</ExternalLink>
      <p className="muted small">
        If your browser cannot display PDFs here, open the preview in a new tab.
      </p>
    </div>
  );
}
