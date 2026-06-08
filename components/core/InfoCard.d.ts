import * as React from "react";

/**
 * Frosted-glass fact panel that floats over hero imagery: a mono kicker above a
 * short display statement. Place two-up in a flex row for the classic hero pair.
 */
export interface InfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Mono UPPERCASE kicker, e.g. "Origin" / "Status". */
  kicker?: React.ReactNode;
  /** The statement. */
  children: React.ReactNode;
  /** Prefix the statement with the pulsing live dot. @default false */
  statusDot?: boolean;
}

export function InfoCard(props: InfoCardProps): JSX.Element;
