import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { MermaidDiagram } from "@yoophi/markdown-annotation-react";

import {
  createAgentRunMermaidBlockId,
  extractCodeLanguage,
  getAgentRunCodeBlockRenderKind,
  normalizeStreamingMarkdown,
} from "@/features/agent-run/model/agent-run-markdown";
import { cn } from "@/lib/utils";
import { ExternalLink } from "@/shared/ui/external-link";

function codeSource(children: ReactNode) {
  return Array.isArray(children) ? children.join("") : String(children ?? "");
}

export function StreamingMarkdown({ content }: { content: string }) {
  return (
    <div className="min-w-0 break-words text-sm leading-6">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {normalizeStreamingMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-2 mt-4 text-2xl font-semibold tracking-tight first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-4 text-xl font-semibold tracking-tight first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-3 text-lg font-semibold tracking-tight first:mt-0">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 mt-3 text-base font-semibold tracking-tight first:mt-0">{children}</h4>
  ),
  p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="my-2 list-disc pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal pl-5">{children}</ol>,
  li: ({ children }) => <li className="mt-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-4 pl-4 text-muted-foreground">{children}</blockquote>
  ),
  code: ({ children, className, node }) => {
    const source = codeSource(children).replace(/\n$/, "");
    const language = extractCodeLanguage(className);
    const isInline =
      !node?.position?.start.line || node.position.start.line === node.position.end.line;

    if (isInline) {
      return (
        <code
          className={cn("rounded bg-muted px-1.5 py-0.5 font-mono text-[0.92em]", className)}
        >
          {children}
        </code>
      );
    }

    if (getAgentRunCodeBlockRenderKind({ language, source }) === "mermaid-diagram") {
      return (
        <div className="my-3 min-w-0 max-w-full overflow-hidden">
          <MermaidDiagram
            blockId={createAgentRunMermaidBlockId({
              source,
              startLine: node.position?.start.line,
            })}
            source={source}
          />
        </div>
      );
    }

    return (
      <pre className="my-3 overflow-x-auto rounded-md border bg-muted p-3">
        <code className={cn("font-mono text-sm", className)}>{children}</code>
      </pre>
    );
  },
  pre: ({ children }) => <>{children}</>,
  a: ({ children, href }) => <ExternalLink href={href}>{children}</ExternalLink>,
  hr: () => <hr className="my-4 border-border" />,
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border bg-muted px-2 py-1 text-left font-semibold align-top">{children}</th>
  ),
  td: ({ children }) => <td className="border px-2 py-1 align-top">{children}</td>,
  img: ({ alt, src }) => (
    <img className="h-auto max-w-full rounded-md" alt={alt ?? ""} src={src} />
  ),
};
