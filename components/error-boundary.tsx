"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <Card className="card max-w-md w-full">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
              <p className="text-muted-foreground text-sm mb-4">
                An unexpected error occurred. Please try again.
              </p>
              {this.state.error && (
                <p className="ui-meta-label mb-4 rounded bg-destructive/10 p-2 text-destructive">
                  {this.state.error.message}
                </p>
              )}
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={this.handleReset}>
                  Try again
                </Button>
                <Button variant="default" onClick={() => window.location.reload()}>
                  Reload page
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
