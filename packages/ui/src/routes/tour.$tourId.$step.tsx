import { isRouteErrorResponse, useRouteError, useNavigate } from "react-router";
import type { Route } from "./+types/tour.$tourId.$step";
import { queryClient } from "../lib/query-client";
import { treePathsOptions, treeInfoOptions, treeFileContentOptions, tourOptions } from "../queries/tree";
import { TreePage } from "../components/tree/tree-page";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const tourId = params.tourId;
  const stepIndex = parseInt(params.step, 10);

  const [tour] = await Promise.all([
    queryClient.ensureQueryData(tourOptions(tourId)),
    queryClient.ensureQueryData(treePathsOptions()),
    queryClient.ensureQueryData(treeInfoOptions()),
  ]);

  if (stepIndex > 0) {
    const step = tour.steps[stepIndex - 1];
    if (step) {
      try {
        await queryClient.ensureQueryData(treeFileContentOptions(step.filePath));
      } catch {
        // File may not exist — the viewer will handle the missing content
      }
    }
  }

  return { tourId, stepIndex };
}

export default function TourStepRoute({ loaderData }: Route.ComponentProps) {
  return <TreePage tourId={loaderData.tourId} tourStepIndex={loaderData.stepIndex} />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = 'Something went wrong';
  let message = 'An unexpected error occurred while loading the tour.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} — ${error.statusText || 'Error'}`;
    message = error.data?.message || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-bg text-text">
      <div className="max-w-md text-center px-6">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-bg-tertiary flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-text-muted">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold mb-2">{title}</h1>
        <p className="text-sm text-text-secondary mb-6">{message}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            className="px-4 py-2 text-sm rounded-md bg-accent text-white hover:bg-accent-hover cursor-pointer transition-colors"
            onClick={() => navigate(-1)}
          >
            Go back
          </button>
          <button
            className="px-4 py-2 text-sm rounded-md border border-border hover:bg-hover cursor-pointer transition-colors"
            onClick={() => navigate('/tree')}
          >
            Browse files
          </button>
        </div>
      </div>
    </div>
  );
}
