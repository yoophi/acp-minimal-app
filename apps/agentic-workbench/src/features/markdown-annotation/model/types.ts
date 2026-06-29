export type MarkdownBlockType =
  | "heading"
  | "paragraph"
  | "blockquote"
  | "list-item"
  | "code"
  | "table"
  | "hr";

export type MarkdownBlock = {
  id: string;
  type: MarkdownBlockType;
  content: string;
  rawContent: string;
  order: number;
  startLine: number;
  endLine: number;
  level?: number;
  language?: string;
};

export type AnnotationType = "note" | "change-request";

export type AnnotationDraft = {
  id: string;
  fileName: string;
  anchor: {
    blockId: string;
    startLine: number;
    endLine: number;
  };
  selectedText: string;
  comment: string;
  type: AnnotationType;
  createdAt: string;
};
