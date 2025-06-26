import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import NavBar from "../components/NavBar";
import FeatureCard from "../components/FeatureCard";
import "./index.css";

// PUBLIC_INTERFACE
/**
 * The professional SaaS-style homepage. Features:
 * - Top navigation bar (Home, Features, Tasks)
 * - Hero section with CTA to '/tasks'
 * - Features section with visually engaging cards
 * - Modern, impactful visual design
 */
export default component$(() => {
  return (
    <>
      <NavBar />
      <main class="home-main">
        {/* Hero Section */}
        <section class="hero">
          <div class="hero-content">
            <h1>
              Build <span class="primary-gradient">better habits daily</span>
            </h1>
            <p class="hero-subtitle">
              Effortlessly track, visualize, and crush your habits — one step at a time.
            </p>
            <a href="/tasks" class="cta-btn" aria-label="Get Started with Tasks">
              Get Started
            </a>
          </div>
        </section>

        {/* Features Cards Section */}
        <section class="features">
          <h2 class="features-title">Why Choose Us?</h2>
          <div class="features-grid">
            <FeatureCard icon="📅" title="Track Daily Habits">
              Easily create, manage, and check off your tasks every day.
            </FeatureCard>
            <FeatureCard icon="📈" title="Visualize Progress">
              See your journey with beautiful streaks, charts, and stats.
            </FeatureCard>
            <FeatureCard icon="🤝" title="Stay Accountable">
              Set reminders and celebrate your streaks with peers.
            </FeatureCard>
            <FeatureCard icon="✨" title="Polished Simplicity">
              Modern, minimal, and lightning-fast — powered by Qwik + Express.
            </FeatureCard>
          </div>
        </section>

        {/* SaaS-like Professional polish. Add more placeholders or logo if desired */}
        <section class="home-extra">
          <div class="extra-inner">
            <span class="home-placeholder">🏆 Used by productivity enthusiasts worldwide</span>
            <span class="home-placeholder">🔒 Your data is always private and secure</span>
          </div>
        </section>
      </main>
    </>
  );
});

export const head: DocumentHead = {
  title: "Home | TaskFlow Habit Builder",
  meta: [
    {
      name: "description",
      content:
        "A polished, modern habit and task manager made with Qwik + Express. Track daily habits, visualize your progress, and stay accountable.",
    },
  ],
};
