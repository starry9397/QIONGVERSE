import { useEffect, useRef, useState } from 'react'
import { FaFacebookF, FaTiktok, FaXTwitter, FaYoutube } from 'react-icons/fa6'
import type { Language } from '../data'
import { inline, localize, type RuntimeLocalized } from '../i18n'
import { copyText, tryShare } from '../share-utils'
import './social-share.css'

type Platform = 'x' | 'facebook' | 'tiktok' | 'youtube'
type PlatformStatus = { configured: boolean; action: 'share_intent' | 'share_dialog' | 'oauth_post' | 'oauth_video' | 'unavailable'; assetIds: string[] }
type SocialStatus = { publicShareReady: boolean; platforms: Record<Platform, PlatformStatus> }
type SocialCopy = {
  label: string
  unavailable: string
  shareOpened: string
  linkCopied: string
  pending: string
  serviceUnavailable: string
  connect: string
  confirmTitle: string
  confirmBody: string
  publish: string
  cancel: string
  publishing: string
  published: string
  failed: string
  visitorPost: string
}

type Props = {
  language: Language
  apiPath: (path: string) => string
}

const configuredSiteUrl = (import.meta.env.VITE_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '')
const canonicalUrl = /^https:\/\//i.test(configuredSiteUrl)
  ? configuredSiteUrl
  : typeof window !== 'undefined'
    ? window.location.href
    : ''

