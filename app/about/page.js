import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Cpu,
  Database,
  MapPin,
  Mic,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Workflow,
} from 'lucide-react';
import SectionHeading from '@/components/common/SectionHeading';
import { CivicLogoMark } from '@/components/common/Brand';

export const metadata = { title: 'About CivicAI' };

const pillars = [
  {
    Icon: Mic,
    title: 'Voice-first for everyone',
    text: 'Not everyone types comfortably. CivicAI accepts complaints by voice in English, Hindi and Marathi and converts them into editable text.',
  },
  {
    Icon: Bot,
    title: 'AI that verifies',
    text: 'Gemini understands the complaint, checks the uploaded photograph for consistency, and detects emergencies — with human oversight at every step.',
  },
  {
    Icon: MapPin,
    title: 'Location intelligence',
    text: 'Reports are pinned to real coordinates so authorities can see where issues cluster and dispatch help efficiently.',
  },
];

const pipeline = [
  'Citizen describes problem',
  'Text or voice transcript',
  'AI complaint understanding',
  'Category detection',
  'Severity detection',
  'Department detection',
  'Priority calculation',
  'Image upload',
  'AI image analysis',
  'Text + image verification',
  'Emergency detection',
  'Duplicate detection',
  'Location confirmation',
  'Secure submission to the department system',
];

const disclaimers = [
  {
    title: 'AI-assisted, not AI-decided',
    text: 'Every classification, severity and priority produced by the model is validated and re-scored by deterministic server-side rules before storage. Final decisions rest with the responsible municipal authority.',
  },
  {
    title: 'Evidence is indicative',
    text: 'The model cannot definitively prove that a photograph is authentic or that a report is true. CivicAI uses careful language — “appears consistent”, “potentially suspicious” — and never accuses citizens automatically.',
  },
  {
    title: 'Not an emergency dialer',
    text: 'CivicAI does not contact emergency services. If a life is in danger, call 112 (India) or your local emergency number immediately.',
  },
  {
    title: 'Privacy by design',
    text: 'Names, emails and passwords are never shown publicly. The public map only exposes the issue, category, priority and approximate location.',
  },
];

const stack = [
  { Icon: Smartphone, title: 'Next.js 16 App Router', text: 'Unified React frontend + Route Handler API in one project' },
  { Icon: Cpu, title: 'Google Gemini API', text: 'Text & vision understanding, run securely server-side' },
  { Icon: Database, title: 'MongoDB Atlas + GridFS', text: 'Reports stored in documents; photos stored as GridFS files' },
  { Icon: MapPin, title: 'Google Maps', text: 'Interactive location picking and a privacy-safe public map' },
  { Icon: Mic, title: 'Web Speech API', text: 'On-device voice recognition for EN / हिं / मरा' },
  { Icon: ShieldCheck, title: 'Secure sessions', text: 'Hashed passwords, HttpOnly cookies, server-verified auth' },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-wrap items-center gap-3">
            <CivicLogoMark size={44} />
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-400">
              About CivicAI
            </p>
          </div>
          <div className="mt-8 grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center">
            <div>
              <h1 className="text-balance text-[34px] font-extrabold leading-[1.1] tracking-tight text-navy-950 sm:text-[44px]">
                An AI assistant that helps citizens and cities respond faster.
              </h1>
              <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-slate-600">
                Civic problems are often described in messy, emotional, real-world language —
                and many citizens prefer speaking to typing. CivicAI is a civic-technology
                demonstration that uses generative AI to turn those raw observations into
                structured, verified, prioritized reports that a municipal department can act on.
              </p>
              <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-slate-600">
                Everything — the interface, AI engine, image storage and citizen accounts — lives
                in a single Next.js application, which makes it simple to deploy and easy to
                explain.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/report" className="btn btn-primary !rounded-xl px-5 py-3">
                  Try reporting an issue
                  <ArrowRight size={16} aria-hidden />
                </Link>
                <Link href="/map" className="btn btn-outline !rounded-xl px-5 py-3">
                  See the live map
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-400">
                The reporting pipeline
              </p>
              <ol className="mt-5 space-y-0">
                {pipeline.map((step, i) => (
                  <li key={step} className="flex items-center gap-3 py-1.5">
                    <span
                      className={
                        i === pipeline.length - 1
                          ? 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700'
                          : 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11.5px] font-bold text-civic-blue'
                      }
                    >
                      {i === pipeline.length - 1 ? <CheckCircle2 size={14} /> : i + 1}
                    </span>
                    <span
                      className={
                        i === pipeline.length - 1
                          ? 'text-[13.5px] font-semibold text-slate-800'
                          : 'text-[13.5px] text-slate-600'
                      }
                    >
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="The idea"
            title="Three ideas power CivicAI"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {pillars.map(({ Icon, title, text }) => (
              <article key={title} className="card !p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-civic-blue">
                  <Icon size={22} aria-hidden />
                </span>
                <h3 className="mt-5 text-[17px] font-bold text-navy-950">{title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-slate-500">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50/70 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Safety & ethics"
            title="How CivicAI stays honest"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {disclaimers.map(({ title, text }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                <p className="flex items-center gap-2 text-[15px] font-bold text-navy-950">
                  <Sparkles size={16} className="text-civic-blue" aria-hidden />
                  {title}
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Technology"
            title="Built on a modern civic stack"
            description="One Next.js project hosts the entire application — no separate backend services required."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stack.map(({ Icon, title, text }) => (
              <article key={title} className="card !p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-sky-300">
                    <Icon size={19} aria-hidden />
                  </span>
                  <h3 className="text-[14.5px] font-bold text-navy-950">{title}</h3>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-slate-500">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 flex items-center justify-center">
            <p className="inline-flex max-w-2xl items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-[13px] leading-relaxed text-slate-500">
              <Workflow size={18} className="shrink-0 text-civic-blue" aria-hidden />
              This is a demonstration build for civic-technology showcases. Numbers shown on the
              homepage are labelled “demo” and are not production statistics.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
