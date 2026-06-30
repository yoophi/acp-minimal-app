import type { AnnotationType } from "@yoophi/markdown-annotation-core/types";
import type { TypeSelectOption } from "./types";

/**
 * Annotation 입력 폼의 타입 목록·라벨·placeholder. MA AnnotatorPage의 정의를
 * 정본으로 단일화한 것이며, AnnotationInputDialog를 쓰는 모든 앱이 공유한다.
 */
export const annotationTypes: TypeSelectOption[] = [
  { value: "delete", label: "Delete" },
  { value: "change-request", label: "Change request" },
  { value: "question", label: "Question" },
  { value: "note", label: "Note" },
  { value: "approve", label: "Approve" },
];

export function getAnnotationCommentLabel(type: AnnotationType) {
  if (type === "change-request") {
    return "Replace with";
  }
  if (type === "note") {
    return "Reference note";
  }
  if (type === "question") {
    return "Question";
  }
  if (type === "delete") {
    return "Delete reason";
  }
  return "Comment";
}

export function getAnnotationCommentPlaceholder(type: AnnotationType) {
  if (type === "change-request") {
    return "선택 영역을 어떻게 바꿔야 하는지 적어주세요. 예: 시장에서 구입";
  }
  if (type === "note") {
    return "수정 지시가 아닌 참고 메모를 적어주세요.";
  }
  if (type === "question") {
    return "Agent가 확인해야 할 질문을 적어주세요.";
  }
  if (type === "delete") {
    return "삭제 이유가 있으면 적어주세요. 비워두면 삭제 지시만 출력합니다.";
  }
  return "Agent가 참고해야 할 내용을 적어주세요.";
}

/** delete만 comment 선택 사항, 나머지는 필수. */
export function requiresComment(type: AnnotationType) {
  return type !== "delete";
}