const localizedCopy: Record<Language, SocialCopy> = {
  en: {
    label: 'Share the exhibition',
    unavailable: 'Use the current page for a local share, or configure a public HTTPS address for platform intents.',
    shareOpened: 'The system share sheet is open.',
    linkCopied: 'The exhibition link was copied.',
    pending: 'Checking publishing availability...',
    serviceUnavailable: 'Publishing service is unavailable. Link sharing remains available when a public address is configured.',
    connect: 'Connect your account to continue',
    confirmTitle: 'Confirm your project post',
    confirmBody: 'This action uses only the fixed HAINAN∞QIONGVERSE project copy and approved project media. Your account is used for this one publish action only.',
    publish: 'Publish now',
    cancel: 'Cancel',
    publishing: 'Publishing...',
    published: 'The platform accepted your post.',
    failed: 'The post was not published. Please reconnect your account and try again.',
    visitorPost: 'VISITOR POST',
  },
  zh: {
    label: '分享琼境',
    unavailable: '可先使用当前页面分享；配置公开 HTTPS 地址后可打开平台分享意图。',
    shareOpened: '已打开系统分享面板。',
    linkCopied: '琼境链接已复制。',
    pending: '正在检查发布可用性……',
    serviceUnavailable: '发布服务暂不可用。配置公开地址后，链接分享仍可使用。',
    connect: '连接你的账号以继续',
    confirmTitle: '确认发布项目内容',
    confirmBody: '本次仅使用固定的 HAINAN∞QIONGVERSE 项目文案和已批准项目素材。你的账号仅用于这一次主动发布。',
    publish: '立即发布',
    cancel: '取消',
    publishing: '正在发布……',
    published: '平台已接收你的发布请求。',
    failed: '内容尚未发布。请重新连接账号后再试。',
    visitorPost: '访客发布',
  },
  id: {
    label: 'Bagikan pameran',
    unavailable: 'Gunakan halaman ini untuk berbagi lokal, atau konfigurasikan alamat HTTPS publik untuk platform.',
    shareOpened: 'Panel berbagi sistem dibuka.',
    linkCopied: 'Tautan pameran disalin.',
    pending: 'Memeriksa ketersediaan publikasi...',
    serviceUnavailable: 'Layanan publikasi tidak tersedia. Berbagi tautan tetap tersedia setelah alamat publik dikonfigurasi.',
    connect: 'Hubungkan akun Anda untuk melanjutkan',
    confirmTitle: 'Konfirmasi kiriman proyek',
    confirmBody: 'Tindakan ini hanya menggunakan teks proyek HAINAN∞QIONGVERSE yang tetap dan media proyek yang disetujui. Akun Anda hanya digunakan untuk satu publikasi ini.',
    publish: 'Publikasikan sekarang',
    cancel: 'Batal',
    publishing: 'Mempublikasikan...',
    published: 'Platform menerima kiriman Anda.',
    failed: 'Kiriman belum dipublikasikan. Hubungkan kembali akun Anda lalu coba lagi.',
    visitorPost: 'KIRIMAN PENGUNJUNG',
  },
  ja: {
    label: '展示を共有',
    unavailable: '現在のページでローカル共有できます。プラットフォーム連携には公開 HTTPS アドレスを設定してください。',
    shareOpened: 'システムの共有シートを開きました。',
    linkCopied: '展示のリンクをコピーしました。',
    pending: '公開可能か確認しています…',
    serviceUnavailable: '公開サービスは利用できません。公開アドレスを設定すればリンク共有は利用できます。',
    connect: '続行するにはアカウントを接続してください',
    confirmTitle: 'プロジェクト投稿を確認',
    confirmBody: 'この操作では、固定された HAINAN∞QIONGVERSE プロジェクト文案と承認済みのプロジェクトメディアのみを使用します。アカウントはこの一度の投稿にだけ使用されます。',
    publish: '今すぐ公開',
    cancel: 'キャンセル',
    publishing: '公開中…',
    published: 'プラットフォームが投稿を受け付けました。',
    failed: '投稿できませんでした。アカウントを再接続してもう一度お試しください。',
    visitorPost: '訪問者の投稿',
  },
  ko: {
    label: '전시 공유',
    unavailable: '현재 페이지로 로컬 공유를 사용할 수 있습니다. 플랫폼 공유에는 공개 HTTPS 주소가 필요합니다.',
    shareOpened: '시스템 공유 창을 열었습니다.',
    linkCopied: '전시 링크를 복사했습니다.',
    pending: '게시 가능 여부를 확인하는 중…',
    serviceUnavailable: '게시 서비스를 사용할 수 없습니다. 공개 주소를 설정하면 링크 공유는 계속 사용할 수 있습니다.',
    connect: '계속하려면 계정을 연결하세요',
    confirmTitle: '프로젝트 게시물 확인',
    confirmBody: '이 작업은 고정된 HAINAN∞QIONGVERSE 프로젝트 문구와 승인된 프로젝트 미디어만 사용합니다. 계정은 이 한 번의 게시 작업에만 사용됩니다.',
    publish: '지금 게시',
    cancel: '취소',
    publishing: '게시 중…',
    published: '플랫폼이 게시물을 접수했습니다.',
    failed: '게시되지 않았습니다. 계정을 다시 연결한 뒤 시도하세요.',
    visitorPost: '방문자 게시물',
  },
  ru: {
    label: 'Поделиться выставкой',
    unavailable: 'Используйте текущую страницу для локальной передачи или настройте публичный HTTPS-адрес для платформ.',
    shareOpened: 'Системное окно общего доступа открыто.',
    linkCopied: 'Ссылка на выставку скопирована.',
    pending: 'Проверяем доступность публикации…',
    serviceUnavailable: 'Сервис публикации недоступен. После настройки публичного адреса останется доступна передача ссылки.',
    connect: 'Подключите аккаунт, чтобы продолжить',
    confirmTitle: 'Подтвердите публикацию проекта',
    confirmBody: 'Действие использует только фиксированный текст проекта HAINAN∞QIONGVERSE и одобренные материалы проекта. Аккаунт используется только для этой публикации.',
    publish: 'Опубликовать сейчас',
    cancel: 'Отмена',
    publishing: 'Публикация…',
    published: 'Платформа приняла вашу публикацию.',
    failed: 'Публикация не выполнена. Подключите аккаунт заново и повторите попытку.',
    visitorPost: 'ПУБЛИКАЦИЯ ПОСЕТИТЕЛЯ',
  },
  ar: {
    label: 'مشاركة المعرض',
    unavailable: 'يمكنك مشاركة الصفحة الحالية محلياً، أو إعداد عنوان HTTPS عام لروابط المنصات.',
    shareOpened: 'فُتحت لوحة المشاركة في النظام.',
    linkCopied: 'نُسخ رابط المعرض.',
    pending: 'جارٍ التحقق من توفر النشر…',
    serviceUnavailable: 'خدمة النشر غير متاحة. تظل مشاركة الرابط متاحة بعد إعداد عنوان عام.',
    connect: 'اربط حسابك للمتابعة',
    confirmTitle: 'تأكيد منشور المشروع',
    confirmBody: 'يستخدم هذا الإجراء نص مشروع HAINAN∞QIONGVERSE الثابت ووسائط المشروع المعتمدة فقط. يُستخدم حسابك لهذا النشر الواحد فقط.',
    publish: 'انشر الآن',
    cancel: 'إلغاء',
    publishing: 'جارٍ النشر…',
    published: 'قبلت المنصة منشورك.',
    failed: 'لم يُنشر المنشور. أعد ربط حسابك وحاول مرة أخرى.',
    visitorPost: 'منشور الزائر',
  },
}

