"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CourseContent from "./CourseContent";
import ExplainHeading from "./ExplainHeading";

export default function CourseSectionUIUX() {
  return (
    <section className="w-full py-16 lg:py-20 from-white to-pink-50/50">
      <div className="container w-full p-0 ">
        <div className="mx-auto ">
          {/* Heading */}
          <ExplainHeading text="UI/UXデザイン基礎学習コース" />

          {/* Course Content */}
          <CourseContent />
        </div>
      </div>
    </section>
  );
}
