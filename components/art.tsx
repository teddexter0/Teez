import { useId, type CSSProperties } from "react";
import type { Trend } from "../lib/catalog";

type Palette = Trend["art"];

export function HeroArt() {
  const id = useId();
  const dots = `${id}-dots`;
  const fine = `${id}-fine`;
  const ink = "#191917";

  return (
    <div className="tz-hero-art" aria-hidden="true">
      <svg viewBox="0 0 600 555" preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <pattern id={dots} width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.6" fill={ink} />
          </pattern>
          <pattern id={fine} width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r=".6" fill={ink} />
          </pattern>
        </defs>
        <path fill="#dcf856" d="M0 0h600v555H0z" />
        <path fill={`url(#${fine})`} opacity=".21" d="M0 0h600v555H0z" />
        <path fill={`url(#${dots})`} opacity=".55" d="M0 385 216 555H0zM420 0h180v169z" />
        <path stroke={ink} opacity=".15" fill="none" d="M0 120h600M0 235h600M0 350h600M0 465h600M120 0v555M240 0v555M360 0v555M480 0v555" />
        <g stroke={ink} fill="none" opacity=".36" transform="rotate(-19 302 277)">
          <ellipse cx="302" cy="277" rx="273" ry="193" />
          <ellipse cx="302" cy="277" rx="258" ry="175" strokeDasharray="3 6" />
          <ellipse cx="302" cy="277" rx="233" ry="155" />
        </g>
        <g fill={ink} className="tz-hero-small-print">
          <text x="31" y="40" fontSize="12" letterSpacing="3">FIG. 01 / SIGNAL FOUND</text>
          <text x="571" y="523" textAnchor="end" fontSize="10" letterSpacing="2.5">TEEZ SIGNAL STUDIO</text>
          <text x="31" y="523" fontSize="10" letterSpacing="2.5">001 — 006</text>
        </g>
        <path fill={ink} d="M89 120v20H69v-20zm20-20v20H89v-20zm20-20v20h-20V80zm-20 40v20H89v-20zm20-20v20h-20v-20zm20-20v20h-20V80z" opacity=".92" />
        <g transform="translate(304 274) rotate(-12)">
          <path fill={ink} stroke={ink} strokeWidth="6" strokeLinejoin="round" d="M-195-104Q-195-137-158-137H171Q201-137 201-105V94Q201 126 169 126H-21l-80 67 10-67h-69q-35 0-35-34z" transform="translate(17 20)" />
          <path fill="#a49afa" stroke={ink} strokeWidth="6" strokeLinejoin="round" d="M-195-104Q-195-137-158-137H171Q201-137 201-105V94Q201 126 169 126H-21l-80 67 10-67h-69q-35 0-35-34z" transform="translate(8 11)" />
          <path fill="#f9f6e9" stroke={ink} strokeWidth="6" strokeLinejoin="round" d="M-195-104Q-195-137-158-137H171Q201-137 201-105V94Q201 126 169 126H-21l-80 67 10-67h-69q-35 0-35-34z" />
          <path fill={`url(#${dots})`} opacity=".24" d="M-192 59q117 73 391-22v56q0 30-30 30H-21l-75 64 9-64h-73q-32 0-32-32z" />
          <path fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" d="M-147 89q38 16 72 12m150-1 79-16m-314-160 13-21m-6 20 15-10" />
          <g transform="translate(0 -8)">
            <path fill="#ff503b" d="M-153 4C-65-112 75-109 161 3 73 96-68 100-153 4Z" stroke={ink} strokeWidth="6" />
            <path fill="#f9f6e9" d="M-153 4C-63-70 71-72 161 3 73 79-64 79-153 4Z" stroke={ink} strokeWidth="6" />
            <path fill={`url(#${dots})`} opacity=".22" d="M-147 7Q1 46 154 5 70 75-6 59-75 65-147 7Z" />
            <circle cx="7" cy="3" r="57" fill="#a49afa" stroke={ink} strokeWidth="5" />
            <circle cx="7" cy="3" r="37" fill={ink} />
            <path fill="#dcf856" d="M-4-18 29 3-4 23Z" />
            <circle cx="-14" cy="-31" r="8" fill="#f9f6e9" />
            <path d="M-81-61-93-83m41 6-6-25m40 16-1-25m41 23 6-25m33 33 12-22m24 39 17-17" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" />
          </g>
        </g>
        <g stroke={ink} strokeWidth="3.5" strokeLinejoin="round">
          <path fill="#ff503b" d="m500 75 13 30 31-10-15 29 27 18-33 4-3 33-21-25-28 18 7-32-31-11 28-15-10-31 29 14z" />
          <path fill="#f9f6e9" d="m102 376 8 31 30 8-30 8-8 31-8-31-30-8 30-8z" />
          <path fill="#a49afa" d="m499 399 6 20 21 6-21 6-6 21-6-21-20-6 20-6z" />
        </g>
        <g fill={ink}>
          <path d="m500 120 4 12 13 4-13 4-4 12-4-12-12-4 12-4z" />
          <path d="M39 484h23v3H39zm10-10h3v23h-3zM556 321h19v3h-19zm8-8h3v19h-3z" />
          <circle cx="167" cy="71" r="4" />
          <circle cx="430" cy="459" r="4" />
          <circle cx="48" cy="197" r="3" />
          <circle cx="557" cy="392" r="4" />
        </g>
      </svg>
    </div>
  );
}

