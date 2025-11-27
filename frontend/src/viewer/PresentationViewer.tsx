import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import axios from 'axios';
import type { PresentationContent, PresentationSettings } from '@shared/types';
import SectionRenderer from './components/SectionRenderer';
import { useAnalytics } from '../hooks/useAnalytics';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface PresentationViewerProps {
  mode: 'view' | 'edit';
}

interface PresentationData {
  id: string;
  slug: string;
  presentation: {
    id: string;
    title: string;
    content: PresentationContent;
    settings: PresentationSettings;
  };
  isEditable: boolean;
  expiresAt?: string;
}

export default function PresentationViewer({ mode }: PresentationViewerProps) {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [data, setData] = useState<PresentationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { trackView, trackEngagement, sessionId } = useAnalytics();

  // Fetch presentation data
  useEffect(() => {
    if (!slug || !token) {
      setError('Invalid presentation link');
      setLoading(false);
      return;
    }

    axios
      .get(`/api/versions/${slug}?token=${token}`)
      .then((res) => {
        setData(res.data.data);
        setLoading(false);

        // Track view
        trackView(res.data.data.id);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load presentation');
        setLoading(false);
      });
  }, [slug, token, trackView]);

  // GSAP Scrollytelling animations
  useGSAP(() => {
    if (!data) return;

    const sections = gsap.utils.toArray<HTMLElement>('.presentation-section');

    sections.forEach((section, index) => {
      const elements = section.querySelectorAll('[data-animate]');

      elements.forEach((element) => {
        const animType = element.getAttribute('data-animate') || 'fade';
        const delay = parseFloat(element.getAttribute('data-delay') || '0');

        let animation = {};

        switch (animType) {
          case 'fade':
            animation = { opacity: 0 };
            break;
          case 'slide-up':
            animation = { opacity: 0, y: 50 };
            break;
          case 'slide-left':
            animation = { opacity: 0, x: 50 };
            break;
          case 'scale':
            animation = { opacity: 0, scale: 0.9 };
            break;
          default:
            animation = { opacity: 0 };
        }

        gsap.from(element, {
          ...animation,
          duration: 1,
          delay,
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            end: 'top 20%',
            toggleActions: 'play none none reverse',
          },
        });
      });

      // Track section views
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        onEnter: () => {
          const sectionId = section.getAttribute('data-section-id');
          if (sectionId) {
            trackEngagement({
              sectionsViewed: [sectionId],
            });
          }
        },
      });
    });

    // Track scroll depth
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        trackEngagement({
          scrollDepth: Math.round(self.progress * 100),
        });
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [data, trackEngagement]);

  // Track time spent
  useEffect(() => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      trackEngagement({ timeSpent });
    }, 30000); // Update every 30 seconds

    return () => {
      clearInterval(interval);
      const finalTime = Math.floor((Date.now() - startTime) / 1000);
      trackEngagement({ timeSpent: finalTime });
    };
  }, [trackEngagement]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;
  if (!data) return <ErrorScreen error="Presentation not found" />;

  const { content, settings } = data.presentation;

  return (
    <div
      className="scrollytelling-container"
      style={{
        fontFamily: settings.theme.fontFamily,
        '--primary-color': settings.theme.primaryColor,
        '--secondary-color': settings.theme.secondaryColor,
      } as React.CSSProperties}
    >
      {/* Header with logo */}
      {settings.theme.logoUrl && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <img
              src={settings.theme.logoUrl}
              alt="Logo"
              className="h-8 object-contain"
            />
            <div className="text-sm text-gray-600">
              {content.metadata.title}
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className="pt-16">
        {content.sections.map((section, index) => (
          <div
            key={section.id}
            className="presentation-section"
            data-section-id={section.id}
          >
            <SectionRenderer
              section={section}
              index={index}
              theme={settings.theme}
            />
          </div>
        ))}
      </main>

      {/* Progress indicator */}
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-4 py-2 text-sm font-medium text-gray-700 z-50">
        <span id="progress-indicator">0%</span>
      </div>
    </div>
  );
}
