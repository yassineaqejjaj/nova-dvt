import { Loader2 } from 'lucide-react';

interface Props {
  message?: string;
}

export function LoadingFallback({ message = 'Loading...' }: Props) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
