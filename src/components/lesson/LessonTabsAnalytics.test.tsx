import { useState } from 'react';
import { render, fireEvent, screen, waitFor, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import LessonTabs from './LessonTabs';
import LessonIntroAnalytics from './LessonIntroAnalytics';
import { trackEvent } from '@/lib/analytics';
vi.mock('@/lib/analytics',()=>({trackEvent:vi.fn()}));
vi.mock('@/lib/analytics/config',()=>({isAnalyticsHost:()=>true}));
const clickEvents=()=>vi.mocked(trackEvent).mock.calls.filter(([name,p])=>name==='lesson_intro_click' && p?.intro_action==='tab_select');
function Example() {
 const [active,setActive]=useState<'content'|'overview'>('content');
 return <LessonIntroAnalytics lessonId="example" path="/lessons/example" version="standard-v1"><span hidden data-lesson-member="guest"/><LessonTabs activeTab={active} onTabChange={setActive} contentTab={<p>Articles</p>} overviewTab={<p>Overview</p>}/></LessonIntroAnalytics>;
}
beforeEach(()=>{vi.clearAllMocks();window.gtag=vi.fn();});
afterEach(cleanup);
it('records a Radix tab selection once when activation happens on mousedown before click',()=>{
 render(<Example/>);
 const overview=screen.getByRole('tab',{name:'概要・目的'});
 fireEvent.mouseDown(overview,{button:0,ctrlKey:false});fireEvent.click(overview);
 expect(overview.getAttribute('aria-selected')).toBe('true');
 expect(clickEvents()).toHaveLength(1);
 expect(clickEvents()[0][1]?.button_id).toBe('overview_tab');
 fireEvent.mouseDown(overview,{button:0,ctrlKey:false});fireEvent.click(overview);
 expect(clickEvents()).toHaveLength(1);
});
it('records keyboard selection without requiring a click',async()=>{
 render(<Example/>);
 const content=screen.getByRole('tab',{name:'コンテンツ'});content.focus();
 fireEvent.keyDown(content,{key:'ArrowRight'});
 await waitFor(()=>expect(screen.getByRole('tab',{name:'概要・目的'}).getAttribute('aria-selected')).toBe('true'));
 expect(clickEvents()).toHaveLength(1);
});
