# Git Branch Graph 라이브러리 조사

## 배경

작업창 안에서 Git branch tree 또는 commit graph를 시각화하려면 두 가지를 분리해서 봐야 한다.

- Git 데이터 수집: commit hash, parent hash, branch/tag/ref, HEAD, working tree 상태
- 그래프 렌더링: lane 계산, 선/노드 배치, 선택/컨텍스트 메뉴/diff 연동

단순한 예시 그림이면 전용 라이브러리나 Mermaid로 충분하지만, 실제 Git 작업창처럼 commit 선택, branch checkout, merge/rebase/cherry-pick, diff viewer까지 붙일 계획이라면 렌더링 통제력이 중요하다.

## React에서 고려할 수 있는 라이브러리

### @gitgraph/react

`@gitgraph/react`는 Git graph 전용 React 렌더러다. GitGraph.js 계열로, 브랜치 생성, 커밋, merge 같은 Git 흐름을 코드로 표현해서 그래프로 그리는 데 적합하다.

장점:

- Git graph 전용 API라 초기 프로토타입이 빠르다.
- 문서나 데모용 브랜치 흐름을 표현하기 쉽다.
- React에서 바로 사용할 수 있다.

주의점:

- 원 GitGraph.js 저장소는 유지보수가 오래 멈췄고 archived 상태다.
- 실제 repository history를 GitHub Desktop처럼 렌더링하는 제품 기능에는 커스터마이징 한계가 있을 수 있다.
- commit row, diff, context menu, lazy loading, stash/uncommitted row 같은 작업창 기능은 별도 구현이 필요하다.

참고:

- https://www.npmjs.com/package/@gitgraph/react
- https://www.nicoespeon.com/gitgraph.js/
- https://github.com/nicoespeon/gitgraph.js/

### commit-graph 계열

`commit-graph` 또는 `@dreamcatcher-tech/commit-graph`는 React commit graph 컴포넌트 계열이다. DoltHub에서 commit graph 렌더링 목적으로 사용한 흐름이 있고, 실제 commit history 시각화에 더 가까운 선택지다.

장점:

- Git commit graph라는 용도에 비교적 직접적으로 맞는다.
- 무한 스크롤 같은 history UI 요구사항을 염두에 둔 패키지다.

주의점:

- 프로젝트 성숙도, 유지보수 상태, API 안정성을 별도로 검증해야 한다.
- 우리 앱의 디자인 시스템, Tauri 환경, Git operation 메뉴와 얼마나 잘 맞는지 확인이 필요하다.

참고:

- https://github.com/liuliu-dev/CommitGraph
- https://www.npmjs.com/package/commit-graph

### @xyflow/react 또는 React Flow

React Flow는 Git 전용이 아니라 node-edge 기반 UI 라이브러리다. 그래프 에디터, workflow editor, diagram UI에 강하다.

장점:

- pan, zoom, selection, custom node, edge, minimap 같은 인터랙션이 기본 제공된다.
- Git branch graph를 작업 플로우나 agent/worktree graph와 함께 보여줄 경우 확장성이 좋다.
- React 생태계에서 널리 쓰이고 유지보수가 활발하다.

주의점:

- Git commit lane layout은 직접 계산해야 한다.
- Git log처럼 세로 row 기반으로 촘촘히 보여주는 UI에는 다소 무거울 수 있다.
- Git graph를 “편집 가능한 노드 그래프”처럼 보여주려는 요구가 아니라면 직접 SVG보다 복잡도가 커질 수 있다.

참고:

- https://reactflow.dev/

### Mermaid gitGraph

Mermaid의 `gitGraph`는 문서용 정적 다이어그램에 적합하다.

장점:

- Markdown 문서나 설계 문서에 Git 흐름을 빠르게 넣기 좋다.
- 직접 렌더링 로직을 만들 필요가 없다.

주의점:

- 실제 repo history를 interactive workbench로 다루기에는 적합하지 않다.
- commit 선택, context menu, diff 연동, branch operation 같은 앱 기능과 결합하기 어렵다.

참고:

- https://mermaid.ai/open-source/syntax/gitgraph.html

## spec-cat/spec-cat 조사 결과

