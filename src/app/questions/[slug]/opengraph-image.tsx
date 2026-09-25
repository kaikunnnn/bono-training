import { generateOgImage, OG_SIZE } from "@/lib/og-image";
import { getQuestionBySlug } from "@/lib/services/questions";

export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const question = await getQuestionBySlug(slug);
  const title = question?.title?.trim() || "みんなの掲示板";

  return generateOgImage({
    title,
    description: "BONOみんなの掲示板",
  });
}

