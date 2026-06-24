import {
  LandingNavbar,
  HeroSection,
  BenefitsSection,
  TokensSection,
  ServicesSection,
  FaqSection,
  FinalCtaSection,
  LandingFooter,
} from '@features/landing';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <main>
        <HeroSection />
        <BenefitsSection />
        <TokensSection />
        <ServicesSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
