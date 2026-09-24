import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { observeLessonIntro } from "./lesson-intro";
import { trackEvent } from "@/lib/analytics";
import { isAnalyticsHost } from "./config";
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("./config", () => ({ isAnalyticsHost: vi.fn(() => true) }));
const identity = { lessonId: "lesson-1", path: "/lessons/example", version: "standard-v1" };
let cleanup: (() => void) | undefined;
const events = (name: string) => vi.mocked(trackEvent).mock.calls.filter(([n]) => n === name);
function mount(html = '') {
  document.body.innerHTML = `<div id="root"><span hidden data-lesson-member="guest"></span>${html}</div>`;
  const root = document.getElementById("root")!;
  cleanup = observeLessonIntro(root, identity);
  return root;
}
beforeEach(() => {
  vi.clearAllMocks(); vi.mocked(isAnalyticsHost).mockReturnValue(true);
  window.gtag = vi.fn();
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ top: 20, bottom: 40, left: 0, right: 100, width: 100, height: 20, x: 0, y: 20, toJSON() {} });
});
afterEach(() => { cleanup?.(); vi.restoreAllMocks(); vi.useRealTimers(); });
describe('lesson introduction measurement', () => {
  it('records the denominator once and distinguishes repeated clicks from people', () => {
    const root = mount('<div data-intro-curriculum><a href="/contents/a" data-intro-action="article_open" data-intro-component="article:a" data-intro-article="a">Article</a></div>');
    const link = root.querySelector('a')!;
    link.addEventListener('click', e => e.preventDefault());
    link.click(); link.click();
    expect(events('lesson_intro_view')).toHaveLength(1);
    expect(events('lesson_intro_click')).toHaveLength(2);
    expect(events('lesson_section_view').filter(([, p]) => p?.button_id === 'curriculum')).toHaveLength(1);
    expect(events('lesson_intro_click')[0][1]).toMatchObject({ lesson_id: 'lesson-1', member_status: 'guest', article_id: 'a', intro_action: 'article_open' });
    expect(events('page_view')).toHaveLength(0);
  });
  it('does not treat default expansion or hidden links as user actions', () => {
    const root = mount('<button data-intro-action="chapter_toggle" data-intro-component="chapter:1" aria-expanded="true">Chapter</button><div hidden><a data-intro-component="article:hidden">Hidden</a></div>');
    expect(events('lesson_intro_click')).toHaveLength(0);
    expect(events('lesson_section_view').some(([, p]) => p?.button_id === 'article:hidden')).toBe(false);
    root.querySelector('button')!.click();
    expect(events('lesson_intro_click')[0][1]?.intro_action).toBe('chapter_collapse');
    root.querySelector('button')!.setAttribute('aria-expanded', 'false');
    root.querySelector('button')!.click();
    expect(events('lesson_intro_click')[1][1]?.intro_action).toBe('chapter_expand');
  });
  it('handles middle-click and ignores right-click and selected slide', () => {
    const root = mount('<a data-intro-action="article_open" data-intro-component="hero_start">Start</a><button aria-current="true" data-intro-action="slide_select" data-intro-component="slide:1">Slide</button>');
    root.querySelector('a')!.dispatchEvent(new MouseEvent('auxclick', { bubbles: true, button: 1 }));
    root.querySelector('a')!.dispatchEvent(new MouseEvent('auxclick', { bubbles: true, button: 2 }));
    root.querySelector('button')!.click();
    expect(events('lesson_intro_click')).toHaveLength(1);
  });
  it('ensures an audience denominator when streamed membership becomes known', async () => {
    const root = mount('<button data-intro-action="article_open" data-intro-component="hero_start">Start</button>');
    root.querySelector<HTMLElement>('[data-lesson-member]')!.dataset.lessonMember = 'paid';
    root.querySelector('button')!.click();
    expect(events('lesson_intro_view').map(([, p]) => p?.member_status)).toEqual(['guest', 'paid']);
    expect(events('lesson_intro_click')[0][1]?.member_status).toBe('paid');
  });
  it('preserves a fast click before bootstrap even after departure', () => {
    vi.useFakeTimers();
    window.gtag = undefined as unknown as typeof window.gtag;
    const root = mount('<button data-intro-action="article_open" data-intro-component="hero_start" data-intro-access="premium">Start</button>');
    root.querySelector('button')!.click(); cleanup?.();
    expect(trackEvent).not.toHaveBeenCalled();
    window.gtag = vi.fn(); vi.advanceTimersByTime(250);
    expect(events('lesson_intro_view')).toHaveLength(1);
    expect(events('lesson_intro_click')).toHaveLength(1);
    expect(events('lesson_intro_click')[0][1]).toMatchObject({ content_access: 'locked', page_location: window.location.origin + identity.path });
  });
  it('excludes development hosts and removes listeners on departure', () => {
    vi.mocked(isAnalyticsHost).mockReturnValue(false);
    const root = mount('<button data-intro-action="article_open" data-intro-component="hero_start">Start</button>');
    root.querySelector('button')!.click();
    expect(trackEvent).not.toHaveBeenCalled();
    vi.mocked(isAnalyticsHost).mockReturnValue(true);
    cleanup = observeLessonIntro(root, identity); cleanup(); vi.mocked(trackEvent).mockClear();
    root.querySelector('button')!.click();
    expect(trackEvent).not.toHaveBeenCalled();
  });
});
