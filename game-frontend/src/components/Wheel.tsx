import React, { useEffect, useRef, useState } from 'react';

interface WheelSegment {
  label: string;
  outcome: 'jackpot' | 'medium' | 'small' | 'none';
  color: string;
}

// Visual segments for the wheel face. Multiple segments can map to the same
// backend outcome category (jackpot / medium / small / none) so the wheel
// looks varied even though the server only returns one of those four values.
export const WHEEL_SEGMENTS: WheelSegment[] = [
  { label: '10', outcome: 'small', color: '#6366f1' },
  { label: 'LOSE', outcome: 'none', color: '#334155' },
  { label: '20', outcome: 'small', color: '#8b5cf6' },
  { label: '50', outcome: 'medium', color: '#22d3ee' },
  { label: 'LOSE', outcome: 'none', color: '#475569' },
  { label: 'JACKPOT', outcome: 'jackpot', color: '#f59e0b' },
  { label: '30', outcome: 'small', color: '#10b981' },
  { label: 'LOSE', outcome: 'none', color: '#334155' },
  { label: '50', outcome: 'medium', color: '#ec4899' },
  { label: 'LOSE', outcome: 'none', color: '#475569' },
];

interface WheelProps {
  spinning: boolean;
  outcome: string | null;
  onSettle?: () => void;
}

const SIZE = 280;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 6;

function segmentIndexForOutcome(outcome: string | null): number {
  if (!outcome) return 0;
  const normalized = outcome.toLowerCase().trim();
  const matches = WHEEL_SEGMENTS.reduce<number[]>((acc, seg, i) => {
    if (seg.outcome === normalized || seg.label.toLowerCase() === normalized) acc.push(i);
    return acc;
  }, []);
  if (matches.length > 0) {
    // Pick deterministically among the matching segments so repeated identical
    // outcomes don't always land on the exact same wedge.
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
    return matches[hash % matches.length];
  }
  // Unknown outcome text - deterministically map it onto a segment so the
  // wheel still settles somewhere sensible.
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  return hash % WHEEL_SEGMENTS.length;
}

function polarToCartesian(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

function segmentPath(startAngle: number, endAngle: number) {
  const start = polarToCartesian(endAngle, RADIUS);
  const end = polarToCartesian(startAngle, RADIUS);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

const Wheel: React.FC<WheelProps> = ({ spinning, outcome, onSettle }) => {
  const segmentAngle = 360 / WHEEL_SEGMENTS.length;
  const [rotation, setRotation] = useState(0);
  const spinCountRef = useRef(0);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!spinning) return;
    spinCountRef.current += 1;
    const targetIndex = segmentIndexForOutcome(outcome);
    // Land the pointer (fixed at top, 0deg) on the middle of the target segment,
    // after a handful of full turns for a satisfying spin.
    const targetMiddle = targetIndex * segmentAngle + segmentAngle / 2;
    const extraTurns = 5 + (spinCountRef.current % 3);
    const finalRotation = extraTurns * 360 + (360 - targetMiddle);
    setRotation(finalRotation);

    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => {
      onSettle && onSettle();
    }, 3000);

    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, outcome]);

  return (
    <div className="wheel-wrap">
      <div className="wheel-pointer" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 28 28">
          <path d="M14 26 L2 6 L26 6 Z" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
        </svg>
      </div>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className={`wheel-svg${spinning ? ' is-spinning' : ''}`}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <circle cx={CENTER} cy={CENTER} r={RADIUS + 4} fill="#0f172a" />
        {WHEEL_SEGMENTS.map((segment, i) => {
          const start = i * segmentAngle;
          const end = start + segmentAngle;
          const mid = start + segmentAngle / 2;
          const labelPos = polarToCartesian(mid, RADIUS * 0.65);
          return (
            <g key={`${segment.label}-${i}`}>
              <path d={segmentPath(start, end)} fill={segment.color} stroke="#0f172a" strokeWidth="2" />
              <text
                x={labelPos.x}
                y={labelPos.y}
                fill="#f8fafc"
                fontSize={segment.label.length > 4 ? 10 : 14}
                fontWeight={700}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${mid}, ${labelPos.x}, ${labelPos.y})`}
              >
                {segment.label}
              </text>
            </g>
          );
        })}
        <circle cx={CENTER} cy={CENTER} r={16} fill="#1e293b" stroke="#6366f1" strokeWidth="3" />
      </svg>
    </div>
  );
};

export default Wheel;
