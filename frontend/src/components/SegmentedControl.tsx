interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  badge?: string;
  accentBadge?: boolean;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (val: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
  size = 'md',
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`inline-flex items-center bg-canvas-soft rounded-full p-1 gap-1 ${className}`}
      role="tablist"
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center justify-center rounded-full font-semibold transition-all duration-150 cursor-pointer ${
              size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
            } ${
              isActive
                ? 'bg-canvas text-ink shadow-soft'
                : 'bg-transparent text-text-muted hover:text-ink'
            }`}
          >
            <span>{opt.label}</span>
            {opt.badge && (
              <span
                className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  opt.accentBadge
                    ? 'bg-accent text-white'
                    : 'bg-hairline text-ink-soft'
                }`}
              >
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
