'use client';

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  module?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary] [${this.props.module ?? 'Unknown'}]`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle
            size={48}
            strokeWidth={1.5}
            style={{ color: 'var(--cn-danger)' }}
          />
          <h3 className="mt-4 text-lg font-medium" style={{ color: 'var(--cn-text-primary)' }}>
            Something went wrong
          </h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--cn-text-secondary)' }}>
            {this.state.error?.message ?? 'An unexpected error occurred'}
          </p>
          {this.props.module && (
            <p className="mt-1 text-xs cn-font-mono" style={{ color: 'var(--cn-text-secondary)' }}>
              Module: {this.props.module}
            </p>
          )}
          <Button variant="secondary" size="sm" onClick={this.handleRetry} className="mt-4">
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
