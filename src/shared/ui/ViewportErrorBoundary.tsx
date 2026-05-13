'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ViewportErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Viewport Error:', error, errorInfo);
    // Here you would send to telemetry like Sentry
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d1117',
          color: '#f85149',
          fontFamily: 'monospace',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '14px', marginBottom: '10px' }}>NEXUS VIEWPORT CRITICAL FAILURE</h2>
          <div style={{ fontSize: '10px', opacity: 0.8, maxWidth: '400px' }}>
            {this.state.error?.message}
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              marginTop: '20px',
              background: '#238636',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            RE-INITIALIZE
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
