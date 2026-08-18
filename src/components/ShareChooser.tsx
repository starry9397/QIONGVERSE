import { useEffect, useMemo, useState } from 'react'
import type { Language } from '../data'
import { assertLocalizationTree, localize, type RuntimeLocalized } from '../i18n'
import { copyText, downloadBlob, tryShare } from '../share-utils'
import './share-chooser.css'

type ShareFile = { blob: Blob; filename: string } | null
type PlatformId = 'system' | 'x' | 'facebook' | 'telegram' | 'whatsapp' | 'weibo' | 'copy' | 'download'
type Props = {
  language: Language
  open: boolean
  title: string
  text: string
  url: string
  file?: ShareFile
  onClose: () => void
}

const copy = {
  title: { en: 'Choose where to share', zh: '选择分享平台', id: 'Pilih tempat berbagi', ja: '共有先を選ぶ', ko: '공유할 곳 선택', ru: 'Выберите площадку', ar: 'اختر مكان المشاركة' },
  description: { en: 'Open a platform with this page link and caption. A locally generated image is only attached through the system share sheet.', zh: '选择平台后会携带当前页面链接与文案。浏览器生成的图片只会通过系统分享面板附带。', id: 'Platform akan dibuka dengan tautan halaman dan keterangan. Gambar lokal hanya dilampirkan melalui panel berbagi sistem.', ja: 'ページリンクとキャプションを付けてプラットフォームを開きます。ローカル画像はシステム共有シートからのみ添付されます。', ko: '현재 페이지 링크와 문구를 포함해 플랫폼을 엽니다. 로컬 이미지는 시스템 공유 창에서만 첨부됩니다.', ru: 'Площадка откроется со ссылкой и подписью. Локальное изображение прикрепляется только через системное окно общего доступа.', ar: 'يفتح النظام المنصة مع رابط الصفحة والوصف. تُرفق الصورة المحلية عبر لوحة المشاركة في النظام فقط.' },
  system: { en: 'System share', zh: '系统分享', id: 'Berbagi sistem', ja: 'システム共有', ko: '시스템 공유', ru: 'Системная отправка', ar: 'مشاركة النظام' },
  x: { en: 'Share on X', zh: '分享到 X', id: 'Bagikan ke X', ja: 'X で共有', ko: 'X에 공유', ru: 'Поделиться в X', ar: 'مشاركة على X' },
  facebook: { en: 'Share on Facebook', zh: '分享到 Facebook', id: 'Bagikan ke Facebook', ja: 'Facebook で共有', ko: 'Facebook에 공유', ru: 'Поделиться в Facebook', ar: 'مشاركة على Facebook' },
  telegram: { en: 'Share on Telegram', zh: '分享到 Telegram', id: 'Bagikan ke Telegram', ja: 'Telegram で共有', ko: 'Telegram에 공유', ru: 'Поделиться в Telegram', ar: 'مشاركة على Telegram' },
  whatsapp: { en: 'Share on WhatsApp', zh: '分享到 WhatsApp', id: 'Bagikan ke WhatsApp', ja: 'WhatsApp で共有', ko: 'WhatsApp에 공유', ru: 'Поделиться в WhatsApp', ar: 'مشاركة على WhatsApp' },
  weibo: { en: 'Share on Weibo', zh: '分享到微博', id: 'Bagikan ke Weibo', ja: 'Weibo で共有', ko: 'Weibo에 공유', ru: 'Поделиться в Weibo', ar: 'مشاركة على Weibo' },
  copy: { en: 'Copy link', zh: '复制链接', id: 'Salin tautan', ja: 'リンクをコピー', ko: '링크 복사', ru: 'Скопировать ссылку', ar: 'نسخ الرابط' },
  download: { en: 'Download image', zh: '下载图片', id: 'Unduh gambar', ja: '画像をダウンロード', ko: '이미지 다운로드', ru: 'Скачать изображение', ar: 'تنزيل الصورة' },
  opened: { en: 'The platform share window is open.', zh: '平台分享窗口已打开。', id: 'Jendela berbagi platform telah dibuka.', ja: 'プラットフォームの共有画面を開きました。', ko: '플랫폼 공유 창을 열었습니다.', ru: 'Окно общего доступа платформы открыто.', ar: 'فُتحت نافذة مشاركة المنصة.' },
  copied: { en: 'The link was copied.', zh: '链接已复制。', id: 'Tautan disalin.', ja: 'リンクをコピーしました。', ko: '링크를 복사했습니다.', ru: 'Ссылка скопирована.', ar: 'نُسخ الرابط.' },
  downloaded: { en: 'The image was downloaded.', zh: '图片已下载。', id: 'Gambar telah diunduh.', ja: '画像をダウンロードしました。', ko: '이미지를 다운로드했습니다.', ru: 'Изображение скачано.', ar: 'تم تنزيل الصورة.' },
  unavailable: { en: 'This browser could not complete that share action.', zh: '当前浏览器无法完成这次分享。', id: 'Peramban ini tidak dapat menyelesaikan berbagi.', ja: 'このブラウザーでは共有を完了できません。', ko: '이 브라우저에서 공유를 완료할 수 없습니다.', ru: 'Этот браузер не смог завершить отправку.', ar: 'تعذر على هذا المتصفح إكمال المشاركة.' },
  close: { en: 'Close share options', zh: '关闭分享选项', id: 'Tutup opsi berbagi', ja: '共有オプションを閉じる', ko: '공유 옵션 닫기', ru: 'Закрыть варианты отправки', ar: 'إغلاق خيارات المشاركة' },
} satisfies Record<string, RuntimeLocalized>
assertLocalizationTree(copy, 'share chooser copy')

