const paths: Record<string, string> = {
  dashboard: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  transfer: "M4 7h16m-5-5 5 5-5 5M20 17H4m5-5-5 5 5 5",
  exchange:
    "M4 9a8 8 0 0 1 14-4l2 2M20 3v4h-4M20 15A8 8 0 0 1 6 19l-2-2M4 21v-4h4",
  users:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.9M16 3a4 4 0 0 1 0 8",
  user: "M20 21v-2a7 7 0 0 0-14 0v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  building: "M4 21V5l8-3v19M12 8h8v13M2 21h20M7 7v1m0 3v1m0 3v1m9-4h1m-1 4h1",
  wallet: "M20 8V4H5a3 3 0 0 0 0 6h16v11H5a3 3 0 0 1-3-3V7M21 13h-6v5h6",
  chart: "M3 3v18h18M7 16v-5m5 5V7m5 9V4",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v5l3 2",
  layers: "m12 2 10 5-10 5L2 7zM2 12l10 5 10-5M2 17l10 5 10-5",
  search: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 6 6",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1",
  moon: "M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10",
  menu: "M3 5h18M3 12h18M3 19h18",
  chevron: "m9 5 7 7-7 7",
  down: "M12 3v18m-7-7 7 7 7-7",
  up: "M12 21V3m-7 7 7-7 7 7",
  arrow: "M20 12H4m6-6-6 6 6 6",
  tool: "m14 6 4-4a6 6 0 0 1-7 8L3 18a2 2 0 0 0 3 3l8-8a6 6 0 0 0 8-7l-4 4z",
  shield: "m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6zM8 12l3 3 5-6",
};
export default function Icon({
  name,
  size = 20,
}: {
  name: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.layers} />
    </svg>
  );
}
