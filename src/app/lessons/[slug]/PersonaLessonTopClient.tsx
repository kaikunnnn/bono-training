"use client";

import { useState } from "react";
import Image from "next/image";
import { IntentPrefetchLink } from "@/components/common/IntentPrefetchLink";
import { Book1, Briefcase, Lock1, Magicpen, Unlock } from "iconsax-react";
import { ArrowRight, FileText, Minus, Play, Plus, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LessonTopContent } from "@/lib/persona-lesson-top-config";
import { formatVideoDuration } from "@/lib/utils";
import s from "./persona-lesson-top.module.css";

export interface PersonaLessonTopArticle {
  _id: string;
  articleNumber: number;
  title: string;
  excerpt?: string;
  slug: { current: string };
  thumbnailUrl?: string;
  videoUrl?: string;
  videoDuration?: string | number;
  articleType?: "explain" | "intro" | "practice" | "challenge" | "demo";
  isPremium?: boolean;
  isLocked: boolean;
}

export interface PersonaLessonTopLesson {
  _id: string;
  title: string;
  slug: { current: string };
  iconImageUrl?: string;
  quests: {
    _id: string;
    questNumber: number;
    title: string;
    articles: PersonaLessonTopArticle[];
  }[];
}

const CONTENT_BASE_PATH = "/contents";
const ASSET_BASE_PATH = "/images/lesson-persona-ui";
const asset = (name: string) => `${ASSET_BASE_PATH}/${name}`;
const pad = (value: number) => String(value).padStart(2, "0");
const isPending = (article: PersonaLessonTopArticle) =>
  /^(製作中|制作中)[：:]/.test(article.title);
const isVideo = (article: PersonaLessonTopArticle) =>
  Boolean(article.videoUrl?.trim() || formatVideoDuration(article.videoDuration));

const articleTypeLabels: Record<
  NonNullable<PersonaLessonTopArticle["articleType"]>,
  string
> = {
  explain: "知識",
  intro: "イントロ",
  practice: "実践",
  challenge: "チャレンジ",
  demo: "実演解説",
};

function CurriculumArticle({
  article,
  index,
  hasFullAccess,
  thumbnailFallback,
}: {
  article: PersonaLessonTopArticle;
  index: number;
  hasFullAccess: boolean;
  thumbnailFallback: LessonTopContent["thumbnailFallback"];
}) {
  const pending = isPending(article);
  const video = isVideo(article);
  const duration = video ? formatVideoDuration(article.videoDuration) : null;
  const thumbnail = article.thumbnailUrl || thumbnailFallback.src;

  const content = (
    <>
      <span className={s.articleNumber}>{pad(index + 1)}</span>
      <span className={s.articleThumbnail}>
        <Image
          src={thumbnail}
          alt={article.thumbnailUrl ? `${article.title}のサムネイル` : thumbnailFallback.alt}
          fill
          sizes="(min-width: 800px) 116px, 96px"
          unoptimized={Boolean(article.thumbnailUrl)}
          className={s.articleThumbnailImage}
        />
        {video && (
          <span className={s.thumbnailPlay} aria-hidden="true">
            <Play size={15} fill="currentColor" />
          </span>
        )}
        {duration && <span className={s.thumbnailDuration}>{duration}</span>}
      </span>
      <span className={s.articleCopy}>
        <span className={s.articleMeta}>
          <span
            className={s.mediumIcon}
            role="img"
            aria-label={video ? "動画" : "記事"}
            title={video ? "動画" : "記事"}
          >
            {video ? (
              <Video size={16} strokeWidth={1.7} />
            ) : (
              <FileText size={16} strokeWidth={1.7} />
            )}
          </span>
          {article.articleType && <span>{articleTypeLabels[article.articleType]}</span>}
        </span>
        <strong>{article.title}</strong>
      </span>
      <span className={s.articleAccess}>
        {pending ? (
          <span className={s.pendingLabel}>準備中</span>
        ) : article.isPremium ? (
          article.isLocked ? (
            <span role="img" aria-label="有料" title="有料">
              <Lock1 size={18} color="currentColor" variant="Linear" />
            </span>
          ) : (
            <span className={s.unlocked} role="img" aria-label="閲覧可能" title="閲覧可能">
              <Unlock size={18} color="currentColor" variant="Linear" />
            </span>
          )
        ) : hasFullAccess ? null : (
          <span className={s.freeLabel}>無料</span>
        )}
      </span>
      <span className={s.articleArrow} aria-hidden="true">
        {!pending && <ArrowRight size={18} strokeWidth={1.7} />}
      </span>
    </>
  );

  return (
    <li className={s.articleItem}>
      {pending ? (
        <span className={`${s.articleLink} ${s.pendingArticle}`}>{content}</span>
      ) : (
        <IntentPrefetchLink data-intro-action="article_open" data-intro-component={`article:${article._id}`} data-intro-article={article._id} data-intro-access={article.isLocked ? "locked" : "open"} data-intro-destination={`${CONTENT_BASE_PATH}/${article.slug.current}`} className={s.articleLink} href={`${CONTENT_BASE_PATH}/${article.slug.current}`}>
          {content}
        </IntentPrefetchLink>
      )}
    </li>
  );
}

