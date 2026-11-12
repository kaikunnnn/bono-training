import { describe, expect, it } from "vitest";
import { isDocId, NOT_DOC_FILTER, IS_DOC_PROJECTION } from "./doc-content-utils";

describe("doc-content-utils (#307)", () => {
  it("doc- で始まる _id だけを作業資料とみなす", () => {
    expect(isDocId("doc-302-lesson")).toBe(true);
    expect(isDocId("drafts.doc-302-lesson")).toBe(false);
    expect(isDocId("PV7HYCRhfKn5d8wX3rOpmP")).toBe(false);
    expect(isDocId(undefined)).toBe(false);
  });

  it("GROQ の条件は doc- 前方一致を否定する", () => {
    expect(NOT_DOC_FILTER).toBe('!string::startsWith(_id, "doc-")');
    expect(IS_DOC_PROJECTION).toBe('"isDoc": string::startsWith(_id, "doc-")');
  });
});
