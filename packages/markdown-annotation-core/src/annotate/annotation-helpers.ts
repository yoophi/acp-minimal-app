import type { AnnotationDraft, MarkdownBlock } from "../types";

export function annotationBlock(annotation: AnnotationDraft, blocks: MarkdownBlock[]) {
  return blocks.find((block) => block.id === annotation.anchor.blockId);
}

export function isFullBlockAnnotation(
  annotation: AnnotationDraft,
  blockOrBlocks: MarkdownBlock | MarkdownBlock[],
) {
  const block = Array.isArray(blockOrBlocks)
    ? annotationBlock(annotation, blockOrBlocks)
    : blockOrBlocks;

  return (
    block !== undefined &&
    annotation.anchor.startOffset === 0 &&
    annotation.anchor.endOffset === block.content.length
  );
}
