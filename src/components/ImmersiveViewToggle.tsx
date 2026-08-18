import { useEffect } from 'react'
import type { Language } from '../data'

type Props = {
  language: Language
  hidden: boolean
  floating?: boolean
  onToggle: () => void
}

const copy: Record<Language, { hide: string; show: string }> = {
  en: { hide: 'Immersive view', show: 'Show interface' },
  zh: { hide: '沉浸观看', show: '显示界面' },
  id: { hide: 'Mode imersif', show: 'Tampilkan antarmuka' },
  ja: { hide: '没入ビュー', show: 'UIを表示' },
  ko: { hide: '몰입 보기', show: '인터페이스 표시' },
  ru: { hide: 'Иммерсивный просмотр', show: 'Показать интерфейс' },
  ar: { hide: 'عرض غامر', show: 'إظهار الواجهة' },
}

export function useImmersiveUiVisibility(active: boolean) {
  useEffect(() => {
    document.documentElement.classList.toggle('immersive-ui-clean', active)
    return () => document.documentElement.classList.remove('immersive-ui-clean')
  }, [active])
}

export default function ImmersiveViewToggle({ language, hidden, floating = false, onToggle }: Props) {
  const label = hidden ? copy[language].show : copy[language].hide
  return <button
    className={`immersive-ui-toggle${floating ? ' immersive-ui-toggle--floating' : ''}`}
    type="button"
    aria-pressed={hidden}
    aria-label={label}
    title={label}
    onClick={onToggle}
  >
    <span aria-hidden="true">{hidden ? '◈' : '✦'}</span>
    <span>{label}</span>
  </button>
}
