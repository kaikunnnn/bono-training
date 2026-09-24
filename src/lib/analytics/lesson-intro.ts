import { trackEvent } from "@/lib/analytics";
import { isAnalyticsHost } from "./config";

export type IntroMember = "guest" | "free" | "paid" | "unknown";
export const INTRO_VERSIONS = { persona: "persona-v1", standard: "standard-v1" } as const;

export interface IntroIdentity {
  lessonId: string;
  path: string;
  version: string;
}

// Hydration may precede next/script. Keep the original page/audience for a quick
// SPA click, including when its page unmounts before the GA bootstrap is ready.
function deliver(name: string, params: Record<string, unknown>, attempt = 0) {
  if (typeof window.gtag === "function") trackEvent(name, params);
  else if (attempt < 40) window.setTimeout(() => deliver(name, params, attempt + 1), 250);
}

/** One controller per mounted introduction. Never adds a GA page_view. */
export function observeLessonIntro(root: HTMLElement, identity: IntroIdentity) {
  if (!isAnalyticsHost(window.location.hostname)) return () => {};
  const viewed = new Set<IntroMember>();
  const exposed = new Set<string>();
  const observed = new WeakSet<Element>();
  let disposed = false;
  const member = (): IntroMember => {
    const value = root.querySelector<HTMLElement>("[data-lesson-member]")?.dataset.lessonMember;
    return value === "guest" || value === "free" || value === "paid" ? value : "unknown";
  };
  const send = (name: string, params: Record<string, unknown> = {}) => {
    if (disposed) return false;
    deliver(name, {
      lesson_id: identity.lessonId,
      intro_version: identity.version,
      member_status: member(),
      // Pin to the introduction, including clicks immediately before SPA navigation.
      page_location: window.location.origin + identity.path,
      ...params,
    });
    return true;
  };
  const ensureView = () => {
    if (document.visibilityState === "hidden") return false;
    const audience = member();
    if (!viewed.has(audience)) {
      if (!send("lesson_intro_view")) return false;
      viewed.add(audience);
    }
    return true;
  };
  const exposure = (id: string) => {
    if (!ensureView()) return;
    const key = `${member()}:${id}`;
    if (!exposed.has(key) && send("lesson_section_view", { button_id: id })) exposed.add(key);
  };
  const visible = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return !el.closest("[hidden]") && getComputedStyle(el).visibility !== "hidden"
      && rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight
      && rect.right > 0 && rect.left < innerWidth;
  };
  const inspect = () => {
    if (!ensureView()) return;
    root.querySelectorAll<HTMLElement>("[data-intro-section], [data-intro-component]").forEach((el) => {
      if (!observed.has(el)) { observer?.observe(el); observed.add(el); }
      if (visible(el)) exposure(el.dataset.introSection || el.dataset.introComponent!);
    });
  };
  const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      const el = target as HTMLElement;
      if (isIntersecting && visible(el)) exposure(el.dataset.introSection || el.dataset.introComponent!);
    });
  }, { threshold: 0.01 });
  const click = (event: MouseEvent) => {
    if ((event.type === "auxclick" && event.button !== 1) || (event.type === "click" && event.button !== 0)) return;
    const target = event.target instanceof Element ? event.target : null;
    const el = target?.closest<HTMLElement>("[data-intro-action]");
    if (!el || !root.contains(el)) {
      const link = target?.closest<HTMLAnchorElement>("a[href]");
      if (!link || !link.closest("nav, aside, header")) return;
      const url = new URL(link.href, window.location.origin);
      const paths = ["/", "/top", "/lessons", "/roadmap", "/guide", "/training", "/questions", "/subscription", "/login"];
      if (url.origin !== window.location.origin || !paths.includes(url.pathname) || !ensureView()) return;
      const component = `navigation:${url.pathname}`;
      exposure(component);
      send("lesson_intro_click", { button_id: component, intro_action: "navigation", click_url: url.pathname });
      return;
    }
    if (!el || !root.contains(el) || el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") return;
    // No selection change, no slide/tab action. Runs in capture before React updates it.
    if (el.dataset.introAction === "slide_select" && el.getAttribute("aria-current") === "true") return;
    if (el.dataset.introAction === "tab_select" && el.getAttribute("aria-selected") === "true") return;
    if (!ensureView()) return;
    const component = el.dataset.introComponent!;
    exposure(component); // A fast click also proves that its control was exposed.
    if (el.closest("[data-intro-curriculum]")) exposure("curriculum");
    const action = el.dataset.introAction === "chapter_toggle"
      ? (el.getAttribute("aria-expanded") === "true" ? "chapter_collapse" : "chapter_expand")
      : el.dataset.introAction;
    const access = el.dataset.introAccess;
    const resolvedAccess = access === "premium"
      ? (member() === "unknown" ? "unknown" : member() === "paid" ? "open" : "locked") : access;
    send("lesson_intro_click", {
      button_id: component,
      intro_action: action,
      article_id: el.dataset.introArticle || undefined,
      content_access: resolvedAccess || undefined,
      // This is a declared CMS path, never a query string or arbitrary link text.
      click_url: el.dataset.introDestination || undefined,
    });
  };
  document.addEventListener("click", click, true);
  document.addEventListener("auxclick", click, true);
  const mutation = new MutationObserver(inspect);
  mutation.observe(root, { childList: true, subtree: true, attributes: true,
    attributeFilter: ["hidden", "data-state", "data-lesson-member"] });
  document.addEventListener("visibilitychange", inspect);
  inspect();
  return () => {
    disposed = true;
    document.removeEventListener("click", click, true);
    document.removeEventListener("auxclick", click, true);
    document.removeEventListener("visibilitychange", inspect);
    mutation.disconnect();
    observer?.disconnect();
  };
}
