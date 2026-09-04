/**
 * Home-page headline numbers. All values are clearly labelled DEMO so they
 * are never mistaken for real CivicAI production statistics.
 */
const stats = [
  { value: '12K+', label: 'Demo reports analysed' },
  { value: '8K+', label: 'Demo resolutions mapped' },
  { value: '94%', label: 'Demo AI confidence' },
  { value: '3', label: 'Languages for voice input' },
];

export default function DemoStats() {
  return (
    <section aria-label="Demo statistics" className="border-y border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-center text-[11.5px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Demo statistics
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <dd className="text-[32px] font-extrabold tracking-tight text-navy-950 sm:text-[38px]">
                {s.value}
              </dd>
              <dt className="mt-1 text-[12.5px] font-medium text-slate-500">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
