import Header from "@/components/Header"
import Hero from "@/components/HeroSection"
import AboutSection from "@/components/AboutSection"
import ServicesSection from "@/components/ServicesSection"
import FeaturedProjects from "@/components/FeaturedProjects"




export default function Home() {
  return (
   <>
   <Header />
   <Hero />
   <ServicesSection />
   <AboutSection />
   <FeaturedProjects />
   </>
  );
}
