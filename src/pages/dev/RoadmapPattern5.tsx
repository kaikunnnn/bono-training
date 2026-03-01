/**
 * RoadmapPattern5: Craft/Notion Style "Structured Document"
 *
 * Design Concept: "The Structured Syllabus"
 * - Information Architecture: Overview -> Details flow
 * - Bento Grid for Course Meta-data
 * - Split Layout for Steps (Context on Left, Content on Right)
 * - High fidelity typography and iconography
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, PlayCircle, BookOpen, Check, Star, 
  Clock, Award, Zap, Layout, MousePointer2, ChevronRight
} from 'lucide-react';
import { uivisualCourse } from '@/data/roadmap/courses';
import type { RoadmapStep, RoadmapContent } from '@/data/roadmap/types';
import { useLessons } from '@/hooks/useLessons';
import { urlFor } from '@/lib/sanity';

// ========================================
// Utilities
// ========================================
type LessonIconMap = Record<string, string | null>;

const extractSlugFromLink = (link: string): string | null => {
  const match = link.match(/\/series\/([^/]+)/);
  return match ? match[1] : null;
};

const useLessonIconMap = (): LessonIconMap => {
  const { data: lessons } = useLessons();

  return useMemo(() => {
    if (!lessons) return {};
    const map: LessonIconMap = {};
    lessons.forEach((lesson) => {
      const slug = lesson.slug?.current;
      if (!slug) return;
      if (lesson.iconImageUrl) {
        map[slug] = lesson.iconImageUrl;
      } else if (lesson.iconImage?.asset?._ref) {
        map[slug] = urlFor(lesson.iconImage).width(160).height(160).url();
      } else if (lesson.thumbnailUrl) {
        map[slug] = lesson.thumbnailUrl;
      } else if (lesson.thumbnail?.asset?._ref) {
        map[slug] = urlFor(lesson.thumbnail).width(160).height(160).url();
      }
    });
    return map;
  }, [lessons]);
};

// ========================================
// Components
// ========================================

const HeroSection = () => {
  return (
    <header className="pt-24 pb-16 px-6 max-w-5xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide mb-6 border border-blue-100">
        Interactive Course
      </div>
      <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6 font-rounded-mplus">
        UI Visual Foundation
      </h1>
      <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-noto-sans-jp mb-10">
        {uivisualCourse.description}
      </p>
      
      {/* Bento Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        <div className="col-span-2 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center gap-2">
          <Clock className="w-8 h-8 text-blue-500 mb-1" />
          <div className="text-2xl font-bold text-slate-900 font-mono">{uivisualCourse.duration}</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Duration</div>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center gap-2">
          <Layout className="w-6 h-6 text-purple-500 mb-1" />
          <div className="text-xl font-bold text-slate-900">4 Steps</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Curriculum</div>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center gap-2">
          <Award className="w-6 h-6 text-orange-500 mb-1" />
          <div className="text-xl font-bold text-slate-900">Cert</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Upon Completion</div>
        </div>
      </div>
    </header>
  );
};

interface StepSectionProps {
  step: RoadmapStep;
  index: number;
  lessonIconMap: LessonIconMap;
  isLast: boolean;
}

const StepSection = ({ step, index, lessonIconMap, isLast }: StepSectionProps) => {
  const stepNumber = String(step.number).padStart(2, '0');
  
  return (
    <section className={`py-16 md:py-24 border-t border-gray-100 ${index === 0 ? 'border-t-0' : ''}`}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          
          {/* Left Column: Context (Why & What) */}
          <div className="md:col-span-4 relative">
            <div className="sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white font-mono text-xl font-bold shadow-lg shadow-slate-200">
                  {stepNumber}
                </span>
                <span className="h-px flex-1 bg-gray-200" />
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-4 font-rounded-mplus leading-tight">
                {step.title}
              </h2>
              
              <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 mb-6">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Zap className="w-3 h-3" /> Goal
                </div>
                <p className="text-sm font-medium text-slate-700 font-noto-sans-jp leading-relaxed">
                  {step.goal}
                </p>
              </div>

              {step.description && (
                <p className="text-sm text-gray-500 font-noto-sans-jp leading-relaxed">
                  {step.description}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Content (How) */}
          <div className="md:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Curriculum
              </h3>
              {step.duration && (
                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  Approx. {step.duration}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {step.contents.map((content, idx) => (
                <ContentBlock
                  key={content.id}
                  content={content}
                  index={idx}
                  lessonIconMap={lessonIconMap}
                />
              ))}
            </div>

            {step.challenge && (
              <div className="mt-8">
                <Link
                  to={step.challenge.link}
                  className="group block relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 transition-all hover:shadow-xl hover:shadow-slate-200"
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 uppercase tracking-widest mb-1">
                        <Star className="w-3 h-3 fill-current" /> Challenge
                      </div>
                      <h4 className="text-lg font-bold font-rounded-mplus group-hover:text-white transition-colors">
                        {step.challenge.title}
                      </h4>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

interface ContentBlockProps {
  content: RoadmapContent;
  index: number;
  lessonIconMap: LessonIconMap;
}

const ContentBlock = ({ content, index, lessonIconMap }: ContentBlockProps) => {
  const slug = extractSlugFromLink(content.link);
  const iconUrl = slug ? lessonIconMap[slug] : null;

  return (
    <Link
      to={content.link}
      className="group flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] transition-all duration-300"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl bg-gray-50 overflow-hidden relative border border-gray-100">
        {iconUrl ? (
          <img 
            src={iconUrl} 
            alt="" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            {content.label === '動画' ? <PlayCircle className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md ${
            content.label === '動画' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
          }`}>
            {content.label}
          </span>
          {content.duration && (
            <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {content.duration}
            </span>
          )}
        </div>
        
        <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-1 leading-snug group-hover:text-blue-600 transition-colors font-rounded-mplus">
          {content.title}
        </h4>
        
        <p className="text-xs sm:text-sm text-gray-500 line-clamp-1 group-hover:text-gray-600">
          {content.description}
        </p>
      </div>

      <div className="self-center hidden sm:flex w-8 h-8 rounded-full bg-gray-50 items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
        <ChevronRight className="w-4 h-4" />
      </div>
    </Link>
  );
};

const CompletionSection = () => {
  return (
    <section className="py-24 bg-slate-900 text-white text-center">
      <div className="max-w-3xl mx-auto px-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-white/20 mb-8">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-4xl font-bold mb-6 font-rounded-mplus">
          コース完了
        </h2>
        <p className="text-lg text-gray-400 font-noto-sans-jp mb-10 max-w-xl mx-auto">
          {uivisualCourse.completionMessage}
        </p>
        <Link
          to="/roadmap"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-gray-100 transition-colors"
        >
          次のコースを探す
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

// ========================================
// Main Layout
// ========================================

const RoadmapPattern5 = () => {
  const lessonIconMap = useLessonIconMap();

  return (
    <div className="min-h-screen bg-[#FBFBFD] font-sans text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FBFBFD]/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            to="/dev/roadmap-patterns"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Patterns
          </Link>
          <div className="flex items-center gap-3">
             <Link to="/subscription" className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
               Start Learning
             </Link>
          </div>
        </div>
      </nav>

      <main>
        <HeroSection />
        
        {uivisualCourse.steps.map((step, index) => (
          <StepSection
            key={step.number}
            step={step}
            index={index}
            lessonIconMap={lessonIconMap}
            isLast={index === uivisualCourse.steps.length - 1}
          />
        ))}
        
        <CompletionSection />
      </main>

      <footer className="py-12 text-center text-xs font-bold text-gray-300 uppercase tracking-widest border-t border-gray-100 bg-white">
        Designed with Functional Precision
      </footer>
    </div>
  );
};

export default RoadmapPattern5;
