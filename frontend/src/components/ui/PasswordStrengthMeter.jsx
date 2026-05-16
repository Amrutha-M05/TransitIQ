import { useMemo } from 'react';

const criteria = [
  { label: '8+ characters', test: (pw) => pw.length >= 8 },
  { label: 'Uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'Lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { label: 'Number', test: (pw) => /[0-9]/.test(pw) },
  { label: 'Special character (!@#$…)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

const levels = [
  { label: 'Very Weak', color: '#ef4444', bg: '#fef2f2' },
  { label: 'Weak', color: '#f97316', bg: '#fff7ed' },
  { label: 'Fair', color: '#eab308', bg: '#fefce8' },
  { label: 'Strong', color: '#22c55e', bg: '#f0fdf4' },
  { label: 'Very Strong', color: '#16a34a', bg: '#f0fdf4' },
];

export default function PasswordStrengthMeter({ password = '' }) {
  const { score, results } = useMemo(() => {
    const results = criteria.map((c) => ({ ...c, passed: c.test(password) }));
    const score = results.filter((r) => r.passed).length;
    return { score, results };
  }, [password]);

  if (!password) return null;

  const level = levels[Math.max(score - 1, 0)];
  const pct = (score / criteria.length) * 100;

  return (
    <div className="pw-strength" style={{ '--pw-color': level.color }}>
      {/* Animated bar */}
      <div className="pw-bar-track">
        <div
          className="pw-bar-fill"
          style={{ width: `${pct}%`, background: level.color }}
        />
      </div>

      {/* Label */}
      <div className="pw-label" style={{ color: level.color }}>
        <span className="pw-label-dot" style={{ background: level.color }} />
        {level.label}
      </div>

      {/* Checklist */}
      <ul className="pw-checklist">
        {results.map((r) => (
          <li key={r.label} className={r.passed ? 'pw-pass' : 'pw-fail'}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              {r.passed ? (
                <path
                  d="M3.5 7L6 9.5L10.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <>
                  <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M5 7h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </>
              )}
            </svg>
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
