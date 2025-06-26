import { component$, Slot } from "@builder.io/qwik";

/**
 * Props for a FeatureCard.
 */
interface FeatureCardProps {
  icon: string;
  title: string;
}

/**
 * VISUAL_FEATURE_CARD
 * - Big engaging icon, prominent title, subtle description (slot)
 */
export default component$<FeatureCardProps>(({ icon, title }) => (
  <div class="feature-card">
    <div class="feature-icon">{icon}</div>
    <div class="feature-info">
      <div class="feature-title">{title}</div>
      <div class="feature-desc">
        <Slot />
      </div>
    </div>
  </div>
));
