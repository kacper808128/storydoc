import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const trackViewSchema = z.object({
  versionId: z.string(),
  sessionId: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  device: z.string().optional(),
  browser: z.string().optional(),
});

const trackEngagementSchema = z.object({
  sessionId: z.string(),
  timeSpent: z.number().optional(),
  scrollDepth: z.number().optional(),
  sectionsViewed: z.array(z.string()).optional(),
  clicks: z.array(z.object({
    elementId: z.string(),
    timestamp: z.string(),
  })).optional(),
});

// POST /api/analytics/track/view - Track new view
router.post('/track/view', async (req, res, next) => {
  try {
    const validatedData = trackViewSchema.parse(req.body);

    // Check if version exists
    const version = await prisma.presentationVersion.findUnique({
      where: { id: validatedData.versionId },
    });

    if (!version) {
      return res.status(404).json({
        success: false,
        error: 'Version not found',
      });
    }

    // Create or update view analytics
    const existingView = await prisma.viewAnalytics.findFirst({
      where: {
        versionId: validatedData.versionId,
        sessionId: validatedData.sessionId,
      },
    });

    let viewAnalytics;

    if (existingView) {
      viewAnalytics = await prisma.viewAnalytics.update({
        where: { id: existingView.id },
        data: {
          lastPing: new Date(),
        },
      });
    } else {
      viewAnalytics = await prisma.viewAnalytics.create({
        data: validatedData,
      });

      // Update presentation analytics - increment unique viewers
      await prisma.analytics.updateMany({
        where: { presentationId: version.presentationId },
        data: {
          uniqueViewers: { increment: 1 },
        },
      });
    }

    // Update total views count
    await prisma.analytics.updateMany({
      where: { presentationId: version.presentationId },
      data: {
        totalViews: { increment: 1 },
      },
    });

    res.json({
      success: true,
      data: viewAnalytics,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }
    next(error);
  }
});

// POST /api/analytics/track/engagement - Track engagement (scroll, clicks, time)
router.post('/track/engagement', async (req, res, next) => {
  try {
    const validatedData = trackEngagementSchema.parse(req.body);

    const viewAnalytics = await prisma.viewAnalytics.findFirst({
      where: { sessionId: validatedData.sessionId },
      include: {
        version: {
          include: {
            presentation: true,
          },
        },
      },
    });

    if (!viewAnalytics) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    // Update view analytics
    const updateData: any = {
      lastPing: new Date(),
    };

    if (validatedData.timeSpent !== undefined) {
      updateData.timeSpent = validatedData.timeSpent;
    }

    if (validatedData.scrollDepth !== undefined) {
      updateData.scrollDepth = validatedData.scrollDepth;
    }

    if (validatedData.sectionsViewed) {
      updateData.sectionsViewed = validatedData.sectionsViewed;
    }

    if (validatedData.clicks) {
      updateData.clicks = validatedData.clicks;
    }

    const updated = await prisma.viewAnalytics.update({
      where: { id: viewAnalytics.id },
      data: updateData,
    });

    // Update average time spent in presentation analytics
    if (validatedData.timeSpent !== undefined) {
      const allViews = await prisma.viewAnalytics.findMany({
        where: { versionId: viewAnalytics.versionId },
        select: { timeSpent: true },
      });

      const avgTimeSpent =
        allViews.reduce((sum, view) => sum + view.timeSpent, 0) / allViews.length;

      await prisma.analytics.updateMany({
        where: { presentationId: viewAnalytics.version.presentationId },
        data: { avgTimeSpent },
      });
    }

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }
    next(error);
  }
});

// GET /api/analytics/presentation/:presentationId - Get analytics for presentation
router.get('/presentation/:presentationId', async (req, res, next) => {
  try {
    const { presentationId } = req.params;

    const analytics = await prisma.analytics.findFirst({
      where: { presentationId },
    });

    if (!analytics) {
      return res.status(404).json({
        success: false,
        error: 'Analytics not found',
      });
    }

    // Get all views for detailed analytics
    const versions = await prisma.presentationVersion.findMany({
      where: { presentationId },
      include: {
        views: true,
      },
    });

    const allViews = versions.flatMap((v) => v.views);

    // Calculate device breakdown
    const deviceBreakdown = {
      desktop: allViews.filter((v) => v.device?.toLowerCase().includes('desktop')).length,
      mobile: allViews.filter((v) => v.device?.toLowerCase().includes('mobile')).length,
      tablet: allViews.filter((v) => v.device?.toLowerCase().includes('tablet')).length,
    };

    // Calculate location data
    const locationMap = new Map<string, number>();
    allViews.forEach((view) => {
      if (view.country) {
        locationMap.set(view.country, (locationMap.get(view.country) || 0) + 1);
      }
    });

    const locationData = Array.from(locationMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate average scroll depth
    const scrollDepthAvg =
      allViews.reduce((sum, view) => sum + view.scrollDepth, 0) / (allViews.length || 1);

    // Calculate top sections
    const sectionMap = new Map<string, { views: number; totalTime: number }>();

    allViews.forEach((view) => {
      const sections = view.sectionsViewed as string[];
      sections.forEach((sectionId) => {
        const current = sectionMap.get(sectionId) || { views: 0, totalTime: 0 };
        sectionMap.set(sectionId, {
          views: current.views + 1,
          totalTime: current.totalTime + view.timeSpent / sections.length,
        });
      });
    });

    const topSections = Array.from(sectionMap.entries())
      .map(([sectionId, data]) => ({
        sectionId,
        views: data.views,
        avgTime: data.totalTime / data.views,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        totalViews: analytics.totalViews,
        uniqueViewers: analytics.uniqueViewers,
        avgTimeSpent: analytics.avgTimeSpent,
        scrollDepthAvg,
        topSections,
        deviceBreakdown,
        locationData,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/version/:versionId - Get analytics for specific version
router.get('/version/:versionId', async (req, res, next) => {
  try {
    const { versionId } = req.params;

    const views = await prisma.viewAnalytics.findMany({
      where: { versionId },
      orderBy: { viewedAt: 'desc' },
    });

    const totalViews = views.length;
    const uniqueSessions = new Set(views.map((v) => v.sessionId)).size;
    const avgTimeSpent =
      views.reduce((sum, view) => sum + view.timeSpent, 0) / (totalViews || 1);
    const avgScrollDepth =
      views.reduce((sum, view) => sum + view.scrollDepth, 0) / (totalViews || 1);

    res.json({
      success: true,
      data: {
        totalViews,
        uniqueSessions,
        avgTimeSpent,
        avgScrollDepth,
        views: views.slice(0, 50), // Return last 50 views
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
