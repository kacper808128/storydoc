import type { JustJoinITProposal, PresentationContent } from '../types';

export function generateJustJoinITPresentation(data: JustJoinITProposal): PresentationContent {
  return {
    metadata: {
      title: `${data.offerTitle} - ${data.clientName}`,
      description: `Business proposal for ${data.clientName}`,
      author: data.accountManager.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    sections: [
      // Hero Section
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
              text: `Oferta dla\n${data.clientName}`,
              tag: 'h1',
            },
            style: {
              fontSize: '48px',
              fontWeight: '700',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: '20px',
            },
            animation: {
              type: 'fade',
              duration: 1,
              delay: 0.2,
            },
          },
          {
            id: 'hero-logo',
            type: 'image',
            content: {
              url: data.logo || 'https://justjoin.it/logo.png',
              alt: 'JustJoinIT Logo',
            },
            style: {
              maxWidth: '200px',
              margin: '0 auto',
            },
            animation: {
              type: 'scale',
              duration: 0.8,
              delay: 0.5,
            },
          },
          {
            id: 'hero-subtitle',
            type: 'text',
            content: {
              text: 'Bądź częścią najszybciej rozwijających się portali pracy w Polsce',
              tag: 'p',
            },
            style: {
              fontSize: '20px',
              color: '#ffffff',
              textAlign: 'center',
              opacity: '0.9',
            },
            animation: {
              type: 'fade',
              duration: 1,
              delay: 0.8,
            },
          },
          {
            id: 'hero-offer',
            type: 'text',
            content: {
              text: data.offerTitle,
              tag: 'h2',
            },
            style: {
              fontSize: '36px',
              fontWeight: '600',
              color: '#FFD700',
              textAlign: 'center',
              marginTop: '40px',
            },
            animation: {
              type: 'slide',
              duration: 1,
              delay: 1,
            },
          },
        ],
      },

      // About JustJoinIT
      {
        id: 'about',
        layout: 'two-column',
        blocks: [
          {
            id: 'about-title',
            type: 'text',
            content: {
              text: 'justjoin.it',
              tag: 'h2',
            },
            style: {
              fontSize: '32px',
              fontWeight: '700',
              marginBottom: '20px',
            },
          },
          {
            id: 'about-description',
            type: 'text',
            content: {
              text: 'Jesteśmy <span style="color: #FF5A5F;">najskuteczniejszym</span> portalem pracy w branży IT w Polsce.',
              tag: 'p',
            },
            style: {
              fontSize: '24px',
              lineHeight: '1.6',
            },
          },
          {
            id: 'about-stats',
            type: 'stats',
            content: {
              stats: [
                {
                  value: '63%',
                  label: 'CV wśród branżowych portali pracy w Polsce',
                  highlight: true,
                },
                {
                  value: '32 mln',
                  label: 'wyświetleń portalu justjoin.it',
                },
                {
                  value: '3.2 mln',
                  label: 'użytkowników na listach mailingowych',
                },
                {
                  value: '540 tys.',
                  label: 'osób zaobserwowanych w social media i grupach na Facebooku',
                },
              ],
            },
          },
        ],
      },

      // Packages Section
      {
        id: 'packages',
        title: 'Dostępne pakiety',
        layout: 'single',
        blocks: [
          {
            id: 'packages-title',
            type: 'text',
            content: {
              text: 'Dostępne warianty publikacji ogłoszeń',
              tag: 'h2',
            },
            style: {
              fontSize: '36px',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '40px',
            },
          },
          ...data.packages.map((pkg, index) => ({
            id: `package-${index}`,
            type: 'cta' as const,
            content: {
              title: pkg.name,
              subtitle: pkg.type,
              description: pkg.features.join('\n'),
              price: `${pkg.price.toLocaleString('pl-PL')} zł netto`,
              regularPrice: pkg.regularPrice
                ? `${pkg.regularPrice.toLocaleString('pl-PL')} zł`
                : undefined,
              highlighted: pkg.highlighted,
              features: pkg.features,
            },
            style: {
              background: pkg.highlighted ? data.primaryColor || '#FF5A5F' : '#ffffff',
              color: pkg.highlighted ? '#ffffff' : '#000000',
              border: pkg.highlighted ? 'none' : '2px solid #e5e7eb',
              borderRadius: '16px',
              padding: '30px',
              marginBottom: '20px',
            },
            animation: {
              type: 'slide' as const,
              duration: 0.8,
              delay: index * 0.2,
            },
          })),
        ],
      },

      // Additional Services
      ...(data.socialBoost || data.companyProfile || data.banners
        ? [
            {
              id: 'additional-services',
              title: 'Dodatkowe usługi',
              layout: 'two-column' as const,
              blocks: [
                ...(data.socialBoost
                  ? [
                      {
                        id: 'social-boost',
                        type: 'cta' as const,
                        content: {
                          title: 'Social Boost',
                          description:
                            'Dedykowana kampania reklamowa zwiększająca widoczność Twoich ogłoszeń',
                          price: `${data.socialBoost.price.toLocaleString('pl-PL')} zł netto`,
                          features: [
                            `Pakiet ${data.socialBoost.quantity} Social Boostów`,
                            'Targetowana kampania reklamowa',
                            'Zwiększona widoczność ogłoszeń',
                          ],
                        },
                      },
                    ]
                  : []),
                ...(data.companyProfile
                  ? [
                      {
                        id: 'company-profile',
                        type: 'cta' as const,
                        content: {
                          title: 'Profil Pracodawcy',
                          subtitle: data.companyProfile.type,
                          description:
                            'Zwiększ siłę rekrutacji dzięki Profilowi Pracodawcy',
                          price: `${data.companyProfile.price.toLocaleString('pl-PL')} zł netto`,
                          regularPrice: data.companyProfile.regularPrice
                            ? `${data.companyProfile.regularPrice.toLocaleString('pl-PL')} zł`
                            : undefined,
                        },
                      },
                    ]
                  : []),
              ],
            },
          ]
        : []),

      // Account Manager
      {
        id: 'account-manager',
        layout: 'split',
        background: {
          type: 'color',
          value: '#f9fafb',
        },
        blocks: [
          {
            id: 'manager-image',
            type: 'image',
            content: {
              url:
                data.accountManager.photo ||
                'https://ui-avatars.com/api/?name=' +
                  encodeURIComponent(data.accountManager.name) +
                  '&size=300',
              alt: data.accountManager.name,
            },
            style: {
              borderRadius: '50%',
              maxWidth: '200px',
              margin: '0 auto',
            },
          },
          {
            id: 'manager-info',
            type: 'text',
            content: {
              text: `
                <h3 style="font-size: 24px; margin-bottom: 10px;">Masz pytania? Napisz do mnie!</h3>
                <p style="font-size: 18px; margin: 10px 0;"><strong>${data.accountManager.name}</strong></p>
                <p style="margin: 5px 0;">Key Account Manager</p>
                <p style="margin: 5px 0;"><a href="mailto:${data.accountManager.email}">${data.accountManager.email}</a></p>
                <p style="margin: 5px 0;"><a href="tel:${data.accountManager.phone}">${data.accountManager.phone}</a></p>
              `,
              tag: 'div',
            },
          },
          {
            id: 'manager-cta',
            type: 'cta',
            content: {
              title: 'Umów spotkanie',
              buttonText: 'Umów spotkanie',
              buttonLink: `https://calendly.com/${data.accountManager.email}`,
            },
            style: {
              textAlign: 'center',
            },
          },
        ],
      },

      // Summary
      {
        id: 'summary',
        layout: 'single',
        background: {
          type: 'gradient',
          value: `linear-gradient(135deg, ${data.primaryColor || '#667eea'} 0%, ${data.secondaryColor || '#764ba2'} 100%)`,
        },
        blocks: [
          {
            id: 'summary-title',
            type: 'text',
            content: {
              text: 'Podsumowanie oferty',
              tag: 'h2',
            },
            style: {
              fontSize: '36px',
              fontWeight: '700',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: '30px',
            },
          },
          {
            id: 'summary-total',
            type: 'text',
            content: {
              text: `
                <div style="background: rgba(255,255,255,0.2); padding: 30px; border-radius: 12px; backdrop-filter: blur(10px);">
                  ${data.totalRegularPrice ? `<p style="text-decoration: line-through; opacity: 0.7; margin: 0;">Cena katalogowa: ${data.totalRegularPrice.toLocaleString('pl-PL')} zł netto</p>` : ''}
                  <p style="font-size: 48px; font-weight: 700; margin: 10px 0; color: #FFD700;">
                    ${data.totalPrice.toLocaleString('pl-PL')} zł netto
                  </p>
                  ${data.savings ? `<p style="margin: 0; color: #4ade80; font-size: 20px;">Oszczędzasz: ${data.savings.toLocaleString('pl-PL')} zł</p>` : ''}
                </div>
              `,
              tag: 'div',
            },
            style: {
              color: '#ffffff',
              textAlign: 'center',
            },
          },
          {
            id: 'summary-cta',
            type: 'cta',
            content: {
              title: 'Zainteresowany?',
              description: 'Skontaktuj się z nami już dziś!',
              buttonText: 'Umów spotkanie',
              buttonLink: `mailto:${data.accountManager.email}`,
            },
            style: {
              textAlign: 'center',
              marginTop: '30px',
            },
          },
        ],
      },
    ],
  };
}
