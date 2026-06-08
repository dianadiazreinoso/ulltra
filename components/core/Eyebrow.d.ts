import * as React from "react";

/** Mono UPPERCASE eyebrow / kicker label, optionally with a leading numeral. */
export interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  /** Optional leading numeral or section mark, e.g. "§ 05" or "01". */
  numeral?: React.ReactNode;
  /** Tune colours for use on a light paper surface. @default false */
  onPaper?: boolean;
}

export function Eyebrow(props: EyebrowProps): JSX.Element;
