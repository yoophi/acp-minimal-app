import { describe, expect, it } from "vitest";

import { computeVirtualRowRange } from "./virtual-rows";

describe("computeVirtualRowRange", () => {
  it("returns only the rows near the viewport with overscan", () => {
    const range = computeVirtualRowRange({
      rowCount: 1_000,
      rowHeight: 32,
      scrollTop: 3_200, // row 100부터 보임
      viewportHeight: 320, // row 10개 표시
      containerOffsetTop: 0,
      overscan: 5,
    });

    expect(range.startIndex).toBe(95);
    expect(range.endIndex).toBe(115);
    expect(range.totalHeight).toBe(32_000);
  });

  it("accounts for content above the row container", () => {
    const range = computeVirtualRowRange({
      rowCount: 100,
      rowHeight: 32,
      scrollTop: 400,
      viewportHeight: 320,
      containerOffsetTop: 400, // row 컨테이너 위에 다른 콘텐츠가 있는 경우
      overscan: 0,
    });

    expect(range.startIndex).toBe(0);
    expect(range.endIndex).toBe(10);
  });

  it("clamps to the available rows", () => {
    const range = computeVirtualRowRange({
      rowCount: 5,
      rowHeight: 32,
      scrollTop: 10_000,
      viewportHeight: 320,
      containerOffsetTop: 0,
    });

    expect(range.startIndex).toBeLessThanOrEqual(4);
    expect(range.endIndex).toBe(4);
  });

  it("handles empty lists", () => {
    const range = computeVirtualRowRange({
      rowCount: 0,
      rowHeight: 32,
      scrollTop: 0,
      viewportHeight: 320,
      containerOffsetTop: 0,
    });

    expect(range.endIndex).toBe(-1);
    expect(range.totalHeight).toBe(0);
  });
});
