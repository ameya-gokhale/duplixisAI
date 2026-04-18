/**
 * LandingPage — full single-page marketing experience.
 * Sections: Hero → Language strip → Features → How It Works → CTA
 */
import { FeatureCard } from "@/components/FeatureCard";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowRight, Globe, Layers, Shield, Zap } from "lucide-react";
import { useEffect } from "react";
import { motion } from "motion/react";

const FEATURES = [
  {
    icon: Globe,
    title: "Multilingual NLP",
    description:
      "Detects duplicates across 10+ languages including English, Japanese, Chinese, and Arabic using advanced transformer models.",
    gradient: "from-primary/20 to-accent/10",
    stat: { value: "10+", label: "languages" },
  },
  {
    icon: Zap,
    title: "Semantic Similarity",
    description:
      "Goes beyond keyword matching — understands meaning and context to find near-duplicates even with completely different phrasing.",
    gradient: "from-primary/20 to-accent/10",
    stat: { value: "96%", label: "semantic accuracy" },
  },
  {
    icon: Shield,
    title: "High Accuracy",
    description:
      "Confidence scoring with adjustable thresholds lets you fine-tune precision vs. recall for your specific data quality needs.",
    gradient: "from-primary/20 to-accent/10",
    stat: { value: "99.2%", label: "precision" },
  },
  {
    icon: Layers,
    title: "Scalable Architecture",
    description:
      "Handles millions of records efficiently with parallel embedding pipelines and vector similarity indexing at enterprise scale.",
    gradient: "from-primary/20 to-accent/10",
    stat: { value: "1M+", label: "records / batch" },
  },
] as const;

export function LandingPage() {
  const location = useLocation();

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const targetId = location.hash.replace("#", "");
    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
    });
  }, [location.hash]);

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ── */}
      <Hero />

      {/* ── Features ── */}
      <section
        id="features"
        className="py-14 bg-background relative overflow-hidden"
        data-ocid="features.section"
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-primary/8 blur-[110px]" />
          <div className="absolute -bottom-24 -right-24 w-[360px] h-[360px] rounded-full bg-accent/8 blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 space-y-4"
          >
            <h2 className="font-display text-4xl sm:text-5xl font-bold">
              Why <span className="text-accent-ai">duplixisAI</span>?
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={i * 0.1}
                index={i + 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        className="py-14 bg-background relative overflow-hidden"
        data-ocid="how-it-works.section"
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-primary/8 blur-[110px]" />
          <div className="absolute -bottom-24 -left-24 w-[360px] h-[360px] rounded-full bg-accent/8 blur-[100px]" />
        </div>
        <div className="relative">
          <HowItWorks />
        </div>
      </section>

      {/* ── About / CTA ── */}
      <section
        id="about"
        className="py-16 bg-background relative overflow-hidden"
        data-ocid="about.section"
      >
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-primary/8 blur-[110px]" />
          <div className="absolute -bottom-24 -right-24 w-[360px] h-[360px] rounded-full bg-accent/8 blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="font-display text-4xl sm:text-5xl font-bold">
              Ready to clean your data?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload a CSV or JSON file — or enter a record manually — and our
              AI will identify duplicate entries across all language
              variations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/detect" data-ocid="about.try-now.primary_button">
              <Button
                size="lg"
                className="btn-primary border-0 text-primary-foreground gap-2 text-base px-8"
              >
                Start Detecting Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => scrollTo("features")}
              data-ocid="about.features.secondary_button"
              className="btn-secondary gap-2 flex items-center justify-center text-base px-8"
            >
              Explore Features
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
