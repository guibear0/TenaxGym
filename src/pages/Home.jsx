import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import CTASection from "../components/CTASection";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}
