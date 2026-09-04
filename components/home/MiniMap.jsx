import { cn } from '@/utils/client';

const MARKER_COLOR = {
  red: '#dc2626',
  orange: '#ea580c',
  amber: '#d97706',
  sky: '#0284c7',
};

/**
 * Stylized city-map SVG backdrop (no external tiles). Used for home-page
 * product previews and the demo live-map section.
 */
export default function MiniMap({ markers = [], className, highlight = null, label = null }) {
  const streetH = [];
  for (let x = 20; x < 400; x += 44) streetH.push(x);
  const streetV = [];
  for (let y = 16; y < 300; y += 40) streetV.push(y);

  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className={cn('block h-full w-full', className)}
      role="img"
      aria-label={label || 'Stylized city map'}
    >
      <rect width="400" height="300" fill="#f1f5f9" />
      {/* water */}
      <path d="M0 0h92c-8 22-6 44 4 64 14 26 8 52-6 74-9 13-12 26-10 38H0Z" fill="#cfe6fb" opacity="0.85" />
      {/* park */}
      <ellipse cx="336" cy="52" rx="44" ry="28" fill="#d9f2e3" />
      {/* major diagonal road */}
      <path d="M-10 250 L410 60" stroke="#cbd5e1" strokeWidth="9" fill="none" />
      {/* city blocks */}
      {[
        [120, 40], [230, 40], [120, 130], [240, 120], [330, 150], [120, 220], [60, 160],
      ].map(([cx, cy], i) => (
        <g key={i} fill={i % 2 ? '#e2e8f0' : '#edf2f7'}>
          <rect x={cx} y={cy} width="56" height="34" rx="4" />
        </g>
      ))}
      {/* grid streets */}
      {streetH.map((x) => (
        <line key={`h${x}`} x1={x} y1="0" x2={x} y2="300" stroke="#dbe3ee" strokeWidth="2" />
      ))}
      {streetV.map((y) => (
        <line key={`v${y}`} x1="0" y1={y} x2="400" y2={y} stroke="#dbe3ee" strokeWidth="2" />
      ))}

      {/* markers */}
      {markers.map((m, i) => {
        const c = MARKER_COLOR[m.color] || MARKER_COLOR.sky;
        return (
          <g key={`m${i}`}>
            <circle cx={m.x} cy={m.y} r="13" fill={c} opacity="0.16" />
            <circle cx={m.x} cy={m.y} r="6.5" fill={c} stroke="#fff" strokeWidth="2" />
          </g>
        );
      })}

      {/* highlight marker (selected issue) */}
      {highlight && (
        <g>
          <circle cx={highlight.x} cy={highlight.y} r="26" fill="#2563eb" opacity="0.12">
            <animate attributeName="r" values="14;30;14" dur="2.6s" repeatCount="indefinite" />
          </circle>
          <path
            d={`M${highlight.x} ${highlight.y + 4}c7.5-9 11.5-15 11.5-19.8a11.5 11.5 0 1 0-23 0c0 4.8 4 10.8 11.5 19.8Z`}
            fill="#1e40af"
            stroke="#fff"
            strokeWidth="1.5"
          />
          <circle cx={highlight.x} cy={highlight.y - 16} r="3.4" fill="#fff" />
        </g>
      )}
    </svg>
  );
}
