import { ServerCrash } from 'lucide-react';

type ErrorStateProps = {
  onRetry: () => void;
};

export default function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center backdrop-blur-2xl">
      <ServerCrash className="h-10 w-10 text-destructive" />
      <div>
        <p className="font-medium">Something went wrong.. Try again</p>
        <p className="text-sm text-muted-foreground">Is the Docker engine running?</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted/50"
      >
        Retry
      </button>
    </div>
  );
}
