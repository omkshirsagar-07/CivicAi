import {
  BrainCircuit,
  Siren,
  Mic,
  Gauge,
  ScanLine,
  Layers,
} from 'lucide-react';
import SectionHeading from '@/components/common/SectionHeading';

const features = [
  {
    Icon: BrainCircuit,
    title: 'AI Complaint Classification',
    text: 'Automatically understand and categorize civic complaints into the right issue and department.',
  },
  {
    Icon: Siren,
    title: 'Emergency Detection',
    text: 'Detect potentially critical situations — fire, gas leaks, medical emergencies — and flag the units to alert.',
  },
  {
    Icon: Mic,
    title: 'Voice Reporting',
    text: 'Report problems hands-free by speaking in English, Hindi or Marathi. The transcript is editable.',
  },
  {
    Icon: Gauge,
    title: 'AI Priority Score',
    text: 'Automatically determine severity and priority using AI-supported inputs plus deterministic scoring.',
  },
  {
    Icon: ScanLine,
    title: 'Evidence Verification',
    text: 'Compare the citizen’s description with the uploaded image to check the report is consistent.',
  },
  {
    Icon: Layers,
    title: 'Smart Duplicate Detection',
    text: 'Spot similar reports nearby so duplicate effort and backlog can be reduced.',
  },
];

export default function Features() {
  return (
    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Built for citizens"
          title="Civic intelligence, in your hands"
          description="Six capabilities work together to turn a citizen's observation into a verified, prioritized civic report."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ Icon, title, text }) => (
            <article
              key={title}
              className="card group !p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-card-hover"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-civic-blue transition-colors group-hover:bg-navy-900 group-hover:text-sky-300">
                <Icon size={22} strokeWidth={2} aria-hidden />
              </span>
              <h3 className="mt-5 text-[17px] font-bold text-navy-950">{title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-500">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
