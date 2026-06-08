import * as React from "react";

/**
 * The brand's pill action button — mono, uppercase, wide-tracked.
 *
 * @startingPoint section="Core" subtitle="Volt / solid / ghost pill button" viewport="700x180"
 */
export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  /** Button label / content. */
  children: React.ReactNode;
  /**
   * Visual intent.
   * - `volt`  — lime outline → lime fill on hover. The single primary CTA. Use once per view.
   * - `solid` — near-black fill, cream ink. In-page action on paper sections.
   * - `ghost` — cream hairline outline on dark surfaces. Secondary.
   * @default "volt"
   */
  intent?: "volt" | "solid" | "ghost";
  /** Render as an anchor instead of a button. */
  href?: string;
  /** Native button type when not a link. @default "button" */
  type?: "button" | "submit" | "reset";
  /** Disabled state (0.45 opacity, no hover). */
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export function Button(props: ButtonProps): JSX.Element;
