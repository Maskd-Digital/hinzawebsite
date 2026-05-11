import { ContactFooter } from "@/components/ContactFooter";
import { FeaturesSection } from "@/components/FeaturesSection";
import HeroSection from '@/components/HeroSection'
import { HowItWorksSection } from "@/components/HowItWorksSection";
import Navbar from '@/components/Navbar'
import { PainSection } from "@/components/PainSection";
import { WhoItsForSection } from "@/components/WhoItsForSection";

export default function Home() {
  return (
    <main className="bg-page">
      <Navbar />
      <HeroSection />
      <PainSection />
      <HowItWorksSection />
      <FeaturesSection />
      <WhoItsForSection />
      <ContactFooter />
    </main>
  );
}
