import type { TemplateDefinition } from '../../../shared/types';

export function getJustJoinITTemplate(): TemplateDefinition {
  return {
    id: 'justjoinit-proposal',
    name: 'JustJoinIT Proposal',
    slug: 'justjoinit-proposal',
    description: 'Professional business proposal template for JustJoinIT sales presentations',
    thumbnail: '/templates/justjoinit-thumb.png',
    requiredVariables: [
      {
        key: 'clientName',
        type: 'text',
        value: '',
        label: 'Client Company Name',
      },
      {
        key: 'clientEmail',
        type: 'text',
        value: '',
        label: 'Client Email',
      },
      {
        key: 'offerTitle',
        type: 'text',
        value: 'Oferta Black Week 2025',
        label: 'Offer Title',
      },
      {
        key: 'offerDate',
        type: 'date',
        value: new Date().toISOString().split('T')[0],
        label: 'Offer Date',
      },
      {
        key: 'totalPrice',
        type: 'number',
        value: 0,
        label: 'Total Price',
      },
      {
        key: 'accountManager.name',
        type: 'text',
        value: 'Adrian Grzegolec',
        label: 'Account Manager Name',
      },
      {
        key: 'accountManager.email',
        type: 'text',
        value: 'adrian.grzegolec@justjoin.it',
        label: 'Account Manager Email',
      },
      {
        key: 'accountManager.phone',
        type: 'text',
        value: '507 241 808',
        label: 'Account Manager Phone',
      },
    ],
    defaultContent: {
      metadata: {
        title: 'JustJoinIT Proposal',
        description: 'Business proposal template',
        author: 'JustJoinIT Team',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      sections: [
        {
          id: 'hero',
          layout: 'hero',
          background: {
            type: 'gradient',
            value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          },
          blocks: [
            {
              id: 'hero-title',
              type: 'text',
              content: {
                text: 'Oferta dla\n{{clientName}}',
                tag: 'h1',
              },
              style: {
                fontSize: '48px',
                fontWeight: '700',
                color: '#ffffff',
                textAlign: 'center',
              },
            },
          ],
        },
      ],
    },
    defaultSettings: {
      theme: {
        primaryColor: '#FF5A5F',
        secondaryColor: '#6366F1',
        fontFamily: 'Inter, sans-serif',
        logoUrl: 'https://justjoin.it/logo.png',
      },
      tracking: {
        enableAnalytics: true,
      },
    },
  };
}
