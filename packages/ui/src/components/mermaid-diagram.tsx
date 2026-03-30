import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

let initialized = false;

function initMermaid(isDark: boolean) {
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? 'dark' : 'default',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: 12,
    flowchart: { padding: 8 },
    securityLevel: 'strict',
  });
  initialized = true;
}

let idCounter = 0;

export function MermaidDiagram(props: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(`mermaid-${idCounter++}`);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const isDark = document.documentElement.classList.contains('dark');
    if (!initialized) {
      initMermaid(isDark);
    }

    let cancelled = false;

    mermaid
      .render(idRef.current, props.chart)
      .then(({ svg }) => {
        if (cancelled) {
          return;
        }
        container.innerHTML = svg;
        setError(null);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setError('Failed to render diagram');
      });

    return () => {
      cancelled = true;
    };
  }, [props.chart]);

  if (error) {
    return (
      <pre className="my-2 p-2 bg-bg-tertiary rounded text-[10px] font-mono overflow-x-auto text-text-muted">
        {props.chart}
      </pre>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-3 flex justify-center overflow-x-auto [&_svg]:max-w-full"
    />
  );
}
