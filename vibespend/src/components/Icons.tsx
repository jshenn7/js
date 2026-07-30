type IconProps = { size?: number; stroke?: number };

export function HomeIcon({ size = 22, stroke = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AiIcon({ size = 22, stroke = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth={stroke} />
      <text
        x="12"
        y="12.5"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="currentColor"
        fontSize="8"
        fontWeight="700"
        fontFamily="Sora, Manrope, sans-serif"
      >
        AI
      </text>
    </svg>
  );
}

export function SparkIcon({ size = 22, stroke = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3M6.2 6.2l2.1 2.1M15.7 15.7l2.1 2.1M17.8 6.2l-2.1 2.1M8.3 15.7l-2.1 2.1"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth={stroke} />
    </svg>
  );
}

export function TrophyIcon({ size = 22, stroke = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 4h8v4a4 4 0 0 1-8 0V4Z"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinejoin="round"
      />
      <path
        d="M8 6H5.8A2.8 2.8 0 0 0 5.8 11.6 5.2 5.2 0 0 0 10 14M16 6h2.2A2.8 2.8 0 0 1 18.2 11.6 5.2 5.2 0 0 1 14 14"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      <path d="M10 14h4v2.5a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2V14Z" stroke="currentColor" strokeWidth={stroke} />
      <path d="M8.5 20.5h7" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon({ size = 22, stroke = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
    </svg>
  );
}

export function TransferIcon({ size = 22, stroke = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 8h11l-2.5-2.5M17 16H6l2.5 2.5"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChartIcon({ size = 22, stroke = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 19V5M5 19h14" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
      <path
        d="M9 15v-4M13 15V8M17 15v-6"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PeopleIcon({ size = 22, stroke = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth={stroke} />
      <circle cx="17" cy="9" r="2.4" stroke="currentColor" strokeWidth={stroke} />
      <path
        d="M3.5 18.5c.8-3 2.8-4.5 5.5-4.5s4.7 1.5 5.5 4.5M14.2 14.2c1.6-.4 3.3.2 4.3 2.3"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ProfileIcon({ size = 22, stroke = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth={stroke} />
      <path
        d="M5 19c1.2-3.2 3.4-4.8 7-4.8s5.8 1.6 7 4.8"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FlameIcon({ size = 22, stroke = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3c1.2 2.2.4 3.8-.6 5-1.4 1.7-2.4 3.2-2.4 5.2A5 5 0 0 0 14 18.2c2.4-.7 3.8-2.8 3.8-5.2 0-2.6-1.4-4.3-2.6-5.6.8 2-.2 3.4-1.4 3.8C15 8.4 13.8 5.8 12 3Z"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinejoin="round"
      />
    </svg>
  );
}
