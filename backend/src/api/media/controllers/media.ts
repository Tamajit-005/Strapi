export default {
  async bulkDelete(ctx: any) {
    const { ids } = ctx.request.body as { ids: number[] };

    if (!Array.isArray(ids) || ids.length === 0) {
      return ctx.badRequest("ids must be a non-empty array");
    }

    const uploadService = strapi.plugin("upload").service("upload");

    await Promise.all(
      ids.map((id: number) =>
        uploadService
          .remove({ id })
          .catch((e: any) => console.warn(`Bulk delete failed for id=${id}:`, e))
      )
    );

    ctx.status = 200;
    ctx.body = { deleted: ids };
  },
};