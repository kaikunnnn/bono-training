/**
 * RoadmapPattern4: Intelligent Modular (Sidebar-Aware)
 *
 * Design Concept: "Contextual Flow"
 * - Sidebar-friendly layout (Single column main container with internal grid)
 * - Modular sections for each step
 * - Overview-first approach for Hero section
 * - Progressive disclosure elements
 */

import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, PlayCircle, BookOpen, Check, ChevronRight, Clock } from 'lucide-react';
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
        map[slug] = urlFor(lesson.iconImage).width(320).height(180).url();
      } else if (lesson.thumbnailUrl) {
        map[slug] = lesson.thumbnailUrl;
      } else if (lesson.thumbnail?.asset?._ref) {
        map[slug] = urlFor(lesson.thumbnail).width(320).height(180).url();
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
    <section className="pt-20 pb-20 md:pt-32 md:pb-24 border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white text-xs font-bold tracking-widest uppercase mb-8">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              Interactive Course
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 font-rounded-mplus leading-[1.1]">
              UI Visual<br />
              Foundation
            </h1>
            
            <p className="text-lg text-slate-600 font-noto-sans-jp leading-relaxed max-w-2xl">
              {uivisualCourse.description}
            </p>
          </div>

          <div className="flex flex-col gap-6 min-w-[240px]">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Duration</span>
              <span className="text-2xl font-mono font-bold text-slate-900">{uivisualCourse.duration}</span>
            </div>
            
            <Link
              to="/subscription"
              className="group flex items-center justify-between w-full px-6 py-4 bg-slate-900 text-white hover:bg-blue-600 transition-all duration-300"
            >
              <span className="font-bold tracking-wide text-sm">START NOW</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

interface StepModuleProps {
  step: RoadmapStep;
  index: number;
  lessonIconMap: LessonIconMap;
}

const StepModule = ({ step, index, lessonIconMap }: StepModuleProps) => {
  const stepNumber = String(step.number).padStart(2, '0');

  return (
    <section className="py-20 md:py-32 border-b border-gray-100 last:border-0">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Left: Sticky Index & Title */}
          <div className="md:col-span-4 relative">
            <div className="md:sticky md:top-32">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-6xl md:text-8xl font-bold text-gray-100 font-mono leading-none select-none">
                  {stepNumber}
                </span>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b-2 border-slate-900 pb-1">
                  Step
                </span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 font-rounded-mplus leading-tight">
                {step.title}
              </h2>
              
              <div className="space-y-6">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Goal</span>
                  <p className="text-sm text-slate-600 font-noto-sans-jp leading-relaxed">
                    {step.goal}
                  </p>
                </div>
                
                {step.duration && (
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                    <Clock className="w-3 h-3" />
                    {step.duration}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Content List */}
          <div className="md:col-span-8">
            {step.description && (
              <p className="text-gray-500 font-noto-sans-jp mb-12 text-sm leading-relaxed border-l-2 border-gray-100 pl-6">
                {step.description}
              </p>
            )}

            <div className="flex flex-col gap-4">
              {step.contents.map((content, idx) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  index={idx}
                  lessonIconMap={lessonIconMap}
                />
              ))}
            </div>

            {step.challenge && (
              <div className="mt-12 pt-12 border-t border-gray-100">
                <Link 
                  to={step.challenge.link}
                  className="group block bg-gray-50 hover:bg-slate-900 transition-colors duration-500 p-8 relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <span className="inline-block text-[10px] font-bold text-blue-600 group-hover:text-blue-400 uppercase tracking-widest mb-3">
                      Challenge
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-white transition-colors mb-2">
                      {step.challenge.title}
                    </h3>
                    <p className="text-sm text-gray-500 group-hover:text-gray-400 font-noto-sans-jp max-w-lg mb-6">
                      {step.challenge.description}
                    </p>
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 group-hover:text-white border-b border-slate-900 group-hover:border-white pb-1 transition-colors">
                      Start Challenge
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                  
                  {/* Decorative */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gray-200/50 rounded-full blur-3xl group-hover:bg-blue-900/50 transition-colors" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

interface ContentCardProps {
  content: RoadmapContent;
  index: number;
  lessonIconMap: LessonIconMap;
}

const ContentCard = ({ content, index, lessonIconMap }: ContentCardProps) => {
  const slug = extractSlugFromLink(content.link);
  const iconUrl = slug ? lessonIconMap[slug] : null;

  return (
    <Link
      to={content.link}
      className="group relative flex items-start gap-6 p-6 bg-white border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-0.5"
    >
      {/* Thumbnail */}
      <div className="w-24 h-24 md:w-32 md:h-20 shrink-0 bg-gray-100 overflow-hidden relative">
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={content.title}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
            {content.label === '動画' ? <PlayCircle className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-[10px] text-gray-300 font-bold">
            {(index + 1).toString().padStart(2, '0')}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${
            content.label === '動画' ? 'text-blue-600' : 'text-orange-600'
          }`}>
            {content.label}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors font-rounded-mplus leading-snug">
          {content.title}
        </h3>
        
        {content.description && (
          <p className="text-xs text-gray-500 font-noto-sans-jp line-clamp-1 group-hover:text-gray-600 transition-colors">
            {content.description}
          </p>
        )}
      </div>

      {/* Action */}
      <div className="self-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        <ArrowUpRight className="w-5 h-5 text-slate-900" />
      </div>
    </Link>
  );
};

const CompletionSection = () => {
  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 text-white mb-8 shadow-xl shadow-slate-200">
          <Check className="w-6 h-6" />
        </div>
        
        <h2 className="text-4xl font-bold text-slate-900 mb-6 font-rounded-mplus">
          Course Completed
        </h2>
        
        <p className="text-gray-500 font-noto-sans-jp mb-12 leading-relaxed">
          {uivisualCourse.completionMessage}
        </p>
        
        <Link
          to="/roadmap"
          className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold text-sm hover:bg-blue-600 transition-colors"
        >
          Explore Next Course
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

// ========================================
// Main Layout
// ========================================

const RoadmapPattern4 = () => {
  const lessonIconMap = useLessonIconMap();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Mock Global Navigation Placeholder (for dev visualization) */}
      {/* In production, this would be the actual sidebar */}
      {/* <div className="hidden lg:block fixed top-0 left-0 w-64 h-full bg-gray-50 border-r border-gray-200 z-40 pointer-events-none opacity-50"></div> */}

      {/* Main Content Area */}
      <div className="w-full">
        {/* Top Bar */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link
              to="/dev/roadmap-patterns"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest"
            >
              <ArrowLeft className="w-3 h-3" />
              Patterns
            </Link>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">
              Bono Training
            </span>
          </div>
        </div>

        <HeroSection />

        <div className="flex flex-col">
          {uivisualCourse.steps.map((step, index) => (
            <StepModule
              key={step.number}
              step={step}
              index={index}
              lessonIconMap={lessonIconMap}
            />
          ))}
        </div>

        <CompletionSection />
      </div>
    </div>
  );
};

export default RoadmapPattern4;
