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

    return (
      <div className="flex items-center justify-center min-h-[60vh] px-6">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold text-th-heading">Something went wrong</h1>
          <p className="text-sm text-th-secondary">
            An unexpected error occurred. You can try again or navigate back home.
          </p>
          {this.state.error && (
            <pre className="text-xs text-th-tertiary bg-th-surface-alt border border-th-border p-3 text-left overflow-auto max-h-32 rounded-sm">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm border border-th-border text-th-secondary hover:border-th-border-hover transition-colors"
            >
              Try again
            </button>
            <a
              href="/home"
              className="px-4 py-2 text-sm border border-th-border text-th-secondary hover:border-th-border-hover transition-colors"
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
