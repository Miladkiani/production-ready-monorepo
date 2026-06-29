import {
  SkeletonBox,
  SkeletonText,
  SkeletonCircle,
} from "@repo/ui/components/skeletons";

/**
 * HeroSkeleton - Loading skeleton for Hero section
 */
export function HeroSkeleton() {
  return (
    <section className="bg-hero-gradient min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
        {/* Left: Text content */}
        <div className="space-y-6 animate-pulse">
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
          <SkeletonCircle className="w-64 h-64 md:w-80 md:h-80" />
        </div>
      </div>
    </section>
  );
}

/**
 * SectionHeaderSkeleton - Reusable section header skeleton
 */
export function SectionHeaderSkeleton() {
  return (
    <div className="text-center mb-12 animate-pulse">
      <SkeletonText width="1/4" className="h-10 mx-auto mb-4" />
      <SkeletonText width="1/2" className="h-5 mx-auto" />
    </div>
  );
}

/**
 * SkillsGridSkeleton - Loading skeleton for Skills section
 */
export function SkillsGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <section className="py-20 px-6 bg-surface" id="skills">
      <div className="max-w-6xl mx-auto">
        <SectionHeaderSkeleton />

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(count)].map((_, i) => (
            <div
              key={i}
              className="bg-card border border-card rounded-xl p-4 space-y-3 animate-pulse"
            >
              <SkeletonCircle className="w-12 h-12 mx-auto" />
              <SkeletonText width="3/4" className="h-4 mx-auto" />
              <SkeletonBox className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * CertificationsSkeleton - Loading skeleton for Certifications section
 */
export function CertificationsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <section className="py-20 px-6 bg-background" id="certifications">
      <div className="max-w-6xl mx-auto">
        <SectionHeaderSkeleton />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(count)].map((_, i) => (
            <div
              key={i}
              className="bg-card border border-card rounded-xl overflow-hidden animate-pulse"
            >
              <SkeletonBox className="h-48 w-full rounded-none" />
              <div className="p-5 space-y-3">
                <SkeletonText width="3/4" className="h-6" />
                <SkeletonText width="1/2" className="h-4" />
                <div className="flex gap-2 pt-2">
                  <SkeletonBox className="w-16 h-6 rounded-full" />
                  <SkeletonBox className="w-20 h-6 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * ResumeSkeleton - Loading skeleton for Resume section
 */
export function ResumeSkeleton() {
  return (
    <section className="py-20 px-6 bg-surface" id="resume">
      <div className="max-w-4xl mx-auto">
        <SectionHeaderSkeleton />

        <div className="bg-card rounded-xl p-6 md:p-8 space-y-6 animate-pulse">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Resume Preview */}
            <SkeletonBox className="h-[400px] rounded-lg" />

            {/* Info Section */}
            <div className="space-y-6">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <SkeletonCircle className="w-10 h-10 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <SkeletonText width="1/4" className="h-3" />
                      <SkeletonText width="1/2" className="h-4" />
                    </div>
                  </div>
                ))}
              </div>
              <SkeletonBox className="h-12 w-full rounded-lg" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 pt-4">
            <SkeletonText width="full" className="h-4" />
            <SkeletonText width="3/4" className="h-4" />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * ContactSkeleton - Loading skeleton for Contact section
 */
export function ContactSkeleton() {
  return (
    <section className="py-20 px-6 bg-contact-gradient" id="contact">
      <div className="max-w-4xl mx-auto">
        <SectionHeaderSkeleton />

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-card border border-card rounded-xl p-6 space-y-4 animate-pulse">
            <SkeletonText width="1/4" className="h-6" />
            <div className="space-y-4">
              <SkeletonBox className="h-12 w-full rounded-lg" />
              <SkeletonBox className="h-12 w-full rounded-lg" />
              <SkeletonBox className="h-32 w-full rounded-lg" />
              <SkeletonBox className="h-12 w-full rounded-lg" />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-card border border-card rounded-xl p-5 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <SkeletonCircle className="w-12 h-12 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <SkeletonText width="1/4" className="h-3" />
                    <SkeletonText width="1/2" className="h-4" />
                  </div>
                </div>
              </div>
            ))}

            {/* Social Links */}
            <div className="bg-card border border-card rounded-xl p-5 animate-pulse">
              <SkeletonText width="1/4" className="h-5 mb-4" />
              <div className="flex gap-3">
                {[...Array(4)].map((_, i) => (
                  <SkeletonCircle key={i} className="w-10 h-10" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
