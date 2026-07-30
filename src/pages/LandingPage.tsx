import {
  LandingNavbar,
  HeroSection,
  NosotrosSection,
  ValoresSection,
  ComparativaSection,
  TokensSection,
  AliadosSection,
  FaqSection,
  ContactoSection,
  LandingFooter,
} from '@features/landing';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <main>
        <HeroSection />
        <NosotrosSection />
        <ValoresSection />
        <ComparativaSection />
        <TokensSection />
        <AliadosSection />
        <FaqSection />
        <ContactoSection />
      </main>
      <LandingFooter />
    </div>
  );
}
