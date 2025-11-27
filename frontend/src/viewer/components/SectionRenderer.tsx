import type { PresentationSection } from '@shared/types';
import BlockRenderer from './BlockRenderer';
import { clsx } from 'clsx';

interface SectionRendererProps {
  section: PresentationSection;
  index: number;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    logoUrl?: string;
  };
}

export default function SectionRenderer({ section, index, theme }: SectionRendererProps) {
  const getBackgroundStyle = () => {
    if (!section.background) return {};

    switch (section.background.type) {
      case 'color':
        return { backgroundColor: section.background.value };
      case 'gradient':
        return { backgroundImage: section.background.value };
      case 'image':
        return {
          backgroundImage: `url(${section.background.value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      default:
        return {};
    }
  };

  const getLayoutClass = () => {
    switch (section.layout) {
      case 'hero':
        return 'flex flex-col items-center justify-center text-center px-8 py-20';
      case 'two-column':
        return 'grid grid-cols-1 md:grid-cols-2 gap-8 px-8 py-16';
      case 'three-column':
        return 'grid grid-cols-1 md:grid-cols-3 gap-8 px-8 py-16';
      case 'split':
        return 'grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-8 py-16';
      case 'single':
      default:
        return 'flex flex-col px-8 py-16 max-w-5xl mx-auto';
    }
  };

  return (
    <section
      className={clsx(
        'w-full min-h-screen relative',
        getLayoutClass(),
        section.style?.className
      )}
      style={{
        ...getBackgroundStyle(),
        ...section.style,
      }}
    >
      {section.title && (
        <h2
          className="text-4xl font-bold mb-8 w-full"
          data-animate="fade"
          data-delay="0"
        >
          {section.title}
        </h2>
      )}

      {section.blocks.map((block, blockIndex) => (
        <BlockRenderer
          key={block.id}
          block={block}
          index={blockIndex}
          theme={theme}
        />
      ))}
    </section>
  );
}
