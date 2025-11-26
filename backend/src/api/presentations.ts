import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createPresentationSchema = z.object({
  title: z.string().min(1),
  templateId: z.string().default('justjoinit-proposal'),
  content: z.any(),
  settings: z.any().optional(),
  userId: z.string().optional(), // For now, we'll generate a demo user
});

const updatePresentationSchema = z.object({
  title: z.string().optional(),
  content: z.any().optional(),
  settings: z.any().optional(),
});

// GET /api/presentations - List all presentations
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = search
      ? {
          OR: [
            { title: { contains: search as string, mode: 'insensitive' as const } },
            { slug: { contains: search as string, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [presentations, total] = await Promise.all([
      prisma.presentation.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { versions: true },
          },
        },
      }),
      prisma.presentation.count({ where }),
    ]);

    res.json({
      success: true,
      data: presentations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/presentations/:id - Get single presentation
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const presentation = await prisma.presentation.findUnique({
      where: { id },
      include: {
        versions: {
          select: {
            id: true,
            versionSlug: true,
            recipientName: true,
            recipientEmail: true,
            createdAt: true,
            _count: {
              select: { views: true },
            },
          },
        },
        analytics: true,
      },
    });

    if (!presentation) {
      return res.status(404).json({
        success: false,
        error: 'Presentation not found',
      });
    }

    res.json({
      success: true,
      data: presentation,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/presentations - Create new presentation
router.post('/', async (req, res, next) => {
  try {
    const validatedData = createPresentationSchema.parse(req.body);

    // Create or get demo user for now
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'demo@justjoinit.com',
          name: 'Demo User',
          company: 'JustJoinIT',
        },
      });
    }

    const slug = `${nanoid(10)}-${Date.now()}`;

    const presentation = await prisma.presentation.create({
      data: {
        title: validatedData.title,
        slug,
        templateId: validatedData.templateId,
        content: validatedData.content,
        settings: validatedData.settings || {},
        userId: user.id,
      },
    });

    // Create analytics entry
    await prisma.analytics.create({
      data: {
        presentationId: presentation.id,
      },
    });

    res.status(201).json({
      success: true,
      data: presentation,
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

// PUT /api/presentations/:id - Update presentation
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = updatePresentationSchema.parse(req.body);

    const presentation = await prisma.presentation.update({
      where: { id },
      data: validatedData,
    });

    res.json({
      success: true,
      data: presentation,
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

// DELETE /api/presentations/:id - Delete presentation
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.presentation.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Presentation deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
