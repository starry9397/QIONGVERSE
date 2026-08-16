/** Resolve existing project media locally or through the read-only production CDN. */
export function publicMedia(path: string): string {
  let normalized = path.startsWith('/') ? path : `/${path}`
  const buildBase = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')
  // prepare-pages rewrites root literals to the project Pages prefix. Remove
  // that prefix before joining the optional large-media origin.
  if (buildBase && buildBase !== '/' && normalized.startsWith(`${buildBase}/`)) {
    normalized = normalized.slice(buildBase.length)
  }
  const configuredBase = (import.meta.env.VITE_LARGE_MEDIA_BASE_URL || '').trim().replace(/\/+$/, '')
  return configuredBase ? `${configuredBase}${normalized}` : normalized
}