function CurriculumQuest({
  quest,
  index,
  hasFullAccess,
  thumbnailFallback,
}: {
  quest: PersonaLessonTopLesson["quests"][number];
  index: number;
  hasFullAccess: boolean;
  thumbnailFallback: LessonTopContent["thumbnailFallback"];
}) {
  const [open, setOpen] = useState(index === 0);
  const availableCount = quest.articles.filter((article) => !isPending(article)).length;
  const panelId = `persona-quest-${quest._id}`;

  return (
    <div className={s.quest}>
      <h3 className={s.questHeading}>
        <Button
          type="button"
          variant="unstyled"
          size="unstyled"
          className={s.questButton}
          data-intro-action="chapter_toggle"
          data-intro-component={`chapter:${quest._id}`}
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls={panelId}
        >
          <span className={s.questNumber}>{pad(index + 1)}</span>
          <span className={s.questTitleLine}>
            <strong>{quest.title}</strong>
            {availableCount ? (
              <span
                className={s.questContentCount}
                aria-label={`${availableCount}コンテンツ`}
              >
                <strong>{availableCount}</strong>
                <span>コンテンツ</span>
              </span>
            ) : (
              <span className={s.questPending}>準備中</span>
            )}
          </span>
          <span className={s.toggleIcon} aria-hidden="true">
            {open ? <Minus size={16} strokeWidth={1.8} /> : <Plus size={16} strokeWidth={1.8} />}
          </span>
        </Button>
      </h3>
      <div id={panelId} hidden={!open} className={s.questPanel}>
        <ul className={s.articleList}>
          {quest.articles.map((article, articleIndex) => (
            <CurriculumArticle
              key={article._id}
              article={article}
              index={articleIndex}
              hasFullAccess={hasFullAccess}
              thumbnailFallback={thumbnailFallback}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function OverviewMedia({
  slides,
}: {
  slides: LessonTopContent["overview"]["slides"];
}) {
  const [active, setActive] = useState(0);
  const currentSlide = slides[active] ?? slides[0];

  return (
    <div
      className={s.overviewMedia}
      role="group"
      aria-roledescription="カルーセル"
      aria-label="トレーニングの進め方"
    >
      <div className={s.mediaFrame}>
        <Image
          key={currentSlide.src}
          src={currentSlide.src}
          alt={currentSlide.alt}
          width={1920}
          height={1080}
          sizes="(min-width: 1000px) 888px, 100vw"
          className={
            currentSlide.fit === "contain"
              ? `${s.slideImage} ${s.slideImageContain}`
              : s.slideImage
          }
        />
      </div>
      <div className={s.slideThumbnails} aria-label="表示するスライドを選ぶ">
        {slides.map((slide, index) => (
          <Button
            key={slide.src}
            type="button"
            variant="unstyled"
            size="unstyled"
            className={s.slideThumbnail}
            aria-label={`${index + 1}枚目のスライドを表示`}
            aria-current={index === active ? "true" : undefined}
            data-intro-action="slide_select"
            data-intro-component={`slide:${index + 1}`}
            onClick={() => setActive(index)}
          >
            <Image
              src={slide.src}
              alt=""
              width={320}
              height={180}
              sizes="(min-width: 1000px) 170px, 112px"
            />
          </Button>
        ))}
      </div>
    </div>
  );
}

const briefIcons = {
  book: Book1,
  magicpen: Magicpen,
  briefcase: Briefcase,
};

export default function PersonaLessonTopClient({
  lesson,
  hasFullAccess,
  content,
}: {
  lesson: PersonaLessonTopLesson;
  hasFullAccess: boolean;
  content: LessonTopContent;
}) {
  const quests = lesson.quests.filter((quest) => quest.articles.length > 0);
  const firstArticle = quests
    .flatMap((quest) => quest.articles)
    .find((article) => !isPending(article));
  const startHref = firstArticle
    ? `${CONTENT_BASE_PATH}/${firstArticle.slug.current}`
    : undefined;

  return (
    <div className={s.page}>
      <div className={s.shell}>
        <nav className={s.breadcrumb} aria-label="パンくずリスト">
          <IntentPrefetchLink data-intro-action="navigation" data-intro-component="back_to_lessons" href="/lessons" className={s.backLink} aria-label="レッスン一覧へ戻る">
            <Image src={asset("back.svg")} alt="" width={20} height={20} />
          </IntentPrefetchLink>
          <IntentPrefetchLink data-intro-action="navigation" data-intro-component="back_to_lessons" href="/lessons">レッスン</IntentPrefetchLink>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{lesson.title}</span>
        </nav>

        <section className={s.hero} aria-labelledby="persona-lesson-title">
          <div className={s.heroGrid}>
            <div className={s.heroCopy}>
              <p className={s.heroEyebrow}>{content.hero.eyebrow}</p>
              <h1 id="persona-lesson-title" className={content.hero.titleWrap ? s.heroTitleWrap : undefined}>
                {content.hero.titleLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h1>
              <p className={s.heroQuestion}>{content.hero.question}</p>
              <p className={s.heroLead}>{content.hero.lead}</p>
              <div className={s.heroActions}>
                {startHref ? (
                  <Button asChild variant="persona-gradient" size="persona-cta">
                    <IntentPrefetchLink data-intro-action="article_open" data-intro-component="hero_start" data-intro-article={firstArticle?._id} data-intro-access={firstArticle?.isLocked ? "locked" : "open"} data-intro-destination={startHref} href={startHref}>
                      トレーニングをはじめる
                      <Image src={asset("start.svg")} alt="" width={18} height={18} />
                    </IntentPrefetchLink>
                  </Button>
                ) : (
                  <span className={s.startUnavailable}>公開をお待ちください</span>
                )}
                <a data-intro-action="curriculum_jump" data-intro-component="hero_curriculum" href="#curriculum" className={s.curriculumLink}>
                  カリキュラムを見る
                  <Image src={asset("down.svg")} alt="" width={15} height={15} />
                </a>
              </div>
            </div>
            <div className={s.heroArch} aria-label={content.hero.iconLabel}>
              <Image
                src={lesson.iconImageUrl || content.hero.iconFallbackSrc}
                alt={content.hero.iconAlt}
                width={224}
                height={338}
                unoptimized={Boolean(lesson.iconImageUrl)}
                className={s.courseIcon}
              />
              <span className={s.archCaption}>{content.hero.caption}</span>
            </div>
          </div>
          <div className={s.heroFooter}>
            <span>{content.hero.footerCaption}</span>
            <a data-intro-action="overview_jump" data-intro-component="hero_overview" href="#overview">
              {content.hero.footerLinkLabel}
              <Image src={asset("down.svg")} alt="" width={14} height={14} />
            </a>
          </div>
        </section>

        <section id="overview" className={s.overview} aria-labelledby="persona-overview-title">
          <div className={s.overviewHead}>
            <p className={s.kicker}>トレーニングの概要</p>
            <h2 data-intro-section="overview" id="persona-overview-title">
              {content.overview.titleLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h2>
          </div>
          <div className={s.overviewStack}>
            <div className={s.overviewCopy}>
              {content.overview.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <OverviewMedia slides={content.overview.slides} />
          </div>
        </section>

        <section data-intro-curriculum id="curriculum" className={s.section} aria-labelledby="persona-curriculum-title">
          <div className={s.sectionHeading}>
            <p className={s.kicker}>進める内容</p>
            <h2 data-intro-section="curriculum" id="persona-curriculum-title">カリキュラム</h2>
            <p>{content.curriculum.description}</p>
          </div>
          <div className={s.questList}>
            {quests.map((quest, index) => (
              <CurriculumQuest
                key={quest._id}
                quest={quest}
                index={index}
                hasFullAccess={hasFullAccess}
                thumbnailFallback={content.thumbnailFallback}
              />
            ))}
          </div>
        </section>

        <section className={s.section} aria-labelledby="persona-briefs-title">
          <div className={s.sectionHeading}>
            <p className={s.kicker}>アウトプット</p>
            <h2 data-intro-section="briefs" id="persona-briefs-title">{content.briefs.heading}</h2>
            <p className={s.briefQuestion}>{content.briefs.question}</p>
            <p>{content.briefs.description}</p>
          </div>
          <svg className={s.gradientDefinition} width="0" height="0" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="persona-brief-icon-gradient" x1="0" y1="1" x2="1" y2="0">
                <stop offset="8%" stopColor="var(--persona-gradient-start)" />
                <stop offset="73%" stopColor="var(--persona-gradient-middle)" />
                <stop offset="100%" stopColor="var(--persona-gradient-end)" />
              </linearGradient>
            </defs>
          </svg>
          <div className={s.briefGrid}>
            {content.briefs.items.map((brief) => {
              const BriefIcon = briefIcons[brief.icon];
              return (
                <article key={brief.title} className={s.briefCard}>
                  <div className={s.briefMeta}>
                    {brief.badge && <span className={s.briefBadge}>{brief.badge}</span>}
                  </div>
                  <div className={s.briefSymbol} aria-hidden="true">
                    <BriefIcon size={52} color="url(#persona-brief-icon-gradient)" variant="Linear" />
                  </div>
                  <h3>{brief.title}</h3>
                  <p>{brief.body}</p>
                </article>
              );
            })}
          </div>
          <p className={s.briefNote}>{content.briefs.note}</p>
        </section>

        <section className={s.splitSection} aria-labelledby="persona-skills-title">
          <div className={s.splitHead}>
            <p className={s.kicker}>トレーニングで</p>
            <h2 id="persona-skills-title">{content.skills.heading}</h2>
          </div>
          <ol className={s.splitList}>
            {content.skills.items.map((item, index) => (
              <li key={item.title} className={s.splitItem}>
                <span className={s.splitNumber}>{pad(index + 1)}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <SplitSection eyebrow="利用シーン" title={<>何に使える<br />トレーニングか</>} items={content.uses} />
        <SplitSection eyebrow="やってみよう" title="おすすめな人" items={content.recommendations} />

        <section className={s.splitSection} aria-labelledby="persona-author-title">
          <div className={s.splitHead}>
            <p className={s.kicker}>動画にいる人</p>
            <h2 id="persona-author-title">つくった人</h2>
          </div>
          <div className={s.author}>
            <Image src={content.author.image} alt={content.author.name} width={80} height={80} />
            <h3>{content.author.name}</h3>
            <p className={s.authorRole}>{content.author.role}</p>
            <p>{content.author.bio}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function SplitSection({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: React.ReactNode;
  items: readonly { emoji: string; title: string; body: string }[];
}) {
  const id = `persona-${eyebrow === "利用シーン" ? "uses" : "recommendations"}-title`;

  return (
    <section className={s.splitSection} aria-labelledby={id}>
      <div className={s.splitHead}>
        <p className={s.kicker}>{eyebrow}</p>
        <h2 id={id}>{title}</h2>
      </div>
      <div className={s.splitList}>
        {items.map((item) => (
          <div key={item.title} className={s.splitItem}>
            <span aria-hidden="true">{item.emoji}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
