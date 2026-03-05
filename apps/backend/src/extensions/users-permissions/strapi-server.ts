export default (plugin: any) => {
  plugin.controllers.user.me = async (ctx: any) => {
    if (!ctx.state.user) {
      return ctx.unauthorized();
    }

    const user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: ctx.state.user.id },
      populate: ['role'],
    });

    if (!user) {
      return ctx.unauthorized();
    }

    ctx.send({
      id: user.id,
      documentId: user.documentId,
      username: user.username,
      email: user.email,
      provider: user.provider,
      confirmed: user.confirmed,
      blocked: user.blocked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role
        ? { id: user.role.id, name: user.role.name, type: user.role.type }
        : null,
    });
  };

  return plugin;
};
