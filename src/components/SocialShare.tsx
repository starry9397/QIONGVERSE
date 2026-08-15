import { useEffect, useRef, useState } from 'react'
import { FaFacebookF, FaTiktok, FaXTwitter, FaYoutube } from 'react-icons/fa6'
import type { Language } from '../data'
import { inline, translateProjectText } from '../i18n'
import './social-share.css'

type Platform = 'x' | 'facebook' | 'tiktok' | 'youtube'
type PlatformStatus = { configured: boolean; action: 'share_intent' | 'share_dialog' | 'oauth_post' | 'oauth_video' | 'unavailable'; assetIds: string[] }
type SocialStatus = { publicShareReady: boolean; platforms: Record<Platform, PlatformStatus> }

type Props = {
  language: Language
  apiPath: (path: string) => string
}

const configuredSiteUrl = (import.meta.env.VITE_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '')
const canonicalUrl = /^https:\/\//i.test(configuredSiteUrl) ? configuredSiteUrl : ''

const localizedCopy = {
  en: {
    label: 'Share the exhibition',
    unavailable: 'Sharing becomes available after the public HTTPS address is configured.',
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
  },
  zh: {
    label: '分享琼境',
    unavailable: '配置公开 HTTPS 地址后即可分享。',
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
  },
} as const

const platformDetails: Record<Platform, { Icon: typeof FaXTwitter; name: string; assetId: string | null }> = {
  x: { Icon: FaXTwitter, name: 'X', assetId: null },
  facebook: { Icon: FaFacebookF, name: 'Facebook', assetId: null },
  tiktok: { Icon: FaTiktok, name: 'TikTok', assetId: 'luoyin-cg-vertical' },
  youtube: { Icon: FaYoutube, name: 'YouTube', assetId: 'hainan-unfolded-hero' },
}

function projectText(language: Language) {
  return inline(language, 'HAINAN∞QIONGVERSE: a living gateway to Hainan Province, where tropical culture and AI creativity meet.', 'HAINAN∞QIONGVERSE 琼境：连接海南热带文化与 AI 创意的数字展馆。')
}

function localizedShareCopy(language: Language) {
  const selected = localizedCopy[language as keyof typeof localizedCopy]
  if (selected) return selected
  const source = localizedCopy.en
  return Object.fromEntries(Object.entries(source).map(([key, value]) => [key, translateProjectText(value, language)])) as typeof source
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

  const begin = (platform: Platform) => {
    const detail = status?.platforms?.[platform]
    if (!canonicalUrl) return
    if (platform === 'facebook' || (platform === 'x' && detail?.action === 'share_intent')) {
      window.open(shareIntent(platform === 'facebook' ? 'facebook' : 'x', language), '_blank', 'noopener,noreferrer')
      return
    }
    if (!detail?.configured || (detail.action !== 'oauth_post' && detail.action !== 'oauth_video')) return
    window.location.assign(apiPath(`/api/social/${platform}/authorize?locale=${language}`))
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
    if (!canonicalUrl) return { disabled: true, title: copy.unavailable }
    if (!status) return { disabled: platform === 'tiktok' || platform === 'youtube', title: platform === 'tiktok' || platform === 'youtube' ? copy.pending : platformDetails[platform].name }
    const detail = status.platforms[platform]
    if (detail.action === 'unavailable') return { disabled: true, title: copy.connect }
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
    {(statusError || !canonicalUrl || callbackError) && <span className="social-share-status" role="status">{callbackError ? copy.failed : statusError ? copy.serviceUnavailable : copy.unavailable}</span>}
    <dialog ref={dialogRef} className="social-publish-dialog" aria-labelledby="social-publish-title" onCancel={closeDialog}>
      <div className="social-publish-dialog-head"><p className="mono-label">VISITOR POST / {pendingPlatform?.toUpperCase()}</p><button type="button" className="close-button" onClick={closeDialog} aria-label={inline(language, 'Close publish confirmation', '关闭发布确认')}>×</button></div>
      <h2 id="social-publish-title">{copy.confirmTitle}</h2>
      <p>{copy.confirmBody}</p>
      {pendingPlatform && <dl><div><dt>{inline(language, 'Platform', '平台')}</dt><dd>{platformDetails[pendingPlatform].name}</dd></div><div><dt>{inline(language, 'Content', '内容')}</dt><dd>{projectText(language)}</dd></div></dl>}
      {publishState === 'success' ? <p className="social-publish-result is-success" role="status">{copy.published}</p> : publishState === 'error' ? <p className="social-publish-result is-error" role="alert">{copy.failed}</p> : <div className="social-publish-actions"><button type="button" className="outline-button" onClick={closeDialog}>{copy.cancel}</button><button type="button" className="primary-button" disabled={publishState === 'sending'} onClick={publish}>{publishState === 'sending' ? copy.publishing : copy.publish}</button></div>}
    </dialog>
  </section>
}
