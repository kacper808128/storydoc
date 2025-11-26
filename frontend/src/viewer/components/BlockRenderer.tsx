import type { PresentationBlock } from '@shared/types';
import { clsx } from 'clsx';

interface BlockRendererProps {
  block: PresentationBlock;
  index: number;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
}

export default function BlockRenderer({ block, index, theme }: BlockRendererProps) {
  const getAnimationProps = () => {
    return {
      'data-animate': block.animation?.type || 'fade',
      'data-delay': block.animation?.delay || index * 0.1,
    };
  };

  const renderContent = () => {
    switch (block.type) {
      case 'text':
        return (
          <div
            className={clsx('text-block', block.style?.className)}
            style={block.style}
            {...getAnimationProps()}
            dangerouslySetInnerHTML={{ __html: block.content.text }}
          />
        );

      case 'image':
        return (
          <div className="image-block" {...getAnimationProps()}>
            <img
              src={block.content.url}
              alt={block.content.alt || ''}
              className="w-full h-auto rounded-lg"
              style={block.style}
            />
          </div>
        );

      case 'video':
        return (
          <div className="video-block" {...getAnimationProps()}>
            {block.content.provider === 'youtube' && (
              <iframe
                className="w-full aspect-video rounded-lg"
                src={`https://www.youtube.com/embed/${block.content.videoId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={block.style}
              />
            )}
            {block.content.provider === 'vimeo' && (
              <iframe
                className="w-full aspect-video rounded-lg"
                src={`https://player.vimeo.com/video/${block.content.videoId}`}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                style={block.style}
              />
            )}
          </div>
        );

      case 'cta':
        return (
          <div
            className={clsx(
              'cta-block p-8 rounded-xl shadow-lg',
              block.content.highlighted && 'ring-4 ring-primary-500'
            )}
            style={block.style}
            {...getAnimationProps()}
          >
            {block.content.title && (
              <h3 className="text-2xl font-bold mb-4">{block.content.title}</h3>
            )}
            {block.content.subtitle && (
              <p className="text-lg opacity-80 mb-2">{block.content.subtitle}</p>
            )}
            {block.content.description && (
              <div
                className="mb-6 whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: block.content.description }}
              />
            )}
            {block.content.price && (
              <div className="mb-4">
                {block.content.regularPrice && (
                  <p className="text-sm line-through opacity-60">
                    {block.content.regularPrice}
                  </p>
                )}
                <p className="text-3xl font-bold">{block.content.price}</p>
              </div>
            )}
            {block.content.features && block.content.features.length > 0 && (
              <ul className="space-y-2 mb-6">
                {block.content.features.map((feature: string, i: number) => (
                  <li key={i} className="flex items-start">
                    <svg
                      className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}
            {block.content.buttonText && block.content.buttonLink && (
              <a
                href={block.content.buttonLink}
                className="inline-block px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                style={{
                  backgroundColor: theme.primaryColor,
                  color: '#ffffff',
                }}
                data-click-track={block.id}
              >
                {block.content.buttonText}
              </a>
            )}
          </div>
        );

      case 'stats':
        return (
          <div
            className="stats-block grid grid-cols-1 md:grid-cols-2 gap-6"
            {...getAnimationProps()}
          >
            {block.content.stats.map((stat: any, i: number) => (
              <div
                key={i}
                className={clsx(
                  'stat-item p-6 rounded-lg',
                  stat.highlight ? 'bg-primary-50 ring-2 ring-primary-500' : 'bg-gray-50'
                )}
              >
                <div
                  className="text-4xl font-bold mb-2"
                  style={{ color: stat.highlight ? theme.primaryColor : undefined }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        );

      case 'logo':
        return (
          <div className="logo-block flex justify-center" {...getAnimationProps()}>
            <img
              src={block.content.url}
              alt={block.content.alt || 'Logo'}
              className="max-h-20 object-contain"
              style={block.style}
            />
          </div>
        );

      case 'embed':
        return (
          <div className="embed-block" {...getAnimationProps()}>
            <div
              dangerouslySetInnerHTML={{ __html: block.content.embedCode }}
              style={block.style}
            />
          </div>
        );

      case 'quote':
        return (
          <blockquote
            className="quote-block border-l-4 pl-6 py-4 italic"
            style={{
              borderColor: theme.primaryColor,
              ...block.style,
            }}
            {...getAnimationProps()}
          >
            <p className="text-xl mb-4">{block.content.text}</p>
            {block.content.author && (
              <footer className="text-sm opacity-70">— {block.content.author}</footer>
            )}
          </blockquote>
        );

      case 'form':
        return (
          <div className="form-block" {...getAnimationProps()}>
            <form
              className="space-y-4 max-w-md mx-auto"
              onSubmit={(e) => {
                e.preventDefault();
                // Handle form submission
              }}
            >
              {block.content.fields.map((field: any, i: number) => (
                <div key={i}>
                  <label className="block text-sm font-medium mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.name}
                      required={field.required}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={4}
                    />
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      required={field.required}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="w-full px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {block.content.submitText || 'Submit'}
              </button>
            </form>
          </div>
        );

      default:
        return (
          <div className="unknown-block p-4 bg-gray-100 rounded" {...getAnimationProps()}>
            Unknown block type: {block.type}
          </div>
        );
    }
  };

  return <div className="block-wrapper">{renderContent()}</div>;
}
