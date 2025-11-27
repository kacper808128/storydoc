import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import type { PipedriveWebhookPayload, JustJoinITProposal } from '../types';
import { generateJustJoinITPresentation } from '../services/templateGenerator';

const router = Router();
const prisma = new PrismaClient();

// POST /api/webhooks/pipedrive - Handle Pipedrive webhook
router.post('/pipedrive', async (req, res, next) => {
  try {
    const payload: PipedriveWebhookPayload = req.body;

    console.log('Received Pipedrive webhook:', payload.event);

    // Log webhook for debugging
    const webhookLog = await prisma.pipedriveWebhook.create({
      data: {
        dealId: payload.current.id.toString(),
        dealData: payload.current as any,
        status: 'pending',
      },
    });

    try {
      // Extract deal data
      const dealData = payload.current;

      // Map Pipedrive data to JustJoinIT proposal format
      const proposalData: JustJoinITProposal = {
        clientName: dealData.org_id?.name || dealData.person_id?.name || 'Client',
        clientEmail: dealData.person_id?.email?.[0],
        offerTitle: dealData.title || 'JustJoinIT Proposal',
        offerDate: new Date().toISOString().split('T')[0],
        validUntil: dealData.expected_close_date,

        // Default package - you can customize mapping based on Pipedrive fields
        packages: [
          {
            name: 'Package 1',
            type: 'Enterprise',
            jobPostings: 100,
            boost: 5,
            locations: 5,
            price: dealData.value || 0,
            features: [
              '5 boosts per job posting',
              '5 locations per posting',
              '30 days publication',
              'Customer Success support',
            ],
          },
        ],

        accountManager: {
          name: 'Adrian Grzegolec',
          email: 'adrian.grzegolec@justjoin.it',
          phone: '507 241 808',
        },

        logo: 'https://justjoin.it/logo.png',
        primaryColor: '#FF5A5F',
        secondaryColor: '#6366F1',

        totalPrice: dealData.value || 0,
      };

      // Get or create demo user
      let user = await prisma.user.findFirst();
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: 'demo@justjoinit.com',
            name: 'JustJoinIT Team',
            company: 'JustJoinIT',
          },
        });
      }

      // Generate presentation from template
      const presentationContent = generateJustJoinITPresentation(proposalData);

      // Create presentation
      const slug = `${nanoid(10)}-${Date.now()}`;
      const presentation = await prisma.presentation.create({
        data: {
          title: `${proposalData.offerTitle} - ${proposalData.clientName}`,
          slug,
          templateId: 'justjoinit-proposal',
          content: presentationContent as any,
          settings: {
            theme: {
              primaryColor: proposalData.primaryColor,
              secondaryColor: proposalData.secondaryColor,
              fontFamily: 'Inter',
              logoUrl: proposalData.logo,
            },
          },
          userId: user.id,
        },
      });

      // Create analytics
      await prisma.analytics.create({
        data: {
          presentationId: presentation.id,
        },
      });

      // Generate version with view and edit links
      const versionSlug = nanoid(12);
      const viewToken = nanoid(32);
      const editToken = nanoid(32);

      const version = await prisma.presentationVersion.create({
        data: {
          presentationId: presentation.id,
          versionSlug,
          viewToken,
          editToken,
          recipientName: proposalData.clientName,
          recipientEmail: proposalData.clientEmail,
          variables: proposalData as any,
        },
      });

      // Generate URLs
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const viewUrl = `${baseUrl}/view/${versionSlug}?token=${viewToken}`;
      const editUrl = `${baseUrl}/edit/${versionSlug}?token=${editToken}`;

      // Update webhook log with success
      await prisma.pipedriveWebhook.update({
        where: { id: webhookLog.id },
        data: {
          status: 'success',
          generatedId: presentation.id,
        },
      });

      console.log('✅ Presentation generated successfully!');
      console.log('View URL:', viewUrl);
      console.log('Edit URL:', editUrl);

      // Return response
      res.json({
        success: true,
        data: {
          presentationId: presentation.id,
          versionId: version.id,
          viewUrl,
          editUrl,
        },
      });
    } catch (error: any) {
      // Update webhook log with error
      await prisma.pipedriveWebhook.update({
        where: { id: webhookLog.id },
        data: {
          status: 'error',
          error: error.message,
        },
      });

      throw error;
    }
  } catch (error) {
    console.error('Pipedrive webhook error:', error);
    next(error);
  }
});

// GET /api/webhooks/pipedrive/logs - Get webhook logs (for debugging)
router.get('/pipedrive/logs', async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    const logs = await prisma.pipedriveWebhook.findMany({
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    });

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
