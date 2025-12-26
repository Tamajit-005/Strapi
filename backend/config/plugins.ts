module.exports = ({ env }) => ({
  'users-permissions': {
    enabled: true,
    config: {
      jwtSecret: env(
        'JWT_SECRET',
        'adfcf9d898757e154f0c5e51f3def3e8cc03418b4de71944b558d95f0eea5407'
      ),
    },
  },

  graphql: {
    enabled: true,
    config: {
      endpoint: '/graphql',
      shadowCRUD: true,
      landingPage: false,
      depthLimit: 7,
      amountLimit: 100,
      apolloServer: {
        tracing: false,
      },
    },
  },
});
