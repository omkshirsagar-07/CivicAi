import Hero from '@/components/home/Hero';
import DemoStats from '@/components/home/DemoStats';
import HowItWorks from '@/components/home/HowItWorks';
import Features from '@/components/home/Features';
import EmergencySection from '@/components/home/EmergencySection';
import MapPreview from '@/components/home/MapPreview';
import FinalCta from '@/components/home/FinalCta';

export const metadata = {
  title: 'CivicAI — Smarter Cities. Faster Response. Better Communities.',
  description:
    'Report civic problems using voice, text, images and location. CivicAI uses AI to understand, verify, prioritize and route civic complaints.',
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <DemoStats />
      <HowItWorks />
      <Features />
      <EmergencySection />
      <MapPreview />
      <FinalCta />
    </>
  );
}
