import { Media } from "@/components/Media";
import type { Page } from "@/payload-types";

type LayoutBlock = NonNullable<Page["layout"]>[number];
type HeroBlockProps = Extract<LayoutBlock, { blockType: "Hero" }>;

export default function HeroBlockComponent({ content, image }: HeroBlockProps) {
  // Heading parsing logic (safe check)
  const headingText = content?.heading || "";
  const lastSpaceIndex = headingText.lastIndexOf(" ");
  const headingStart = lastSpaceIndex !== -1 ? headingText.slice(0, lastSpaceIndex) : headingText;
  const headingEnd = lastSpaceIndex !== -1 ? headingText.slice(lastSpaceIndex) : "";

  const subheading = content?.subheading;

  // Background styling logic
  const isTailwindBg = image?.bg === 'color' && image?.bg_color?.startsWith('bg-');
  const customBgStyle = image?.bg === 'color' && !isTailwindBg && image?.bg_color ? { backgroundColor: image.bg_color } : {};
  const bgClass = isTailwindBg ? image.bg_color : 'bg-zinc-950';

  return (
    <div 
      className={`relative min-h-screen flex items-center justify-center text-zinc-100 overflow-hidden py-16 lg:py-0 ${bgClass}`}
      style={customBgStyle}
    >
      {/* Background Image */}
      {image?.bg === 'image' && image?.bg_image && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="w-full h-full [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_video]:w-full [&_video]:h-full [&_video]:object-cover opacity-40 select-none pointer-events-none">
            <Media resource={image.bg_image} />
          </div>
        </div>
      )}

      {/* Overlay */}
      {image?.bg === 'image' && image?.overlay && (
        <div 
          className="absolute inset-0 z-0" 
          style={{
            backgroundColor: image?.overlay_color || '#000000',
            opacity: image?.overlay_opacity !== undefined && image?.overlay_opacity !== null ? image.overlay_opacity : 0.5
          }}
        />
      )}

      {/* Background radial glow (only when not using a bg image) */}
      {image?.bg !== 'image' && (
        <>
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* Text Content */}
        <div className="w-full lg:basis-1/2 flex flex-col items-start text-left">
          {/* Heading */}
          {headingText && (
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              {headingStart}{" "}
              {headingEnd && (
                <>
                  <br />
                  <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {headingEnd.trim()}
                  </span>
                </>
              )}
            </h1>
          )}

          {/* Subheading */}
          {subheading && (
            <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed">
              {subheading}
            </p>
          )}
        </div>

        {/* Foreground Image */}
        {image?.image && (
          <div className="w-full lg:basis-1/2 flex justify-center">
            <div className="relative w-full max-w-lg aspect-square lg:aspect-4/3 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/50 shadow-2xl [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_video]:w-full [&_video]:h-full [&_video]:object-cover">
              <Media resource={image.image} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}