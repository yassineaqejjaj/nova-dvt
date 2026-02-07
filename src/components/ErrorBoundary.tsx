import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-8" role="alert">
      <div className="mx-auto max-w-md text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-lg font-semibold">Something went wrong</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {(error as Error)?.message || 'An unexpected error occurred.'}
        </p>
        <Button onClick={resetErrorBoundary} variant="outline" className="mt-4 gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}

interface Props {
  children: React.ReactNode;
  /** Optional custom fallback renderer */
  fallback?: React.ComponentType<FallbackProps>;
  /** Called when the boundary resets */
  onReset?: () => void;
}

export function AppErrorBoundary({ children, fallback, onReset }: Props) {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback ?? ErrorFallback}
      onReset={onReset}
      onError={(error, info) => {
        // Log to console in development, will integrate Sentry here later
        console.error('ErrorBoundary caught:', error, info);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

/** Lightweight boundary for individual feature sections */
export function FeatureErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={({
        error,
        resetErrorBoundary,
      }: {
        error: unknown;
        resetErrorBoundary: () => void;
      }) => (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">This section encountered an error</p>
          <p className="mt-1 text-xs text-muted-foreground">{(error as Error).message}</p>
          <Button onClick={resetErrorBoundary} variant="ghost" size="sm" className="mt-2">
            Retry
          </Button>
        </div>
      )}
      onError={(error) => {
        console.error('FeatureErrorBoundary caught:', error);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
