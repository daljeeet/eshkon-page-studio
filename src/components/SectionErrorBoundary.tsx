"use client";

import { Component, type ReactNode } from "react";

/**
 * Isolates a single section: if a section component throws while rendering, the
 * fallback is shown for THAT section only — the rest of the page keeps working.
 */
export class SectionErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Section failed to render:", error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