const platformDetails: Record<Platform, { Icon: typeof FaXTwitter; name: string; assetId: string | null }> = {
  x: { Icon: FaXTwitter, name: 'X', assetId: null },
  facebook: { Icon: FaFacebookF, name: 'Facebook', assetId: null },
  tiktok: { Icon: FaTiktok, name: 'TikTok', assetId: 'luoyin-cg-vertical' },
  youtube: { Icon: FaYoutube, name: 'YouTube', assetId: 'hainan-unfolded-hero' },
}

function projectText(language: Language) {
  const copy: RuntimeLocalized = {
    en: 'HAINAN∞QIONGVERSE: a living gateway to Hainan Province, where tropical culture and AI creativity meet.',
    zh: 'HAINAN∞QIONGVERSE 琼境：连接海南热带文化与 AI 创意的数字展馆。',
    id: 'HAINAN∞QIONGVERSE: gerbang hidup ke Provinsi Hainan, tempat budaya tropis dan kreativitas AI bertemu.',
    ja: 'HAINAN∞QIONGVERSE：熱帯文化と AI の創造性が出会う、海南省への生きたゲートウェイ。',
    ko: 'HAINAN∞QIONGVERSE: 열대 문화와 AI 창의성이 만나는 하이난성으로 향하는 살아 있는 관문.',
    ru: 'HAINAN∞QIONGVERSE: живые ворота в провинцию Хайнань, где встречаются тропическая культура и творчество ИИ.',
    ar: 'HAINAN∞QIONGVERSE: بوابة حية إلى مقاطعة هاينان، حيث تلتقي الثقافة الاستوائية بإبداع الذكاء الاصطناعي.',
  }
  return localize(copy, language)
}

function localizedShareCopy(language: Language) {
  return localizedCopy[language]
}

function shareIntent(platform: 'x' | 'facebook', language: Language) {
  const url = encodeURIComponent(canonicalUrl)
  if (platform === 'x') return `https://x.com/intent/post?url=${url}&text=${encodeURIComponent(projectText(language))}`
  return `https://www.facebook.com/sharer/sharer.php?u=${url}`
}

