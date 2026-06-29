import type { AnnotationDraft, MarkdownBlock } from "./types";

export function formatAnnotationsForAgent(
  fileName: string,
  annotations: AnnotationDraft[],
  blocks: MarkdownBlock[],
) {
  if (annotations.length === 0) {
    return [
      "# Markdown Annotations",
      "",
      `File: ${fileName}`,
      "",
      "아직 annotation이 없습니다.",
    ].join("\n");
  }

  const sorted = [...annotations].sort((left, right) => {
    const leftBlock = blocks.findIndex((block) => block.id === left.anchor.blockId);
    const rightBlock = blocks.findIndex((block) => block.id === right.anchor.blockId);
    return leftBlock - rightBlock;
  });

  return [
    "# Markdown Annotations",
    "",
    `File: ${fileName}`,
    "",
    `이 Markdown 문서에 ${sorted.length}개의 피드백이 있습니다:`,
    "",
    ...sorted.map((annotation, index) =>
      [
        `## ${index + 1}. [${annotation.type}] ${
          annotation.type === "change-request" ? "블록 변경 요청" : "참고 메모"
        }`,
        "",
        annotation.anchor.startLine === annotation.anchor.endLine
          ? `- 행: ${annotation.anchor.startLine}`
          : `- 행 범위: ${annotation.anchor.startLine}-${annotation.anchor.endLine}`,
        "- 원본 Markdown:",
        "```markdown",
        annotation.selectedText,
        "```",
        "",
        annotation.type === "change-request"
          ? `- 변경 요청: ${annotation.comment}`
          : `- 참고 메모: ${annotation.comment}`,
      ].join("\n"),
    ),
    "---",
    "",
    "위 change-request annotation은 문서 수정 요청으로 처리하고, note annotation은 참고 정보로만 사용하세요.",
  ].join("\n");
}