function tx(language: Language, value: RuntimeLocalized) { return localize(value, language) }

export default function ShareChooser({ language, open, title, text, url, file = null, onClose }: Props) {
  const [status, setStatus] = useState('')
  const labels = useMemo(() => ({
    system: tx(language, copy.system), x: tx(language, copy.x), facebook: tx(language, copy.facebook), telegram: tx(language, copy.telegram), whatsapp: tx(language, copy.whatsapp), weibo: tx(language, copy.weibo), copy: tx(language, copy.copy), download: tx(language, copy.download),
  }), [language])

  useEffect(() => { if (open) setStatus('') }, [open])
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])
  if (!open) return null

  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(`${text} ${url}`)
  const openPlatform = (platform: Exclude<PlatformId, 'system' | 'copy' | 'download'>) => {
    const targets = {
      x: `https://x.com/intent/post?url=${encodedUrl}&text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodedText}`,
      weibo: `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedText}`,
    }
    window.open(targets[platform], '_blank', 'noopener,noreferrer')
    setStatus(tx(language, copy.opened))
  }
  const shareSystem = async () => {
    let fileSupported = false
    if (file) {
      try { fileSupported = !navigator.canShare || navigator.canShare({ files: [new File([file.blob], file.filename, { type: file.blob.type || 'image/png' })] }) } catch { fileSupported = false }
    }
    const payload: ShareData = { title, text, url }
    if (file && fileSupported) payload.files = [new File([file.blob], file.filename, { type: file.blob.type || 'image/png' })]
    const result = await tryShare(payload)
    if (result === 'shared') setStatus(tx(language, copy.opened))
    else if (result === 'unavailable') setStatus(tx(language, copy.unavailable))
  }
  const copyLink = async () => setStatus(await copyText(url) ? tx(language, copy.copied) : tx(language, copy.unavailable))
  const download = () => { if (!file) return; downloadBlob(file.blob, file.filename); setStatus(tx(language, copy.downloaded)) }
  const options: Array<{ id: PlatformId; label: string; glyph: string }> = [
    { id: 'system', label: labels.system, glyph: '↗' }, { id: 'x', label: labels.x, glyph: '𝕏' }, { id: 'facebook', label: labels.facebook, glyph: 'f' }, { id: 'telegram', label: labels.telegram, glyph: '➤' }, { id: 'whatsapp', label: labels.whatsapp, glyph: '◌' }, { id: 'weibo', label: labels.weibo, glyph: '微' }, { id: 'copy', label: labels.copy, glyph: '⧉' }, ...(file ? [{ id: 'download' as const, label: labels.download, glyph: '↓' }] : []),
  ]
  return <div className="share-chooser" role="dialog" aria-modal="true" aria-labelledby="share-chooser-title">
    <button className="share-chooser-backdrop" type="button" aria-label={tx(language, copy.close)} onClick={onClose} />
    <div className="share-chooser-panel">
      <div className="share-chooser-head"><div><p className="share-chooser-kicker">HAINAN∞QIONGVERSE / SHARE</p><h2 id="share-chooser-title">{tx(language, copy.title)}</h2></div><button type="button" className="share-chooser-close" onClick={onClose} aria-label={tx(language, copy.close)}>×</button></div>
      <p className="share-chooser-description">{tx(language, copy.description)}</p>
      <div className="share-chooser-options">{options.map((option) => <button key={option.id} type="button" onClick={() => option.id === 'system' ? void shareSystem() : option.id === 'copy' ? void copyLink() : option.id === 'download' ? download() : openPlatform(option.id)}><span aria-hidden="true">{option.glyph}</span><strong>{option.label}</strong></button>)}</div>
      {status && <p className="share-chooser-status" role="status" aria-live="polite">{status}</p>}
    </div>
  </div>
}
