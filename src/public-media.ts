/** Resolve existing project media against the current app origin. */
export function publicMedia(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  let normalized = path.startsWith('/') ? path : `/${path}`
  const buildBase = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')
  if (buildBase && buildBase !== '/' && normalized.startsWith(`${buildBase}/`)) {
    normalized = normalized.slice(buildBase.length)
  }
  return `${buildBase === '/' ? '' : buildBase}${normalized}` || '/'
}

/** Resolve a small route-scoped asset against the current app base path. */
export function localMedia(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  let normalized = path.startsWith('/') ? path : `/${path}`
  const buildBase = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')
  if (buildBase && buildBase !== '/' && normalized.startsWith(`${buildBase}/`)) {
    normalized = normalized.slice(buildBase.length)
  }
  return `${buildBase === '/' ? '' : buildBase}${normalized}` || '/'
}
