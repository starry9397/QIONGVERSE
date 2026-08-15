import type { ChangeEvent } from 'react'
import { inline, languageMeta, supportedLanguages, type Language } from '../i18n'

type Props = { language: Language; onChange: (language: Language) => void; className?: string }

export default function LanguageSelector({ language, onChange, className = '' }: Props) {
  const label = inline(language, 'Switch language', '切换语言')
  const change = (event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value as Language)
  return <label className={`language-selector ${className}`.trim()}>
    <span className="sr-only">{label}</span>
    <select value={language} onChange={change} aria-label={label}>
      {supportedLanguages.map((item) => <option key={item} value={item}>{languageMeta[item].label}</option>)}
    </select>
  </label>
}
