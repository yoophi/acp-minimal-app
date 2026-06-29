import type { MarkdownBlock } from "./types";

function pushBlock(
  blocks: MarkdownBlock[],
  block: Omit<MarkdownBlock, "id" | "order">,
) {
  blocks.push({
    ...block,
    id: `block-${blocks.length}`,
    order: blocks.length,
  });
}

export function parseMarkdownToBlocks(markdown: string): MarkdownBlock[] {
  const lines = markdown.split("\n");
  const blocks: MarkdownBlock[] = [];
  let paragraphBuffer: string[] = [];
  let paragraphStartLine = 1;

  function flushParagraph(endLine: number) {
    if (paragraphBuffer.length === 0) {
      return;
    }

    pushBlock(blocks, {
      type: "paragraph",
      content: paragraphBuffer.join("\n"),
      rawContent: paragraphBuffer.join("\n"),
      startLine: paragraphStartLine,
      endLine,
    });
    paragraphBuffer = [];
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    const lineNumber = index + 1;

    if (!trimmed) {
      flushParagraph(lineNumber - 1);
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph(lineNumber - 1);
      pushBlock(blocks, {
        type: "heading",
        level: headingMatch[1].length,
        content: headingMatch[2],
        rawContent: line,
        startLine: lineNumber,
        endLine: lineNumber,
      });
      continue;
    }

    if (/^(```|~~~)/.test(trimmed)) {
      flushParagraph(lineNumber - 1);
      const fence = trimmed.slice(0, 3);
      const language = trimmed.slice(3).trim() || undefined;
      const rawCodeLines = [line];
      const codeLines: string[] = [];
      let endLine = lineNumber;

      for (index += 1; index < lines.length; index += 1) {
        const codeLine = lines[index];
        endLine = index + 1;
        rawCodeLines.push(codeLine);
        if (codeLine.trim().startsWith(fence)) {
          break;
        }
        codeLines.push(codeLine);
      }

      pushBlock(blocks, {
        type: "code",
        content: codeLines.join("\n"),
        rawContent: rawCodeLines.join("\n"),
        language,
        startLine: lineNumber,
        endLine,
      });
      continue;
    }

    if (/^(---|\*\*\*)$/.test(trimmed)) {
      flushParagraph(lineNumber - 1);
      pushBlock(blocks, {
        type: "hr",
        content: "",
        rawContent: line,
        startLine: lineNumber,
        endLine: lineNumber,
      });
      continue;
    }

    if (paragraphBuffer.length === 0) {
      paragraphStartLine = lineNumber;
    }
    paragraphBuffer.push(line);
  }

  flushParagraph(lines.length);
  return blocks;
}
