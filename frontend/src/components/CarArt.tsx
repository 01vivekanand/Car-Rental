export type CarKind = "sedan" | "suv" | "truck" | "electric";

/** Paint colors. A vehicle's id picks one, so each car keeps the same color. */
export const PAINTS = ["#2F6FDE", "#AEB8C8", "#1C2330", "#C8102E", "#3E8E7E", "#8A6F52", "#E7EBF2"];

export function kindFromCategory(category: string): CarKind {
  const c = category.toLowerCase();
  if (c.includes("suv") || c.includes("crossover")) return "suv";
  if (c.includes("truck") || c.includes("pickup")) return "truck";
  if (c.includes("electric") || c === "ev" || c.includes("hatch")) return "electric";
  return "sedan";
}

interface Shape {
  body: string;
  glass: string[];
  wheels: number[];
}

const SHAPES: Record<CarKind, Shape> = {
  sedan: {
    body: "M12 84 L12 72 Q14 64 34 61 L74 54 Q92 34 120 30 L176 30 Q204 32 222 52 L262 60 Q288 64 290 76 L290 84 Z",
    glass: ["M96 52 Q108 38 124 36 L146 36 L146 54 Z", "M154 36 L176 36 Q194 38 206 54 L154 54 Z"],
    wheels: [70, 232],
  },
  suv: {
    body: "M10 86 L10 66 Q12 58 30 55 L58 50 Q66 30 92 26 L226 26 Q246 28 256 48 L276 54 Q292 58 292 70 L292 86 Z",
    glass: ["M78 48 Q86 34 102 32 L140 32 L140 50 Z", "M148 32 L186 32 L186 50 L148 50 Z", "M194 32 L224 32 Q238 36 246 50 L194 50 Z"],
    wheels: [66, 236],
  },
  truck: {
    body: "M10 86 L10 68 Q12 60 28 58 L60 54 Q72 30 98 28 L146 28 Q158 30 164 46 L166 56 L290 56 L290 86 Z",
    glass: ["M82 50 Q90 36 104 35 L144 35 L150 50 Z"],
    wheels: [62, 240],
  },
  electric: {
    body: "M14 84 L14 74 Q16 66 36 62 L82 50 Q104 30 140 28 L186 28 Q220 30 244 54 L276 62 Q292 66 292 78 L292 84 Z",
    glass: ["M100 50 Q114 36 140 35 L168 35 L168 52 Z", "M176 35 L188 35 Q212 38 228 52 L176 52 Z"],
    wheels: [72, 232],
  },
};

interface CarArtProps {
  kind: CarKind;
  paint: string;
  className?: string;
}

/** Side-view car illustration, drawn in SVG so it needs no image files. */
export default function CarArt({ kind, paint, className }: CarArtProps) {
  const shape = SHAPES[kind];

  return (
    <svg viewBox="0 0 300 120" aria-hidden="true" className={className}>
      <ellipse cx="150" cy="108" rx="128" ry="6" fill="#0F1B33" opacity="0.14" style={{ filter: "blur(4px)" }} />
      <path d={shape.body} fill={paint} />
      {shape.glass.map((d) => (
        <path key={d} d={d} fill="#0F1B33" opacity="0.62" />
      ))}
      <path d={shape.body} fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" />
      {shape.wheels.map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="88" r="21" fill="#141B2B" />
          <circle cx={cx} cy="88" r="10" fill="#C9D1DE" />
          <circle cx={cx} cy="88" r="3.5" fill="#141B2B" />
        </g>
      ))}
    </svg>
  );
}

const ROW: { kind: CarKind; paint: string }[] = [
  { kind: "sedan", paint: "#E7EBF2" },
  { kind: "suv", paint: "#1C2330" },
  { kind: "electric", paint: "#2F6FDE" },
  { kind: "truck", paint: "#AEB8C8" },
  { kind: "sedan", paint: "#C8102E" },
];

/** The hero row. The cars rise in one after another, once, on page load. */
export function CarRow({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`mx-auto flex max-w-6xl items-end justify-center gap-2 px-5 ${className}`}
    >
      {ROW.map((car, i) => (
        <div
          key={i}
          className={`animate-rise ${i < 3 ? "w-1/3 sm:w-1/5" : "hidden w-1/5 sm:block"}`}
          style={{ animationDelay: `${i * 130}ms` }}
        >
          <CarArt kind={car.kind} paint={car.paint} className="w-full" />
        </div>
      ))}
    </div>
  );
}