import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const createVersionSchema = z.object({
  presentationId: z.string(),
  recipientName: z.string().optional(),
  recipientEmail: z.string().email().optional(),
  variables: z.record(z.any()).optional(),
  password: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

// Helper to generate URLs
const generateUrls = (versionSlug: string, viewToken: string, editToken: string) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return {
    viewUrl: `${baseUrl}/view/${versionSlug}?token=${viewToken}`,
    editUrl: `${baseUrl}/edit/${versionSlug}?token=${editToken}`,
  };
};

// POST /api/versions - Create new version
router.post('/', async (req, res, next) => {
  try {
    const validatedData = createVersionSchema.parse(req.body);

    // Verify presentation exists
    const presentation = await prisma.presentation.findUnique({
      where: { id: validatedData.presentationId },
    });

    if (!presentation) {
      return res.status(404).json({
        success: false,
        error: 'Presentation not found',
      });
    }

    // Generate unique tokens and slug
    const versionSlug = nanoid(12);
    const viewToken = nanoid(32);
    const editToken = nanoid(32);

    const version = await prisma.presentationVersion.create({
      data: {
        presentationId: validatedData.presentationId,
        versionSlug,
        viewToken,
        editToken,
        recipientName: validatedData.recipientName,
        recipientEmail: validatedData.recipientEmail,
        variables: validatedData.variables || {},
        password: validatedData.password,
        expiresAt: validatedData.expiresAt,
      },
    });

    const urls = generateUrls(versionSlug, viewToken, editToken);

    res.status(201).json({
      success: true,
      data: {
        ...version,
        ...urls,
      },
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

// GET /api/versions/:slug - Get version by slug
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { token } = req.query;

    const version = await prisma.presentationVersion.findUnique({
      where: { versionSlug: slug },
      include: {
        presentation: true,
      },
    });

    if (!version) {
      return res.status(404).json({
        success: false,
        error: 'Version not found',
      });
    }

    // Check if token is valid
    const isViewToken = token === version.viewToken;
    const isEditToken = token === version.editToken;

    if (!isViewToken && !isEditToken) {
      return res.status(403).json({
        success: false,
        error: 'Invalid token',
      });
    }

    // Check expiration
    if (version.expiresAt && new Date(version.expiresAt) < new Date()) {
      return res.status(410).json({
        success: false,
        error: 'This version has expired',
      });
    }

    // Apply variables to content
    let content = version.presentation.content as any;

    // Replace variables in content
    const variables = version.variables as Record<string, any> || {};
    const replaceVariables = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj.replace(/\{\{(\w+)\}\}/g, (match, key) => {
          return variables[key] || match;
        });
      }
      if (Array.isArray(obj)) {
        return obj.map(replaceVariables);
      }
      if (obj && typeof obj === 'object') {
        const newObj: any = {};
        for (const [key, value] of Object.entries(obj)) {
          newObj[key] = replaceVariables(value);
        }
        return newObj;
      }
      return obj;
    };

    content = replaceVariables(content);

    res.json({
      success: true,
      data: {
        id: version.id,
        slug: version.versionSlug,
        presentation: {
          ...version.presentation,
          content,
        },
        recipientName: version.recipientName,
        isEditable: isEditToken,
        expiresAt: version.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/versions/:slug - Update version (editable only)
router.put('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { token, variables } = req.body;

    const version = await prisma.presentationVersion.findUnique({
      where: { versionSlug: slug },
    });

    if (!version) {
      return res.status(404).json({
        success: false,
        error: 'Version not found',
      });
    }

    // Only allow editing with edit token
    if (token !== version.editToken) {
      return res.status(403).json({
        success: false,
        error: 'Invalid edit token',
      });
    }

    const updatedVersion = await prisma.presentationVersion.update({
      where: { versionSlug: slug },
      data: {
        variables: variables || version.variables,
      },
    });

    res.json({
      success: true,
      data: updatedVersion,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/versions/presentation/:presentationId - Get all versions for presentation
router.get('/presentation/:presentationId', async (req, res, next) => {
  try {
    const { presentationId } = req.params;

    const versions = await prisma.presentationVersion.findMany({
      where: { presentationId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { views: true },
        },
      },
    });

    const versionsWithUrls = versions.map((version) => ({
      ...version,
      ...generateUrls(version.versionSlug, version.viewToken, version.editToken),
    }));

    res.json({
      success: true,
      data: versionsWithUrls,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/versions/:slug - Delete version
router.delete('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    await prisma.presentationVersion.delete({
      where: { versionSlug: slug },
    });

    res.json({
      success: true,
      message: 'Version deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
