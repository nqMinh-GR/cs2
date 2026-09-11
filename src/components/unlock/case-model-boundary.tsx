import { Component, type ReactNode } from 'react';

type Props = { onError: (error: unknown) => void; children: ReactNode };

/** A failed GLB fetch/parse or a lost WebGL context must never take the page down: fall back to the PNG. */
export class CaseModelBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown) {
    console.warn('[case-model] falling back to static image:', error);
    this.props.onError(error);
  }
  render() { return this.state.failed ? null : this.props.children; }
}
