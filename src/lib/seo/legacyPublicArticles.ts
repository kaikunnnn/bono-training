/**
 * 旧Webflowから配信中の、非会員にも本文を公開している記事。
 * 2026-09-24に各URLのHTTP 200、自己canonical、非会員向け本文を確認した。
 * 動画レッスンや会員向け本文だけのページは含めない。
 * 移植・非公開・会員限定化した場合は、この一覧と旧サイト救済ルートを更新する。
 */
export const LEGACY_PUBLIC_ARTICLE_SLUGS: ReadonlySet<string> = new Set([
  "content-osusume",
  "design-flow-basic-for-beginner-to-improving-your-design-skills",
  "designer-uiux-mac-2025",
  "designcommunication01",
  "designerscareer",
  "figma-wrap-responsive",
  "flutter-new-app-uiprinciple",
  "landingpagedesignflow",
  "primary-color-usage",
  "q-zhi-wen-cai-yong-demisumatutiwofang-guque-ren-shi-xiang-haarimasuka",
  "q-zhi-wen-ui-uxdezainanoye-wu-fan-wei-toha-shi-chang-jia-zhi-gao-iye-wu-ha",
  "q-zhi-wen-xin-gui-kai-fa-dezainsisutemudokomadezuo-riip-mu",
  "question-autolayout-margin-adjust",
  "question-casualinterview-toolate",
  "question-component-name",
  "question-how-does-the-designer-work",
  "question-how-to-make-design-learning-fun",
  "question-insights-over-perfection",
  "question-marriage-portfolio-appeal",
  "question-solo-designer-brushup-strategy",
  "question-ui-contrast",
  "question-working-abroad",
  "uiuxdesigner-workflow",
  "webdesign-nouidesign-howtostartcareer",
  "youhadouyatedezainanibebe",
  "youhadouyatedezainani-wake",
  "zhi-wen-she-nei-tesutotoshi-ji-noyuzatesutonowei-iha",
  "zhi-wen-uinodong-kinochuan-efang-tutexian-chang-dedouyaruno",
  "zhi-wen-uinodong-kinochuan-efang-tutexian-chang-dedouyaruno-copy",
]);
