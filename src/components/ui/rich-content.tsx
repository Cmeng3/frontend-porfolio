import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { safeUrl } from "./content-ui";
export function RichContent({ content }: { content?: string | null }) {
  if (!content) return null;
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          a: ({ href, children }) => (
            <a href={safeUrl(href)} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          img: ({ src, alt }) =>
            typeof src === "string" && safeUrl(src) ? (
              <Image
                src={src}
                alt={alt || ""}
                width={1200}
                height={750}
                unoptimized
                sizes="100vw"
                className="content-image"
              />
            ) : null,
          table: ({ children }) => (
            <div className="table-scroll">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
