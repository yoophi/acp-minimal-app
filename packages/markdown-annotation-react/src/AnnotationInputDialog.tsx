import type { AnnotationType } from "@yoophi/markdown-annotation-core/types";
import {
  annotationTypes,
  getAnnotationCommentLabel,
  getAnnotationCommentPlaceholder,
  requiresComment,
} from "./annotation-form";
import type { AnnotationDialogComponents } from "./types";

export type AnnotationInputDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  selectedText: string;
  type: AnnotationType;
  onTypeChange: (type: AnnotationType) => void;
  comment: string;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
  components: AnnotationDialogComponents;
};

/**
 * Annotation 입력 모달. 상태를 보유하지 않는 controlled 컴포넌트로, 타입/코멘트/
 * 열림 상태는 props로 받는다(MA는 단일 문서, AW는 파일별 상태로 저장 로직이 달라
 * 모달 UI만 공유한다). 키트 차이(base-ui/radix)는 DialogShell·TypeSelect 주입으로 흡수.
 */
export function AnnotationInputDialog({
  open,
  onOpenChange,
  isEditing,
  selectedText,
  type,
  onTypeChange,
  comment,
  onCommentChange,
  onSubmit,
  components,
}: AnnotationInputDialogProps) {
  const { DialogShell, TypeSelect, Textarea, Button } = components;
  const canSubmit = !requiresComment(type) || comment.trim().length > 0;

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit annotation" : "Add annotation"}
      description="선택한 문서 영역에 남길 annotation type과 내용을 입력합니다."
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!canSubmit} onClick={onSubmit}>
            {isEditing ? "Save" : "Add annotation"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <span className="text-sm font-medium">Selected text</span>
          <div className="max-h-24 overflow-auto whitespace-pre-wrap rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
            {selectedText}
          </div>
        </div>
        <div className="grid gap-1.5">
          <span className="text-sm font-medium">Type</span>
          <TypeSelect
            value={type}
            onValueChange={onTypeChange}
            options={annotationTypes}
            ariaLabel="Annotation type"
          />
        </div>
        <div className="grid gap-1.5">
          <span className="text-sm font-medium">{getAnnotationCommentLabel(type)}</span>
          <Textarea
            autoFocus
            value={comment}
            onChange={(event) => onCommentChange(event.target.value)}
            onKeyDown={(event) => {
              // 긴 메모는 Textarea로 받되, Enter는 확인(저장)으로 매핑한다.
              // 줄바꿈이 필요하면 Shift+Enter를 쓴다.
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (canSubmit) {
                  onSubmit();
                }
              }
            }}
            placeholder={getAnnotationCommentPlaceholder(type)}
            className="min-h-24 text-sm"
          />
        </div>
      </div>
    </DialogShell>
  );
}
