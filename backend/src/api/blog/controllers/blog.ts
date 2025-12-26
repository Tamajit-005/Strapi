import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::blog.blog', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized("You must be logged in");

    const { data } = ctx.request.body;

    // This bypasses request validator and directly creates the entry.
    const entry = await strapi.entityService.create('api::blog.blog', {
      data: {
        ...data,
        writer: user.id,
      },
    });

    return this.transformResponse(entry);
  },
}));
