import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// React types unavailable (no @types/react); declare inherited members
export class ErrorBoundary extends (React.Component as new (props: Props) => {
  state: State;
  props: Readonly<Props>;
  setState(s: Partial<State>): void;
  render(): React.ReactNode;
}) {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const handleReset = () => this.setState({ hasError: false, error: null });
    const isSecondBrain = window.location.pathname.startsWith('/lab/second-brain');
    const accent = isSecondBrain ? 'var(--cat-fieldnotes-accent)' : 'var(--text-secondary)';

    return (
      <div className="flex items-center justify-center min-h-[40vh] px-6">
        <div
          className="max-w-sm w-full rounded-md border p-6 space-y-4"
          style={{
            borderColor: `color-mix(in srgb, ${accent} 25%, transparent)`,
            background: `color-mix(in srgb, ${accent} 4%, var(--bg-surface))`,
          }}
        >
          <p className="text-sm text-th-secondary text-center">
            Something went wrong — try again or head back.
          </p>
          {this.state.error && (
            <pre
              className="text-xs p-3 text-left overflow-auto max-h-24 rounded-sm"
              style={{
                color: `color-mix(in srgb, ${accent} 70%, var(--text-secondary))`,
                background: `color-mix(in srgb, ${accent} 6%, var(--bg-surface-alt))`,
                borderLeft: `2px solid color-mix(in srgb, ${accent} 40%, transparent)`,
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3 justify-center pt-1">
            <button
              onClick={handleReset}
              className="px-4 py-1.5 text-xs rounded-sm transition-colors"
              style={{
                border: `1px solid color-mix(in srgb, ${accent} 30%, transparent)`,
                color: `color-mix(in srgb, ${accent} 80%, var(--text-primary))`,
              }}
            >
              Try again
            </button>
            <a
              href="/home"
              className="px-4 py-1.5 text-xs rounded-sm transition-colors"
              style={{
                border: `1px solid color-mix(in srgb, ${accent} 30%, transparent)`,
                color: `color-mix(in srgb, ${accent} 80%, var(--text-primary))`,
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
