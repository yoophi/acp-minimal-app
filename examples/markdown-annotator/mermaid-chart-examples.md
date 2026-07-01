# Mermaid Chart Examples

Markdown annotator에서 Mermaid 코드 블록이 다이어그램으로 렌더링되는지 확인하기 위한 예제 문서입니다.

## 문서 검토 흐름

```mermaid
flowchart TD
  A[Markdown 문서 열기] --> B{Mermaid 블록 감지}
  B -->|mermaid fence| C[다이어그램 렌더링]
  B -->|시작 토큰 감지| C
  C --> D[주석과 선택 기능 유지]
  D --> E[문서 변경 시 자동 갱신]
```

## 리뷰 시퀀스

```mermaid
sequenceDiagram
  participant User as 사용자
  participant Viewer as Markdown Viewer
  participant Mermaid as Mermaid Renderer
  User->>Viewer: 문서 선택
  Viewer->>Mermaid: chart source 렌더링 요청
  Mermaid-->>Viewer: SVG 반환
  Viewer-->>User: 다이어그램 표시
```

## 상태 변경

아래 블록은 `mermaid` 언어 표기 없이 시작 토큰만으로 Mermaid chart로 감지되는 예입니다.

```
stateDiagram-v2
  [*] --> Loaded
  Loaded --> Annotating: 텍스트 선택
  Annotating --> Reloaded: 파일 변경 감지
  Reloaded --> Loaded: 최신 문서 반영
```

## 일반 코드 블록

일반 코드 블록은 Mermaid로 렌더링되지 않아야 합니다.

```ts
const flowchartFactory = () => "ordinary code block";
```
