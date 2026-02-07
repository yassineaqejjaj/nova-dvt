/// <reference types="vitest/globals" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppErrorBoundary, FeatureErrorBoundary } from '../ErrorBoundary';

// Component that throws on render
function ThrowingComponent({ message }: { message: string }): React.JSX.Element {
  throw new Error(message);
}

// Suppress console.error from React's error boundary logging
const originalError = console.error;
beforeEach(() => {
  // eslint-disable-next-line no-console
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalError;
});

describe('AppErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <AppErrorBoundary>
        <div data-testid="child">Hello</div>
      </AppErrorBoundary>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders fallback UI when a child throws', () => {
    render(
      <AppErrorBoundary>
        <ThrowingComponent message="Test error message" />
      </AppErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders try again button that resets the boundary', () => {
    const onReset = vi.fn();

    render(
      <AppErrorBoundary onReset={onReset}>
        <ThrowingComponent message="crash" />
      </AppErrorBoundary>
    );

    const button = screen.getByRole('button', { name: /try again/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(onReset).toHaveBeenCalled();
  });
});

describe('FeatureErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <FeatureErrorBoundary>
        <span>Feature content</span>
      </FeatureErrorBoundary>
    );

    expect(screen.getByText('Feature content')).toBeInTheDocument();
  });

  it('renders compact error UI when child throws', () => {
    render(
      <FeatureErrorBoundary>
        <ThrowingComponent message="Feature broke" />
      </FeatureErrorBoundary>
    );

    expect(screen.getByText('This section encountered an error')).toBeInTheDocument();
    expect(screen.getByText('Feature broke')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
