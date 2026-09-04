import { FileText, Bot, ScanSearch, Gauge, Send } from 'lucide-react';

const steps = [
  {
    Icon: FileText,
    num: '01',
    title: 'Report',
    text: 'Describe the civic problem in your own words, speak it in English, Hindi or Marathi, or attach a photograph.',
  },
  {
    Icon: Bot,
    num: '02',
    title: 'Understand',
    text: 'AI reads the complaint and identifies the issue, category, department, severity and confidence.',
  },
  {
    Icon: ScanSearch,
    num: '03',
    title: 'Verify',
    text: 'AI compares your description against the photographic evidence to check the report is consistent.',
  },
  {
    Icon: Gauge,
    num: '04',
    title: 'Prioritize',
    text: 'A transparent scoring engine determines severity and priority from validated inputs.',
  },
  {
    Icon: Send,
    num: '05',
    title: 'Respond',
    text: 'The verified report is routed conceptually to the responsible department with a unique reference ID.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-slate-100 bg-slate-50/60 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-[12.5px] font-bold uppercase tracking-[0.18em] text-civic-blue">
            The CivicAI workflow
          </p>
          <h2 className="mt-3 text-[30px] font-extrabold tracking-tight text-navy-950 sm:text-[36px]">
            How CivicAI Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15.5px] leading-relaxed text-slate-600">
            From a citizen&apos;s first words to a routed, verified report in five clear stages.
          </p>
        </div>

        <ol className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {steps.map(({ Icon, num, title, text }, i) => (
            <li
              key={num}
              className="card relative !p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover"
            >
              {i < steps.length - 1 && (
                <span
                  className="absolute -right-3.5 top-10 hidden h-px w-3.5 bg-slate-300 lg:block"
                  aria-hidden
                />
              )}
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-civic-blue">
                  <Icon size={21} strokeWidth={2.1} aria-hidden />
                </span>
                <span className="text-2xl font-extrabold tracking-tight text-slate-200">{num}</span>
              </div>
              <h3 className="mt-4 text-[16px] font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-slate-500">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
