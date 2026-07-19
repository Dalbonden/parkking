import { StarIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/** Renders a 0–5 star rating using the app's own StarIcon. */
export function Stars({ rating, className }: { rating: number; className?: string }) {
  const rounded = Math.round(rating);
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${rating} av 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon
          key={n}
          className={cn("size-4", n <= rounded ? "text-amber-500" : "text-muted-foreground/30")}
        />
      ))}
    </span>
  );
}
