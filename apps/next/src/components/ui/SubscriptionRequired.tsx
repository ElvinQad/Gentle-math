
interface SubscriptionRequiredProps {
  title?: string;
  description?: string;
  features?: string[];
  className?: string;
}

export function SubscriptionRequired({
  title = 'Premium Feature',
  description = 'Contact us on Telegram to unlock premium features.',
  features = [],
  className = '',
}: SubscriptionRequiredProps) {
  return (
    <div className={`space-y-6 p-8 bg-gradient-to-br from-[color:var(--primary)]/5 via-[color:var(--color-soft-blue)]/5 to-[color:var(--color-teal)]/5 rounded-lg animate-gradient-slow ${className}`}>
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[color:var(--primary)]/10 mb-4">
          <svg className="w-8 h-8 text-[color:var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-[color:var(--foreground)]">
          {title}
        </h3>
        <p className="text-[color:var(--muted-foreground)] max-w-md mx-auto">
          {description}
        </p>
      </div>

      {features.length > 0 && (
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-4 rounded-lg bg-[color:var(--background)]/50 backdrop-blur-sm space-y-2 text-center hover:bg-[color:var(--background)]/70 transition-colors"
            >
              <div className="text-sm text-[color:var(--muted-foreground)]">{feature}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center pt-2">
        <a
          href="https://t.me/@e1918_1918"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0088cc] text-white rounded-lg hover:bg-[#0088cc]/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
          </svg>
          <span>Contact us on Telegram</span>
        </a>
      </div>
    </div>
  );
} 