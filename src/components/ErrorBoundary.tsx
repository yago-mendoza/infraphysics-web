import React from 'react';
import { secondBrainPath } from '../config/categories';
import { ErrorConceptView } from '../views/ErrorConceptView';

interface Props {
  children: React.ReactNode;
  resetKey?: string;
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

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const handleReset = () => this.setState({ hasError: false, error: null });
    const isSecondBrain = window.location.pathname.startsWith(secondBrainPath());

    // The same lost robot as the 404 page, with an ERR sign and a retry; wiki accent inside the wiki.
    return (
      <div className="min-h-screen px-6 flex items-center justify-center">
        <ErrorConceptView kind="error" accent={isSecondBrain ? 'wiki' : undefined} onRetry={handleReset} />
      </div>
    );
  }
}
