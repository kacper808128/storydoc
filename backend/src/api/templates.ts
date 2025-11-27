import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { getJustJoinITTemplate } from '../templates/justjoinit';

const router = Router();
const prisma = new PrismaClient();

// GET /api/templates - List all templates
router.get('/', async (req, res, next) => {
  try {
    const templates = await prisma.template.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    // If no templates, return hardcoded JustJoinIT template
    if (templates.length === 0) {
      return res.json({
        success: true,
        data: [getJustJoinITTemplate()],
      });
    }

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/templates/:slug - Get template by slug
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    let template = await prisma.template.findUnique({
      where: { slug },
    });

    // If not found and it's justjoinit, return hardcoded template
    if (!template && slug === 'justjoinit-proposal') {
      return res.json({
        success: true,
        data: getJustJoinITTemplate(),
      });
    }

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/templates - Create new template (admin only - TODO: add auth)
router.post('/', async (req, res, next) => {
  try {
    const { name, slug, description, thumbnail, structure, defaultData } = req.body;

    const template = await prisma.template.create({
      data: {
        name,
        slug,
        description,
        thumbnail,
        structure,
        defaultData: defaultData || {},
      },
    });

    res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
