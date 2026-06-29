export function ContactSkeleton() {
  return (
    <section
      id="contact"
      className="py-16 md:py-20 bg-gradient-to-b from-background to-surface/30 border-t border-border"
      aria-label="Loading contact form"
    >
      <div className="container mx-auto max-w-6xl px-6">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="h-10 w-48 bg-surface/50 rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-96 bg-surface/50 rounded-lg mx-auto animate-pulse" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column Skeleton */}
          <div className="order-2 lg:order-1 space-y-8">
            <div className="space-y-4">
              <div className="h-16 bg-surface/50 rounded-lg animate-pulse" />
              <div className="h-16 bg-surface/50 rounded-lg animate-pulse" />
              <div className="h-16 bg-surface/50 rounded-lg animate-pulse" />
            </div>
            <div className="flex gap-4">
              <div className="h-12 w-12 bg-surface/50 rounded-lg animate-pulse" />
              <div className="h-12 w-12 bg-surface/50 rounded-lg animate-pulse" />
              <div className="h-12 w-12 bg-surface/50 rounded-lg animate-pulse" />
              <div className="h-12 w-12 bg-surface/50 rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Right Column - Form Skeleton */}
          <div className="order-1 lg:order-2 space-y-5">
            <div className="h-12 bg-surface/50 rounded-lg animate-pulse" />
            <div className="h-12 bg-surface/50 rounded-lg animate-pulse" />
            <div className="h-32 bg-surface/50 rounded-lg animate-pulse" />
            <div className="h-12 bg-surface/50 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
