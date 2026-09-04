import ReportWizard from '@/components/report/ReportWizard';

export const metadata = {
  title: 'Report an Issue',
  description:
    'Describe a civic problem with text or voice, attach photographic evidence and let CivicAI verify, prioritize and route it.',
};

export default function ReportPage() {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-60"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 0%, rgba(37,99,235,0.05), transparent 60%)',
        }}
      />
      <ReportWizard />
    </div>
  );
}
