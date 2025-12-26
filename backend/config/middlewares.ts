export default [
  'strapi::logger',
  'strapi::errors',

  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:', 'http://localhost:3000'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'https://market-assets.strapi.io',
          ],
          'media-src': ["'self'", 'data:', 'blob:'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },

  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      headers: [
        'Content-Type',
        'Authorization',
        'Origin',
        'Accept',
        'Keep-Alive',
        'User-Agent',
        'Cache-Control',
        'X-Requested-With',
      ],
      credentials: true,
      keepHeaderOnError: true,
    },
  },

  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
