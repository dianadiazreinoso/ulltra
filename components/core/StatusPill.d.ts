import * as React from "react";

/** A pulsing status dot + mono label signalling an operational/live state. */
export interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Label text. @default "Operating 24 / 7 / 365" */
  children?: React.ReactNode;
  /** Dot colour. @default "live" */
  tone?: "live" | "accent";
}

export function StatusPill(props: StatusPillProps): JSX.Element;