function PrintMark({ palette }: { palette: Palette }) {
  const variant = {
    lime: "orbit",
    pink: "flash",
    blue: "eye",
    orange: "flower",
    lilac: "tape",
    mint: "bubble",
  }[palette];

  return (
    <svg viewBox="0 0 240 240" className="tz-art-mark" focusable="false">
      <g stroke="var(--art-ink)" strokeWidth="5" strokeLinejoin="round">
        {variant === "orbit" && <>
          <circle cx="121" cy="121" r="72" fill="var(--art-accent)" />
          <path fill="none" d="M121 49c-32 38-32 106 0 144m0-144c32 38 32 106 0 144M52 106q68 32 139 0M52 142q68-32 139 0" />
          <ellipse cx="120" cy="121" rx="108" ry="29" fill="none" transform="rotate(-26 120 121)" />
          <circle cx="199" cy="72" r="12" fill="var(--art-paper)" />
          <path fill="var(--art-paper)" d="m47 43 6 16 16 6-16 5-6 16-5-16-16-5 16-6z" />
        </>}
        {variant === "flash" && <>
          <path fill="var(--art-accent)" d="m116 15 27 52 55-22-16 56 46 38-57 10-5 59-47-35-47 35-6-59-57-13 46-35-15-57 54 23z" />
          <path fill="var(--art-paper)" d="m128 54-47 70 37-4-11 56 53-78-38 7z" />
          <path fill="none" strokeLinecap="round" d="m15 67 13 12m182-22 14-12M43 184l-17 15m180-16 19 13" />
        </>}
        {variant === "eye" && <>
          <ellipse cx="120" cy="120" rx="88" ry="88" fill="none" strokeDasharray="3 8" />
          <path fill="var(--art-paper)" d="M16 119Q120 15 224 119 120 220 16 119Z" />
          <circle cx="120" cy="119" r="43" fill="var(--art-accent)" />
          <circle cx="120" cy="119" r="21" fill="var(--art-ink)" />
          <circle cx="105" cy="104" r="6" fill="var(--art-paper)" stroke="none" />
          <path fill="none" strokeLinecap="round" d="M120 45V27m0 168v18M68 59 56 43m116 16 12-16" />
        </>}
        {variant === "flower" && <>
          <path fill="var(--art-accent)" d="M120 73C82 3 34 33 70 92 1 80 4 143 74 145c-53 55 1 91 45 31 43 60 97 24 45-31 69-2 72-65 4-53 35-59-13-89-48-19Z" />
          <circle cx="120" cy="121" r="38" fill="var(--art-paper)" />
          <path fill="none" strokeLinecap="round" d="M108 110v8m23-8v8m-24 12q13 13 27 0" />
          <path fill="var(--art-paper)" d="m199 39 7 15 15 7-15 6-7 16-6-16-16-6 16-7z" />
        </>}
        {variant === "tape" && <>
          <g transform="rotate(-14 120 120)">
            <rect x="30" y="52" width="180" height="136" rx="12" fill="var(--art-accent)" />
            <path fill="var(--art-paper)" d="M42 68h156v76H42z" />
            <rect x="61" y="91" width="118" height="38" rx="19" fill="var(--art-ink)" />
            <circle cx="83" cy="110" r="10" fill="var(--art-paper)" />
            <circle cx="157" cy="110" r="10" fill="var(--art-paper)" />
            <path fill="var(--art-paper)" d="M68 188l13-28h78l13 28z" />
            <path fill="none" d="M104 111h32m-86 55h8m125 0h7" />
          </g>
        </>}
        {variant === "bubble" && <>
          <path fill="var(--art-accent)" d="M184 51H59c-19 0-31 14-31 33v65c0 18 14 30 33 30h25l-8 33 47-33h57c18 0 31-13 31-31V83c0-18-12-32-29-32Z" />
          <path fill="var(--art-paper)" d="M174 35H49c-19 0-31 14-31 33v65c0 18 14 30 33 30h25l-8 33 47-33h57c18 0 31-13 31-31V67c0-18-12-32-29-32Z" />
          <path strokeLinecap="round" d="M58 83h104M58 102h74m-74 19h85" />
          <path fill="var(--art-accent)" d="m194 16 5 12 13 5-13 5-5 13-5-13-12-5 12-5z" />
        </>}
      </g>
    </svg>
  );
}

export function TrendArt({
  trend,
  variant = "tile",
  playing = false,
  replayKey = 0,
}: {
  trend: Trend;
  variant?: "tile" | "player" | "cover";
  playing?: boolean;
  replayKey?: number | string;
}) {
  const isPlayer = variant === "player";

  return (
    <div
      className={`tz-art tz-art--${trend.art} tz-art--${variant}`}
      aria-hidden="true"
      data-playing={playing ? "yes" : "no"}
      style={{ "--art-duration": `${trend.seconds}s` } as CSSProperties}
    >
      <div className="tz-art-content" key={`${trend.id}:${replayKey}`}>
        <PrintMark palette={trend.art} />
        <div className="tz-art-caption">
          <span className="tz-art-overline">{isPlayer ? "THE MOMENT" : trend.category}</span>
          <strong>{isPlayer ? trend.hook : trend.title}</strong>
        </div>
        {isPlayer && (
          <div className="tz-art-usage">
            <span className="tz-art-overline">IN THE WILD</span>
            <strong>{trend.example}</strong>
          </div>
        )}
        <span className="tz-art-corner">T.</span>
      </div>
    </div>
  );
}

export function CoverArt({ palette, label }: { palette: Palette; label: string }) {
  return (
    <div className={`tz-art tz-art--${palette} tz-art--cover`} aria-hidden="true">
      <div className="tz-art-content">
        <PrintMark palette={palette} />
        <div className="tz-art-caption">
          <span className="tz-art-overline">THE TEEZ ARCHIVE</span>
          <strong>{label}</strong>
        </div>
        <span className="tz-art-corner">T.</span>
      </div>
    </div>
  );
}
