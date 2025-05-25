"use client";
import { useEffect, useRef, useState } from "react";
import { AuthorCard } from "./AuthorCard";
import authorData from "../app/data/authors.json";
export default function AboutUs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const [duplicatedAuthors] = useState([
    ...Object.values(authorData).flat(),
    ...Object.values(authorData).flat(),
  ]);
  const animationRef = useRef<number | undefined>(undefined);
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (scrollWrapperRef.current) {
          const scrollWidth = scrollWrapperRef.current.scrollWidth / 2;
          scrollWrapperRef.current.style.setProperty(
            "--scroll-width",
            `-${scrollWidth}px`
          );
          setStartAnimation(true);
        }
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <section id="authors" className="py-20 bg-gray-100 dark:bg-gray-900">
      <h2 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-12 px-4">
        Meet the team
      </h2>

      <div className="relative overflow-hidden w-full px-4" ref={containerRef}>
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-gray-100 dark:from-gray-900 to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-gray-100 dark:from-gray-900 to-transparent z-10" />

        <div
          ref={scrollWrapperRef}
          className="flex w-[max-content]"
          style={{
            animation: startAnimation ? "scroll 40s linear infinite" : "none",
          }}
        >
          {duplicatedAuthors.map((author, index) => (
            <div key={`${author.name}-${index}`} className="flex-shrink-0 mx-4">
              <AuthorCard {...author} />
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(var(--scroll-width, -100%));
          }
        }
      `}</style>
    </section>
  );
}
