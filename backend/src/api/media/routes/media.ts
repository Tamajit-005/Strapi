export default {
  routes: [
    {
      method: "POST",
      path: "/media/bulk-delete",
      handler: "media.bulkDelete",
      config: { policies: [], middlewares: [] },
    },
  ],
};