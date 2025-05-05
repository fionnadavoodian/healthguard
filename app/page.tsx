"use client";

import React from "react";
import Navbar from "../components/Navbar";
import InfoDisease from "@/components/InfoDisease";
import ResourceList from "@/components/ResourceList";
import ResourceCard from "@/components/ReasourceCard";
import AboutUs from "@/components/AboutsUs";
import { Button } from "@/components/Button";

import diseaseData from "./data/resources.json";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="px-4 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Take Control of Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Health
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Advanced health analytics powered by AI and medical expertise. Get
              personalized insights and actionable recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 transition-transform"
                size="xl"
              >
                Start Free Assessment
              </Button>
              <Button
                variant="bordered"
                className="border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700"
                size="xl"
              >
                How It Works
              </Button>
            </div>
          </div>
          <div className="hero-image relative w-full max-w-xl">
            <img
              src="./hero.png"
              alt="Health analytics dashboard interface"
              className="w-full rounded-xl "
              loading="lazy"
            />
          </div>
        </div>
      </section>
      <section>
        <InfoDisease />
      </section>
      <section id="all-resources" className="px-4 lg:px-8 py-12">
        <h2 className="text-2xl font-semibold mb-6">All Disease Resources</h2>
        {diseaseData.map((d) => (
          <ResourceCard key={d.id} disease={d} />
        ))}
      </section>
      <section id="aboutUs" className="px-4 lg:px-8 py-20">
        <AboutUs />
      </section>
    </div>
  );
}
