import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Tour } from '../../lib/api';
import { CompassIcon } from '../icons/compass-icon';
import { XIcon } from '../icons/x-icon';
import { SidebarIcon } from '../icons/sidebar-icon';

interface TourPanelProps {
  tour: Tour;
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onClose: () => void;
}

function TourMarkdown(props: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-text">{children}</strong>,
        em: ({ children }) => <em className="text-text-secondary">{children}</em>,
        code: (codeProps) => {
          const { children, className } = codeProps;
          const isBlock = className?.startsWith('language-') || (typeof children === 'string' && children.includes('\n'));
          if (isBlock) {
            return <code className={className}>{children}</code>;
          }
          return (
            <code className="px-1.5 py-0.5 bg-bg-tertiary rounded text-[10px] font-mono text-accent">{children}</code>
          );
        },
        pre: ({ children }) => (
          <pre className="my-2 p-2 bg-bg-tertiary rounded text-[10px] font-mono overflow-x-auto">{children}</pre>
        ),
        ul: ({ children }) => <ul className="mb-2 pl-4 space-y-1 list-disc">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 pl-4 space-y-1 list-decimal">{children}</ol>,
        li: ({ children }) => <li className="text-text">{children}</li>,
        a: ({ href, children }) => (
          <a href={href} className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
        ),
        h1: ({ children }) => <h3 className="font-semibold text-text mb-1">{children}</h3>,
        h2: ({ children }) => <h3 className="font-semibold text-text mb-1">{children}</h3>,
        h3: ({ children }) => <h3 className="font-semibold text-text mb-1">{children}</h3>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-accent/30 pl-2 my-2 text-text-secondary">{children}</blockquote>
        ),
        table: ({ children }) => (
          <div className="my-3 overflow-x-auto rounded border border-border">
            <table className="w-full text-[10px] border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-bg-tertiary">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-2.5 py-1.5 text-left font-semibold text-text border-b border-border">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-2.5 py-1.5 text-text border-b border-border/50">{children}</td>
        ),
        tr: ({ children }) => (
          <tr className="hover:bg-hover/50">{children}</tr>
        ),
      }}
    >
      {props.content}
    </ReactMarkdown>
  );
}

export function TourPanel(props: TourPanelProps) {
  const { tour, currentStepIndex, onStepChange, onClose } = props;

  const [collapsed, setCollapsed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef<HTMLButtonElement>(null);

  const steps = tour.steps;
  const totalSteps = steps.length + 1;
  const isIntro = currentStepIndex === 0;
  const currentStep = isIntro ? null : (steps[currentStepIndex - 1] ?? null);
  const hasPrev = currentStepIndex > 0;
  const hasNext = currentStepIndex < totalSteps - 1;

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    if (activeStepRef.current && stepsRef.current) {
      activeStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentStepIndex]);

  if (collapsed) {
    return (
      <div className="w-10 min-w-10 border-l border-border bg-bg-secondary flex items-start justify-center pt-3">
        <button
          className="p-1.5 rounded-md text-text-muted hover:text-text hover:bg-hover cursor-pointer"
          onClick={() => setCollapsed(false)}
          title="Show tour panel"
        >
          <CompassIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const lineRange = currentStep
    ? currentStep.startLine === currentStep.endLine
      ? `${currentStep.startLine}`
      : `${currentStep.startLine}-${currentStep.endLine}`
    : '';

  return (
    <aside className="w-96 min-w-96 border-l border-border bg-bg-secondary flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <span className="text-xs font-medium text-text-secondary flex items-center gap-2 uppercase tracking-wider">
          <CompassIcon className="w-3.5 h-3.5" />
          Tour
        </span>
        <div className="flex items-center gap-0.5">
          <button
            className="p-1 rounded-md text-text-muted hover:text-text hover:bg-hover cursor-pointer"
            onClick={() => setCollapsed(true)}
            title="Collapse tour panel"
          >
            <SidebarIcon className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1 rounded-md text-text-muted hover:text-text hover:bg-hover cursor-pointer"
            onClick={onClose}
            title="Close tour"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-2 py-2 border-b border-border">
        <button
          className="p-1 rounded text-text-muted hover:text-text cursor-pointer disabled:opacity-30 disabled:cursor-default shrink-0"
          onClick={() => onStepChange(currentStepIndex - 1)}
          disabled={!hasPrev}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M9.78 12.78a.75.75 0 01-1.06 0L4.47 8.53a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L6.06 8l3.72 3.72a.75.75 0 010 1.06z" /></svg>
        </button>
        <div ref={stepsRef} className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-none">
          {Array.from({ length: totalSteps }, (_, index) => (
            <button
              key={index}
              ref={index === currentStepIndex ? activeStepRef : undefined}
              className={`w-6 h-6 rounded-full text-[10px] font-bold cursor-pointer transition-colors flex items-center justify-center shrink-0 ${
                index === currentStepIndex
                  ? 'bg-accent text-white'
                  : 'bg-bg-tertiary text-text-muted hover:bg-hover hover:text-text'
              }`}
              onClick={() => onStepChange(index)}
            >
              {index === 0 ? <CompassIcon className="w-3 h-3" /> : index}
            </button>
          ))}
        </div>
        <button
          className="p-1 rounded text-text-muted hover:text-text cursor-pointer disabled:opacity-30 disabled:cursor-default shrink-0"
          onClick={() => onStepChange(currentStepIndex + 1)}
          disabled={!hasNext}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" /></svg>
        </button>
      </div>

      <div ref={contentRef} className="flex-1 overflow-y-auto px-4 py-3">
        {isIntro ? (
          <>
            <h2 className="text-sm font-semibold text-text leading-snug mb-3">{tour.topic}</h2>
            {tour.body && (
              <div className="text-xs text-text leading-relaxed">
                <TourMarkdown content={tour.body} />
              </div>
            )}
          </>
        ) : currentStep ? (
          <>
            <h3 className="text-xs font-semibold text-accent leading-snug mb-2">
              {currentStep.annotation || `Step ${currentStepIndex}`}
            </h3>

            <div className="text-xs text-text leading-relaxed">
              <TourMarkdown content={currentStep.body} />
            </div>

            <div className="mt-4 pt-2 border-t border-border/50 flex items-center justify-between">
              <span className="text-[10px] text-text-muted font-mono truncate">
                {currentStep.filePath}:{lineRange}
              </span>
              <span className="text-[10px] text-text-muted shrink-0 ml-2">
                {currentStepIndex}/{totalSteps - 1}
              </span>
            </div>
          </>
        ) : null}
      </div>
    </aside>
  );
}