export default function SocialShare({ language, apiPath }: Props) {
  const [status, setStatus] = useState<SocialStatus | null>(null)
  const [statusError, setStatusError] = useState(false)
  const [callbackError, setCallbackError] = useState(false)
  const [localShareStatus, setLocalShareStatus] = useState('')
  const [pendingPlatform, setPendingPlatform] = useState<Platform | null>(null)
  const [publishState, setPublishState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const copy = localizedShareCopy(language)

  useEffect(() => {
    let active = true
    fetch(apiPath('/api/social/status'))
      .then(async (response) => {
        if (!response.ok) throw new Error('social_status_unavailable')
        return response.json() as Promise<SocialStatus>
      })
      .then((next) => { if (active) setStatus(next) })
      .catch(() => { if (active) setStatusError(true) })
    return () => { active = false }
  }, [apiPath])

  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    const platform = query.get('platform')
    const knownPlatform = platformDetails[platform as Platform] && platform !== 'facebook'
    if (!knownPlatform || !['ready', 'error'].includes(query.get('social') || '')) return
    if (query.get('social') === 'ready') {
      setPendingPlatform(platform as Platform)
      setPublishState('idle')
    } else {
      setCallbackError(true)
    }
    query.delete('social')
    query.delete('platform')
    const remaining = query.toString()
    window.history.replaceState({}, '', `${window.location.pathname}${remaining ? `?${remaining}` : ''}${window.location.hash}`)
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (pendingPlatform && !dialog.open) dialog.showModal()
    if (!pendingPlatform && dialog.open) dialog.close()
  }, [pendingPlatform])

  const closeDialog = () => {
    setPendingPlatform(null)
    setPublishState('idle')
  }

  const begin = async (platform: Platform) => {
    const detail = status?.platforms?.[platform]
    setLocalShareStatus('')
    if (platform === 'facebook' || platform === 'x') {
      window.open(shareIntent(platform === 'facebook' ? 'facebook' : 'x', language), '_blank', 'noopener,noreferrer')
      return
    }
    if (detail?.configured && (detail.action === 'oauth_post' || detail.action === 'oauth_video')) {
      window.location.assign(apiPath(`/api/social/${platform}/authorize?locale=${language}`))
      return
    }
    const result = await tryShare({ title: copy.label, text: projectText(language), url: canonicalUrl })
    if (result === 'shared') { setLocalShareStatus(copy.shareOpened); return }
    if (result === 'cancelled') return
    setLocalShareStatus(await copyText(canonicalUrl) ? copy.linkCopied : copy.serviceUnavailable)
  }

  const publish = async () => {
    if (!pendingPlatform) return
    setPublishState('sending')
    const assetId = platformDetails[pendingPlatform].assetId
    try {
      const response = await fetch(apiPath(`/api/social/${pendingPlatform}/publish`), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ locale: language, ...(assetId ? { assetId } : {}) }),
      })
      const payload = await response.json() as { accepted?: boolean }
      if (!response.ok || !payload.accepted) throw new Error('publish_failed')
      setPublishState('success')
    } catch {
      setPublishState('error')
    }
  }

  const buttonState = (platform: Platform) => {
    if (!status) return { disabled: false, title: platform === 'tiktok' || platform === 'youtube' ? copy.pending : platformDetails[platform].name }
    const detail = status.platforms[platform]
    if (detail.action === 'unavailable') return { disabled: false, title: copy.unavailable }
    return { disabled: false, title: platformDetails[platform].name }
  }

  return <section className="social-share" aria-label={copy.label}>
    <p>{copy.label}</p>
    <div className="social-share-actions" role="group" aria-label={copy.label}>
      {(Object.keys(platformDetails) as Platform[]).map((platform) => {
        const { Icon, name } = platformDetails[platform]
        const state = buttonState(platform)
        return <button key={platform} type="button" className={`social-share-button social-share-button--${platform}`} onClick={() => begin(platform)} disabled={state.disabled} title={state.title} aria-label={`${copy.label}: ${name}`}>
          <Icon aria-hidden="true" focusable="false" />
          <span className="brand-sr-only">{name}</span>
        </button>
      })}
    </div>
    {(localShareStatus || statusError || callbackError) && <span className="social-share-status" role="status">{localShareStatus || (callbackError ? copy.failed : copy.serviceUnavailable)}</span>}
    <dialog ref={dialogRef} className="social-publish-dialog" aria-labelledby="social-publish-title" onCancel={closeDialog}>
      <div className="social-publish-dialog-head"><p className="mono-label">{copy.visitorPost} / {pendingPlatform?.toUpperCase()}</p><button type="button" className="close-button" onClick={closeDialog} aria-label={inline(language, 'Close publish confirmation', '关闭发布确认')}>×</button></div>
      <h2 id="social-publish-title">{copy.confirmTitle}</h2>
      <p>{copy.confirmBody}</p>
      {pendingPlatform && <dl><div><dt>{inline(language, 'Platform', '平台')}</dt><dd>{platformDetails[pendingPlatform].name}</dd></div><div><dt>{inline(language, 'Content', '内容')}</dt><dd>{projectText(language)}</dd></div></dl>}
      {publishState === 'success' ? <p className="social-publish-result is-success" role="status">{copy.published}</p> : publishState === 'error' ? <p className="social-publish-result is-error" role="alert">{copy.failed}</p> : <div className="social-publish-actions"><button type="button" className="outline-button" onClick={closeDialog}>{copy.cancel}</button><button type="button" className="primary-button" disabled={publishState === 'sending'} onClick={publish}>{publishState === 'sending' ? copy.publishing : copy.publish}</button></div>}
    </dialog>
  </section>
}
