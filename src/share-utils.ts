export type ShareAttempt = 'shared' | 'cancelled' | 'unavailable'

export function publicShareUrl(currentUrl: string): string {
  const configured = (import.meta.env.VITE_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '')
  if (!/^https:\/\//i.test(configured)) return currentUrl
  try {
    const current = new URL(currentUrl)
    const publicUrl = new URL(configured)
    publicUrl.pathname = current.pathname
    publicUrl.search = current.search
    publicUrl.hash = current.hash
    return publicUrl.toString()
  } catch {
    return currentUrl
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Fall through to the legacy textarea path for non-secure previews.
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand('copy')
    textarea.remove()
    return copied
  } catch {
    return false
  }
}

export async function tryShare(payload: ShareData): Promise<ShareAttempt> {
  if (!navigator.share) return 'unavailable'
  try {
    await navigator.share(payload)
    return 'shared'
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
    return 'unavailable'
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
