import type { AnnotationType } from "@yoophi/markdown-annotation-core/types";
import type {
  AnnotationDialogComponents,
  DialogShellProps,
  TypeSelectProps,
} from "@yoophi/markdown-annotation-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/**
 * radix(shadcn) Dialog를 공유 AnnotationInputDialog의 DialogShell 계약에 맞춘 어댑터.
 */
function DialogShell({ open, onOpenChange, title, description, footer, children }: DialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {children}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * radix(shadcn) Select를 공유 TypeSelect 계약에 맞춘 어댑터.
 */
function TypeSelect({ value, onValueChange, options, ariaLabel }: TypeSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next) {
          onValueChange(next as AnnotationType);
        }
      }}
    >
      <SelectTrigger aria-label={ariaLabel} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {ariaLabel ? <SelectLabel>{ariaLabel}</SelectLabel> : null}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export const annotationDialogComponents: AnnotationDialogComponents = {
  DialogShell,
  TypeSelect,
  Textarea,
  Button,
};
