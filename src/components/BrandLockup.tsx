import type { MouseEvent } from 'react'

type BrandLockupProps = {
  href?: string
  onNavigate?: (event: MouseEvent<HTMLAnchorElement>) => void
}

export default function BrandLockup({ href = '#top', onNavigate }: BrandLockupProps) {
  return <a className="brand brand-lockup" href={href} onClick={onNavigate} aria-label="QIONGVERSE home">
    <picture><source type="image/webp" srcSet="/assets/brand/qiongverse-emblem.webp" /><img className="brand-emblem" src="/assets/brand/qiongverse-emblem.png" decoding="async" alt="" aria-hidden="true" /></picture>
    <picture><source type="image/webp" srcSet="/assets/brand/qiongverse-wordmark.webp" /><img className="brand-wordmark" src="/assets/brand/qiongverse-wordmark.png" decoding="async" alt="" aria-hidden="true" /></picture>
    <span className="brand-sr-only">QIONGVERSE</span>
  </a>
}
