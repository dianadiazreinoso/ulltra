import * as React from "react";

/**
 * Numbered editorial card for paper sections (Capabilities / Stack): a mono
 * numeral + display title above a hairline-topped, magenta-bulleted item list.
 * Hover lifts it and darkens the top rule.
 *
 * @startingPoint section="Core" subtitle="Numbered capability card (paper)" viewport="700x360"
 */
export interface CapabilityCardProps extends React.HTMLAttributes<HTMLElement> {
  /** Mono numeral, e.g. "01" or "S · 02". */
  numeral?: React.ReactNode;
  /** Display title. */
  title: React.ReactNode;
  /** List of capability items. */
  items?: React.ReactNode[];
}

export function CapabilityCard(props: CapabilityCardProps): JSX.Element;
