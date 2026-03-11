import type { Core } from '@strapi/strapi'

const MANAGER_PERMISSIONS = [
  'api::location.location.find',
  'api::location.location.findOne',
  'api::location.location.create',
  'api::location.location.update',
  'api::location.location.delete',
  'api::event.event.find',
  'api::event.event.findOne',
  'api::event.event.create',
  'api::event.event.update',
  'api::event.event.delete',
  'plugin::upload.content-api.upload',
  'plugin::upload.content-api.find',
  'plugin::upload.content-api.findOne',
  'plugin::upload.content-api.destroy',
]

async function seedManagerPermissions(strapi: Core.Strapi) {
  const managerRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { name: 'manager' } })

  if (!managerRole) return

  for (const action of MANAGER_PERMISSIONS) {
    const existing = await strapi.db
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action, role: managerRole.id } })

    if (!existing) {
      await strapi.db
        .query('plugin::users-permissions.permission')
        .create({ data: { action, role: managerRole.id, enabled: true } })
    } else if (!existing.enabled) {
      await strapi.db
        .query('plugin::users-permissions.permission')
        .update({ where: { id: existing.id }, data: { enabled: true } })
    }
  }
}

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    // Windows: temp file cleanup after S3 upload throws EBUSY (file still locked by OS/AV).
    // Upload already succeeded (201 sent to client) — safe to swallow this error.
    process.on('uncaughtException', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EBUSY' || err.code === 'EPERM') {
        strapi.log.warn(`[upload] Temp cleanup failed (${err.code}): ${err.message}`)
        return
      }
      throw err
    })
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await seedManagerPermissions(strapi)
  },
}