`spec-cat/spec-cat`은 React 앱이 아니라 Nuxt 3, Vue 3, TypeScript 기반 앱이다. README의 Tech Stack도 Framework를 Nuxt 3, Vue 3, TypeScript로 설명한다.

참고:

- https://github.com/spec-cat/spec-cat
- https://github.com/spec-cat/spec-cat/blob/main/package.json

`package.json` 의존성을 확인한 결과, `d3`, `cytoscape`, `vis-network`, `@gitgraph/react`, `@xyflow/react` 같은 그래프 렌더링 라이브러리는 사용하지 않는다.

대신 다음 구조로 자체 구현한다.

### 서버: Git 데이터 수집

`server/api/git/graph.get.ts`에서 graph API를 제공한다. 이 API는 commit 목록, branch 목록, 전체 commit count를 모아 응답한다.

핵심 흐름:

- `getCommitHistory(...)`로 commit history를 가져온다.
- `getBranchesFromRepo(...)`로 local/remote branch 목록을 가져온다.
- `getTotalCommitCount(...)`로 pagination 정보를 만든다.

참고:

- https://github.com/spec-cat/spec-cat/blob/main/server/api/git/graph.get.ts

`server/utils/git.ts`의 `getCommitHistory`는 `git log`를 호출하면서 full hash, short hash, subject, author, date, parent hash 목록을 파싱한다. parent hash 목록이 이후 graph lane 계산의 핵심 입력이다.

참고:

- https://github.com/spec-cat/spec-cat/blob/main/server/utils/git.ts

### 클라이언트: lane-based layout 계산

`composables/useGitGraph.ts`가 commit 배열을 받아 row별 graph data를 계산한다.

파일 주석에는 다음 의도가 명시되어 있다.

- Git graph layout computation
- lane-based algorithm for branch visualization
- SVG-per-row `GraphRowData` for inline SVG rendering

주요 처리:

- 첫 번째 commit에서 first-parent chain을 따라 mainline set을 만든다.
- commit마다 lane과 color를 배정한다.
- parent 관계를 기반으로 vertical, branch, merge segment를 만든다.
- row별로 `GraphRowData`를 만들어 렌더링 컴포넌트에 넘긴다.

참고:

- https://github.com/spec-cat/spec-cat/blob/main/composables/useGitGraph.ts

### 렌더링: row별 inline SVG

`components/git/GitGraphSvg.vue`는 row 하나에 해당하는 작은 SVG를 렌더링한다.

주요 처리:

- lane 번호를 x 좌표로 바꾼다.
- connection segment를 SVG path로 바꾼다.
- vertical line, branch curve, merge curve를 그린다.
- commit node는 `circle`로 그리며 HEAD, merge, stash, uncommitted 상태별 스타일을 다르게 둔다.

참고:

- https://github.com/spec-cat/spec-cat/blob/main/components/git/GitGraphSvg.vue

## 결론

작업창 안에서 실제 Git branch graph를 만들려면 `spec-cat/spec-cat` 방식이 가장 참고할 만하다. 즉, 외부 그래프 라이브러리에 Git history 전체를 맡기기보다 다음 구조가 현실적이다.

1. Tauri backend 또는 application service에서 `git log`, `git branch`, `git status` 등으로 구조화된 Git 데이터를 만든다.
2. frontend에서 commit parent 관계를 바탕으로 lane layout을 계산한다.
3. React 컴포넌트는 row별 SVG로 선과 commit node를 직접 렌더링한다.
4. row의 오른쪽에는 commit message, branch/tag badge, file stats, action menu를 붙인다.

추천 방향:

- 빠른 데모: `@gitgraph/react`
- 실제 제품 기능: 직접 lane layout + SVG 렌더링
- pan/zoom 가능한 큰 작업 그래프 또는 agent/worktree graph 통합: `@xyflow/react`
- 문서용 정적 그림: Mermaid `gitGraph`

우리 프로젝트가 Tauri desktop 앱이고 Git operation, worktree, agent session 같은 작업창 기능으로 확장될 가능성이 높다면, 제품 코드에는 직접 SVG 렌더링 방식을 우선 검토하는 것이 좋다. 외부 라이브러리는 초기 프로토타입이나 보조 다이어그램 용도로 제한하는 편이 리스크가 낮다.
