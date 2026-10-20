import "server-only";

import { createDocsContent } from "@/lib/workshop/content";
import { NUMBER_CHALLENGE_STEPS } from "./config";

export const {
  getAllDocs,
  getStepsWithDocs,
  getDocBySlug,
  getAllSlugs,
  getNextDoc,
} = createDocsContent({
  contentDir: "number-challenge",
  steps: NUMBER_CHALLENGE_STEPS,
});
