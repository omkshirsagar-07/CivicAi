import PublicCivicMap from '@/components/map/PublicCivicMap';
import SectionHeading from '@/components/common/SectionHeading';

export const metadata = {
  title: 'Live Civic Map',
  description:
    'A privacy-safe public map of civic issues reported through CivicAI, grouped by priority.',
};

export default function MapPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <SectionHeading
        eyebrow="Live civic map"
        title="See civic issues around you"
        description="Every marker is a report submitted through CivicAI. Colours show priority —
        red for emergencies, orange high, amber medium, blue low. Only public, non-personal
        information is shown."
      />
      <div className="mt-10">
        <PublicCivicMap />
      </div>
    </div>
  );
}
