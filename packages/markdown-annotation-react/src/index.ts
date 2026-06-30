export { MarkdownViewer, type MarkdownViewerProps } from "./MarkdownViewer";
export {
  buildViewerAnnotationMaps,
  type ViewerAnnotationMaps,
} from "./build-viewer-annotation-maps";
export {
  getSelectionAnchors,
  getSelectionRects,
  type SelectionRect,
} from "./use-selection-anchors";
export { segmentTextByAnnotations, type TextSegment } from "./segment-text";
export {
  AnnotationInputDialog,
  type AnnotationInputDialogProps,
} from "./AnnotationInputDialog";
export {
  annotationTypes,
  getAnnotationCommentLabel,
  getAnnotationCommentPlaceholder,
  requiresComment,
} from "./annotation-form";
export type {
  AnnotationDialogComponents,
  DialogShellProps,
  MarkdownViewerBlockNote,
  MarkdownViewerComponents,
  MarkdownViewerInlineAnnotation,
  TypeSelectOption,
  TypeSelectProps,
  ViewerButtonProps,
  ViewerTooltipProps,
} from "./types";
