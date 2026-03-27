import SiteShell from "@/components/SiteShell";
import Hero from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import FeaturedProjects from "@/components/FeaturedProjects";
import RecommendedSection from "@/components/RecommendedSection";
import QuoteCTASection from "@/components/QuoteCTASection";

export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <SiteShell>
      <Hero />
      <ServicesSection />
      <AboutSection />
      <FeaturedProjects />
      <RecommendedSection />
      <QuoteCTASection />
    </SiteShell>
  );
}
