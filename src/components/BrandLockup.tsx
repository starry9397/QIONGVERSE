import type { MouseEvent } from 'react'

type BrandLockupProps = {
  href?: string
  onNavigate?: (event: MouseEvent<HTMLAnchorElement>) => void
}

export default function BrandLockup({ href = '#top', onNavigate }: BrandLockupProps) {
  return <a className="brand brand-lockup" href={href} onClick={onNavigate} aria-label="QIONGVERSE home">
    <img className="brand-emblem" src="/assets/brand/qiongverse-emblem.png" alt="" aria-hidden="true" />
    <img className="brand-wordmark" src="/assets/brand/qiongverse-wordmark.png" alt="" aria-hidden="true" />
    <span className="brand-sr-only">QIONGVERSE</span>
  </a>
}
