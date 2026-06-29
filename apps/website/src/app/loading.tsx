import {
  SkeletonBox,
  SkeletonCircle,
  SkeletonText,
  SkeletonCard,
  SkeletonArticle,
} from "@repo/ui";

/**
 * Loading skeleton for the home page
 * Matches the structure of the actual home page
 */
export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Skeleton */}
      <section className="bg-hero-gradient min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
          {/* Left: Text content */}
          <div className="space-y-6">
            <SkeletonText width="1/4" className="h-5" />
            <div className="space-y-4">
              <SkeletonText width="full" className="h-12" />
              <SkeletonText width="3/4" className="h-12" />
            </div>
            <div className="space-y-3">
              <SkeletonText width="full" className="h-5" />
              <SkeletonText width="full" className="h-5" />
              <SkeletonText width="1/2" className="h-5" />
            </div>
            <div className="flex gap-4 pt-4">
              <SkeletonBox className="h-12 w-40 rounded-lg" />
              <SkeletonBox className="h-12 w-32 rounded-lg" />
            </div>
            {/* Social links */}
            <div className="flex gap-3 pt-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonCircle key={i} className="w-10 h-10" />
              ))}
            </div>
          </div>

          {/* Right: Avatar */}
          <div className="flex justify-center">
            <SkeletonCircle className="w-80 h-80" />
          </div>
        </div>
      </section>

      {/* About Section Skeleton */}
      <section className="py-20 px-6 bg-background" id="about">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <SkeletonText width="1/4" className="h-10 mx-auto mb-4" />
            <SkeletonText width="1/2" className="h-5 mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} showImage={false} lines={2} />
            ))}
          </div>

          <div className="space-y-4">
            <SkeletonText width="full" className="h-5" />
            <SkeletonText width="full" className="h-5" />
            <SkeletonText width="3/4" className="h-5" />
          </div>
        </div>
      </section>

      {/* Skills Section Skeleton */}
      <section className="py-20 px-6 bg-surface" id="skills">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <SkeletonText width="1/4" className="h-10 mx-auto mb-4" />
            <SkeletonText width="1/2" className="h-5 mx-auto" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <SkeletonCard key={i} showImage={false} lines={1} />
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section Skeleton */}
      <section className="py-20 px-6 bg-background" id="certifications">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <SkeletonText width="1/4" className="h-10 mx-auto mb-4" />
            <SkeletonText width="1/2" className="h-5 mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} showImage={true} lines={2} />
            ))}
          </div>
        </div>
      </section>

      {/* Resume Section Skeleton */}
      <section className="py-20 px-6 bg-surface" id="resume">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <SkeletonText width="1/4" className="h-10 mx-auto mb-4" />
            <SkeletonText width="1/2" className="h-5 mx-auto" />
          </div>

          <div className="bg-card rounded-xl p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <SkeletonBox className="h-[400px] rounded-lg" />
              <div className="space-y-6">
                <SkeletonCard showImage={false} lines={3} />
                <SkeletonBox className="h-12 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section Skeleton */}
      <section className="py-20 px-6 bg-background" id="articles">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <SkeletonText width="1/4" className="h-10 mx-auto mb-4" />
            <SkeletonText width="1/2" className="h-5 mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <SkeletonArticle key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section Skeleton */}
      <section className="py-20 px-6 bg-contact-gradient" id="contact">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <SkeletonText width="1/4" className="h-10 mx-auto mb-4" />
            <SkeletonText width="1/2" className="h-5 mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <SkeletonCard showImage={false} lines={4} />
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} showImage={false} lines={1} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
