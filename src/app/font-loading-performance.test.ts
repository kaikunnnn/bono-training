// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const layoutSource = readFileSync(new URL("./layout.tsx", import.meta.url), "utf8");
const globalCss = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

describe("shared Japanese font loading", () => {
  it("keeps long-form body text on the system stack", () => {
    expect(layoutSource).not.toContain("Noto_Sans_JP");
    expect(layoutSource).not.toContain("--font-noto-sans-jp-var");
    expect(globalCss).toMatch(/--font-sans:\s*system-ui/);
    expect(globalCss).toContain("--font-body: var(--font-sans)");
    expect(globalCss).toContain("--font-noto-sans-jp: var(--font-sans)");
    expect(globalCss).not.toContain("--font-noto-sans-jp-var");
  });

  it("retains the branded heading and on-demand code fonts", () => {
    expect(layoutSource).toContain("M_PLUS_1");
    expect(layoutSource).toContain("preload: false");
    expect(globalCss).toContain("--font-heading: var(--font-mplus-1-var)");
    expect(globalCss).toContain("--font-mono: var(--font-geist-mono)");
  });
});
