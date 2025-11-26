import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { nanoid } from 'nanoid';

interface EngagementData {
  timeSpent?: number;
  scrollDepth?: number;
  sectionsViewed?: string[];
  clicks?: Array<{ elementId: string; timestamp: string }>;
}

export function useAnalytics() {
  const [sessionId] = useState(() => nanoid());
  const [versionId, setVersionId] = useState<string | null>(null);
  const trackingInitialized = useRef(false);

  const sectionsViewedSet = useRef(new Set<string>());
  const clicksRef = useRef<Array<{ elementId: string; timestamp: string }>>([]);

  // Initialize tracking
  const trackView = useCallback(
    async (vId: string) => {
      if (trackingInitialized.current) return;
      trackingInitialized.current = true;
      setVersionId(vId);

      try {
        // Get device and location info
        const userAgent = navigator.userAgent;
        const device = /Mobile|Android|iPhone/i.test(userAgent)
          ? 'mobile'
          : /Tablet|iPad/i.test(userAgent)
          ? 'tablet'
          : 'desktop';

        await axios.post('/api/analytics/track/view', {
          versionId: vId,
          sessionId,
          userAgent,
          device,
        });
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    },
    [sessionId]
  );

  // Track engagement (scroll, time, sections, clicks)
  const trackEngagement = useCallback(
    async (data: EngagementData) => {
      if (!versionId) return;

      try {
        // Accumulate sections viewed
        if (data.sectionsViewed) {
          data.sectionsViewed.forEach((sectionId) => {
            sectionsViewedSet.current.add(sectionId);
          });
        }

        // Accumulate clicks
        if (data.clicks) {
          clicksRef.current.push(...data.clicks);
        }

        // Send update to server
        await axios.post('/api/analytics/track/engagement', {
          sessionId,
          timeSpent: data.timeSpent,
          scrollDepth: data.scrollDepth,
          sectionsViewed: Array.from(sectionsViewedSet.current),
          clicks: clicksRef.current,
        });
      } catch (error) {
        console.error('Failed to track engagement:', error);
      }
    },
    [sessionId, versionId]
  );

  // Track clicks on elements
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickTrackId = target.getAttribute('data-click-track');

      if (clickTrackId) {
        trackEngagement({
          clicks: [
            {
              elementId: clickTrackId,
              timestamp: new Date().toISOString(),
            },
          ],
        });
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [trackEngagement]);

  return {
    sessionId,
    trackView,
    trackEngagement,
  };
}
