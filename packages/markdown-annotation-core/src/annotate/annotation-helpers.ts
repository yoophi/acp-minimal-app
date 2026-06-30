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

export function buildInlineAnnotationsByBlock(
  annotations: AnnotationDraft[],
  blocks: MarkdownBlock[],
) {
  const inlineAnnotations = new Map<string, AnnotationDraft[]>();

  for (const annotation of annotations) {
    const block = annotationBlock(annotation, blocks);
    if (
      !block ||
      annotation.anchor.startOffset === undefined ||
      annotation.anchor.endOffset === undefined ||
      isFullBlockAnnotation(annotation, block)
    ) {
      continue;
    }

    const blockAnnotations = inlineAnnotations.get(annotation.anchor.blockId) ?? [];
    blockAnnotations.push(annotation);
    inlineAnnotations.set(annotation.anchor.blockId, blockAnnotations);
  }

  return inlineAnnotations;
}
