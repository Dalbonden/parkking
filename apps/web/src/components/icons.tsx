import type { SVGProps } from "react";
import type { Category } from "@/lib/types";

/*
  Hand-drawn line icons (24x24, currentColor). No emoji, no icon library —
  these are the app's own marks so they inherit text color and size via
  className (e.g. `className="size-5"`).
*/

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

/** Parking — a "P" sign. */
export function ParkingIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="3" width="16" height="18" rx="3" />
      <path d="M9.5 16V8h3.1a2.4 2.4 0 0 1 0 4.8H9.5" />
    </svg>
  );
}

/** Garage — building with a roll-up door. */
export function GarageIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 21V9l8-5 8 5v12" />
      <path d="M8 21v-6h8v6" />
      <path d="M8 18h8" />
    </svg>
  );
}

/** Storage — a package/box. */
export function BoxIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 8l9-4 9 4v8l-9 4-9-4V8z" />
      <path d="M3 8l9 4 9-4" />
      <path d="M12 12v8" />
    </svg>
  );
}

/** Boat — a sailboat. */
export function BoatIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3.5 17h17l-2.2 4H5.7l-2.2-4z" />
      <path d="M12 4v9" />
      <path d="M12 5.5l5.5 7.5H12" />
    </svg>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function CreditCardIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12l5 5L20 6" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

/** Star — filled, for ratings. */
export function StarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 3.2l2.7 5.4 6 .9-4.35 4.2 1.03 5.95L12 16.9l-5.38 2.75L7.65 13.7 3.3 9.5l6-.9L12 3.2z" />
    </svg>
  );
}

/** Renders the right icon for a listing category. */
export function CategoryIcon({ category, ...props }: { category: Category } & IconProps) {
  switch (category) {
    case "parking":
      return <ParkingIcon {...props} />;
    case "garage":
      return <GarageIcon {...props} />;
    case "storage":
      return <BoxIcon {...props} />;
    case "boat":
      return <BoatIcon {...props} />;
    default:
      return <ParkingIcon {...props} />;
  }
}
