import { component$ } from "@builder.io/qwik";
import NavBar from "../components/NavBar";
import FeatureCard from "../components/FeatureCard";
import "./index.css"; // reuse homepage styles for modern, cohesive look

// PUBLIC_INTERFACE
/**
 * The dedicated Features page for TaskFlow.
 * Includes: Hero, four feature cards with icons/text, embedded video demo, testimonial/app stat, and a call-to-action to start using the app.
 */
export default component$(() => {
  return (
    <>
      <NavBar />
      <main class="home-main">
        {/* Hero Section */}
        <section class="hero" style={{marginBottom: "0"}}>
          <div class="hero-content" style={{alignItems: "center", textAlign: "center"}}>
            <h1>
              Discover <span class="primary-gradient">All TaskFlow Features</span>
            </h1>
            <p class="hero-subtitle">
              Everything you need to boost your productivity—seamlessly organized, visually inspiring, and utterly simple.
            </p>
          </div>
        </section>

        {/* Features Cards Section */}
        <section class="features">
          <h2 class="features-title">Unlock Productivity Superpowers</h2>
          <div class="features-grid">
            <FeatureCard icon="📝" title="Effortless Task Management">
              Add, view, edit, and clear tasks instantly, with zero learning curve.
            </FeatureCard>
            <FeatureCard icon="⚡️" title="Real-Time Sync">
              Experience blazing-fast real-time updates—changes appear instantly across your app.
            </FeatureCard>
            <FeatureCard icon="📊" title="Progress & Stats">
              Track completions, streaks, and analyze your productivity trends with built-in visuals.
            </FeatureCard>
            <FeatureCard icon="🔔" title="Smart Reminders">
              Always stay on track—TaskFlow reminds you before tasks slip your mind.
            </FeatureCard>
          </div>
        </section>

        {/* Video Demo Section */}
        <section class="features" style={{marginTop: 38}}>
          <h2 class="features-title" style={{fontSize: "1.35rem", marginBottom: 20}}>
            See TaskFlow in Action
          </h2>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "18px",
            marginTop: "0",
          }}>
            {/* VIDEO DEMO: Replace `src` with real video when available */}
            <div style={{
              borderRadius: "16px",
              boxShadow: "0 2px 16px #1976d21b",
              overflow: "hidden",
              maxWidth: 520,
              width: "100%",
              background: "#f8f8fa",
            }}>
              <iframe
                title="TaskFlow App Demo"
                width="100%"
                height="305"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0" // Placeholder video
                style={{ border: "none", display: "block"}}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullscreen
              />
            </div>
            <span style={{
              fontSize: "1rem",
              color: "#616161",
              opacity: 0.8,
              fontStyle: "italic"
            }}>
              Watch how easily you can organize and accomplish your goals.
            </span>
          </div>
        </section>

        {/* Testimonial / Usage Stat Section */}
        <section class="home-extra" style={{marginTop: 46, marginBottom: 0, color: "#24292f"}}>
          <div class="extra-inner" style={{flexDirection: "column", gap: "8px"}}>
            <span class="home-placeholder" style={{fontSize: "1.12rem"}}>
              “TaskFlow helped me finally build my daily habits. Its simplicity keeps me coming back.”
              <span role="img" aria-label="star"> ⭐️⭐️⭐️⭐️⭐️ </span>
              <br />
              <span style={{fontSize: "0.93em", color: "#757575"}}>— Alex, productivity coach</span>
            </span>
            <span class="home-placeholder" style={{
              background: "linear-gradient(60deg, #1976d2cc 60%, #ffca2898 110%)",
              color: "#fff",
              fontWeight: "700",
              fontSize: "1rem",
              marginTop: "8px",
              boxShadow: "0 1px 8px #1976d220"
            }}>
              {">11,000"} tasks completed on TaskFlow last month!
            </span>
          </div>
        </section>

        {/* Call-to-Action Section */}
        <section class="features" style={{marginTop: 62, textAlign: "center"}}>
          <h2 class="features-title" style={{fontSize:'2.25rem'}}>
            Ready to start your journey?
          </h2>
          <p class="hero-subtitle" style={{
            marginBottom: 32,
            marginTop: 12,
            color: "#34396c",
            fontSize: "1.14rem"
          }}>
            Try TaskFlow today and experience the difference.
          </p>
          <a href="/tasks" class="cta-btn" aria-label="Start Using TaskFlow">
            Start Now
          </a>
        </section>
      </main>
    </>
  );
});

import type { DocumentHead } from "@builder.io/qwik-city";
export const head: DocumentHead = {
  title: "Features | TaskFlow App",
  meta: [
    {
      name: "description",
      content:
        "Explore all features of TaskFlow—effortless task management, real-time sync, reminders, and insight-rich stats. See why users trust us to power their productivity.",
    },
  ],
};
