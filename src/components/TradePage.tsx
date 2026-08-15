import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Language } from '../data'
import { assertLocalizationTree, completeLocalizationTree, inline } from '../i18n'
import LanguageSelector from './LanguageSelector'
import { DemoCartLine, DemoProduct, DemoReceipt, DemoService, demoProducts, demoServices, formatDemoPrice, tx } from '../commerce-data'
import BrandLockup from './BrandLockup'
import './trade-page.css'

completeLocalizationTree(demoProducts)
completeLocalizationTree(demoServices)
assertLocalizationTree(demoProducts, 'demo products')
assertLocalizationTree(demoServices, 'demo services')

type Props = { language: Language; onChangeLanguage: (language: Language) => void; onExit: () => void; onOpenGuide: () => void }
type Route = { view: 'home' | 'product' | 'cart' | 'checkout' | 'receipt' | 'order' | 'operator'; itemId?: string }

const routeFromHash = (hash: string): Route => {
  const path = hash.replace(/^#/, '').split('?')[0]
  if (path === 'market/operator' || path === 'market-operator') return { view: 'operator' }
  if (path === 'market/order') return { view: 'order' }
  if (path === 'market/cart') return { view: 'cart' }
  if (path === 'market/checkout') return { view: 'checkout' }
  if (path === 'market/receipt') return { view: 'receipt' }
  const product = path.match(/^market\/product\/([^/]+)$/)
  return product ? { view: 'product', itemId: decodeURIComponent(product[1]) } : { view: 'home' }
}

const marketPath = (path = '') => { window.location.hash = `market${path}` }
const receiptReference = (kind: 'ORDER' | 'PROJECT') => `${kind}-DEMO-${Date.now().toString(36).toUpperCase().slice(-6)}`

export default function TradePage({ language, onChangeLanguage, onExit, onOpenGuide }: Props) {
  const [route, setRoute] = useState<Route>(() => routeFromHash(window.location.hash))
  const [cart, setCart] = useState<DemoCartLine[]>([])
  const [receipt, setReceipt] = useState<DemoReceipt | null>(null)
  const [service, setService] = useState<DemoService | null>(null)
  const [recommendations, setRecommendations] = useState(() => demoProducts.filter((entry) => entry.collection === 'culture').slice(0, 4).map((entry) => entry.id))
  const [toast, setToast] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [headerTone, setHeaderTone] = useState<'split' | 'light' | 'dark'>('split')
  const t = (en: string, zh: string) => inline(language, en, zh)

  useEffect(() => {
    const sync = () => { setRoute(routeFromHash(window.location.hash)); window.scrollTo({ top: 0, behavior: 'auto' }) }
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>('#market-main h1')
      if (!heading) return
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [route.view, route.itemId])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 3600)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (route.view !== 'home') {
      setHeaderTone('dark')
      return
    }

    const updateHeaderTone = () => {
      const sampleY = 38
      const activeSection = Array.from(document.querySelectorAll<HTMLElement>('#market-main > section'))
        .find((section) => {
          const rect = section.getBoundingClientRect()
          return rect.top <= sampleY && rect.bottom > sampleY
        })

      if (!activeSection || activeSection.classList.contains('market-hero')) {
        setHeaderTone('split')
      } else if (activeSection.classList.contains('demo-services') || activeSection.classList.contains('demo-ip')) {
        setHeaderTone('light')
      } else {
        setHeaderTone('dark')
      }
    }

    updateHeaderTone()
    window.addEventListener('scroll', updateHeaderTone, { passive: true })
    window.addEventListener('resize', updateHeaderTone)
    return () => {
      window.removeEventListener('scroll', updateHeaderTone)
      window.removeEventListener('resize', updateHeaderTone)
    }
  }, [route.view])

  const product = useMemo(() => demoProducts.find((entry) => entry.id === route.itemId), [route.itemId])
  const cartItems = useMemo(() => cart.flatMap((line) => {
    const entry = demoProducts.find((candidate) => candidate.id === line.productId)
    return entry ? [{ ...line, product: entry }] : []
  }), [cart])
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0)
  const cartTotal = cartItems.reduce((sum, line) => sum + line.quantity * line.product.price, 0)
  const recommendationItems = recommendations.map((id) => demoProducts.find((entry) => entry.id === id)).filter((entry): entry is DemoProduct => Boolean(entry))

  const openHomeSection = (id: string) => {
    if (route.view !== 'home') marketPath()
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }), 0)
  }
  const addToCart = (entry: DemoProduct) => {
    if (!entry.stock) { setToast(t('This demo item is currently unavailable.', '该演示商品当前不可用。')); return }
    setCart((lines) => {
      const existing = lines.find((line) => line.productId === entry.id)
      if (!existing) return [...lines, { productId: entry.id, quantity: 1 }]
      if (existing.quantity >= entry.stock) return lines
      return lines.map((line) => line.productId === entry.id ? { ...line, quantity: line.quantity + 1 } : line)
    })
    setToast(t(`${tx(language, entry.title)} added to the demo cart.`, `已将${tx(language, entry.title)}加入演示购物车。`))
  }
  const updateQuantity = (id: string, quantity: number) => {
    const entry = demoProducts.find((candidate) => candidate.id === id)
    if (!entry || quantity <= 0) { setCart((lines) => lines.filter((line) => line.productId !== id)); return }
    setCart((lines) => lines.map((line) => line.productId === id ? { ...line, quantity: Math.min(quantity, entry.stock) } : line))
  }
  const refreshRecommendations = () => {
    const cartIds = new Set(cart.map((line) => line.productId))
    const pool = demoProducts.filter((entry) => !cartIds.has(entry.id))
    const choices = (pool.length ? pool : demoProducts).slice().sort(() => Math.random() - .5).slice(0, 4).map((entry) => entry.id)
    setRecommendations(choices)
    setToast(t('Your demo recommendations were refreshed.', '演示猜你喜欢已刷新。'))
  }
  const share = async (title: string) => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title, text: t('Explore this QIONGVERSE demo-market item.', '查看这个琼境演示商城商品。'), url })
      else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(url); setToast(t('Demo link copied.', '演示链接已复制。')) }
      else setToast(t('Sharing is unavailable in this browser.', '当前浏览器无法使用分享功能。'))
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setToast(t('The link was not shared. Try again in a supported browser.', '链接未能分享，请在支持的浏览器中重试。'))
    }
  }
  const completeCheckout = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!cartItems.length) { marketPath('/cart'); return }
    setReceipt({ reference: receiptReference('ORDER'), kind: 'order', createdAt: new Date().toISOString(), productIds: cart.map((line) => line.productId) })
    setCart([])
    marketPath('/receipt')
  }
  const createServiceReceipt = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!service) return
    const data = new FormData(event.currentTarget)
    setReceipt({ reference: receiptReference('PROJECT'), kind: 'service', createdAt: new Date().toISOString(), serviceId: service.id, projectDirection: String(data.get('direction') || '').trim() })
    marketPath('/receipt')
  }

  const header = <header className={`market-header market-header--${headerTone}`}><BrandLockup href="#top" /><nav aria-label={t('Demo market navigation', '演示商城导航')}><button type="button" onClick={() => openHomeSection('market-services')}>{t('Services', '服务')}</button><button type="button" onClick={() => openHomeSection('market-culture')}>{t('Culture shop', '文化商店')}</button><button type="button" onClick={() => openHomeSection('market-ip')}>{t('Luoyin IP', '螺音 IP')}</button></nav><div className="market-header-actions"><button type="button" onClick={() => marketPath('/cart')} aria-label={t(`Open demo cart with ${cartCount} items`, `打开含${cartCount}件商品的演示购物车`)}>{t('Cart', '购物车')} <b>{cartCount}</b></button><LanguageSelector language={language} onChange={onChangeLanguage} /><button type="button" onClick={onOpenGuide}>{t('Ask Luoyin', '询问螺音')}</button><a className="market-return" href="#top" onClick={onExit} aria-label={t('Return to the QIONGVERSE home page', '返回琼境主页')}>{t('Return home', '返回主页')} <span aria-hidden="true">&#8599;</span></a></div></header>
  const demoNotice = <p className="market-demo-notice" role="note">{t('DEMO TRANSACTION: no money is collected, and no personal, payment or order data is stored.', '演示交易：不会收取资金，也不会存储个人、支付或订单数据。')}</p>
  const productCard = (entry: DemoProduct) => <article className="demo-product-card" key={entry.id}><div className="demo-product-image"><img src={entry.image} alt={tx(language, entry.imageAlt)} /><span>{t('PROJECT DEMO', '项目演示')}</span></div><div className="demo-product-copy"><p className="market-kicker">{tx(language, entry.category)}</p><h3>{tx(language, entry.title)}</h3><p>{tx(language, entry.summary)}</p><div className="demo-product-meta"><strong>{formatDemoPrice(language, entry.price)}</strong><span>{t(`${entry.stock} demo units`, `${entry.stock}件演示库存`)}</span></div><div className="demo-product-actions"><button className="market-card-action" type="button" onClick={() => marketPath(`/product/${encodeURIComponent(entry.id)}`)}>{t('View', '查看')}</button><button className="market-icon-action" type="button" onClick={() => addToCart(entry)} aria-label={t(`Add ${tx(language, entry.title)} to demo cart`, `将${tx(language, entry.title)}加入演示购物车`)}>+</button><button className="market-icon-action" type="button" onClick={() => void share(tx(language, entry.title))} aria-label={t(`Share ${tx(language, entry.title)}`, `分享${tx(language, entry.title)}`)}>...</button></div></div></article>

  if (route.view === 'operator') return <div className="market-page"><a className="market-skip" href="#market-main">{t('Skip to main content', '跳至主要内容')}</a>{header}<main id="market-main" className="market-simple"><p className="market-kicker">OPERATOR / REAL COMMERCE RESERVED</p><h1>{t('Operator access remains separate from this demo.', '运营权限与本演示商城保持独立。')}</h1><p>{t('This local demo never provides operator privileges or changes the real commerce system.', '本地演示不会提供运营权限，也不会更改真实商业系统。')}</p>{demoNotice}</main></div>
  if (route.view === 'order') return <div className="market-page"><a className="market-skip" href="#market-main">{t('Skip to main content', '跳至主要内容')}</a>{header}<main id="market-main" className="market-simple"><p className="market-kicker">ORDER ACCESS / DEMO BOUNDARY</p><h1>{t('Demo orders exist only in this open session.', '演示订单仅在当前打开的会话中存在。')}</h1><p>{t('There is no email, order code, saved order record or real fulfilment in this demo mode.', '演示模式不发送邮件、不生成订单验证码、不保存订单记录，也不产生真实履约。')}</p>{demoNotice}<button className="market-action" type="button" onClick={() => marketPath()}>{t('Return to market', '返回商城')}</button></main></div>
  if (route.view === 'product' && product) return <div className="market-page"><a className="market-skip" href="#market-main">{t('Skip to main content', '跳至主要内容')}</a>{header}<main id="market-main" className="market-detail"><button className="market-back" type="button" onClick={() => marketPath()}>{t('Back to market', '返回商城')}</button><section className="demo-detail"><div><p className="market-kicker">{tx(language, product.category)} / PROJECT DEMO</p><h1>{tx(language, product.title)}</h1><p>{tx(language, product.summary)}</p><p className="demo-detail-price">{formatDemoPrice(language, product.price)} <span>{t(`${product.stock} demo units available`, `${product.stock}件演示库存可用`)}</span></p>{demoNotice}<div className="demo-detail-actions"><button className="market-action" type="button" onClick={() => addToCart(product)}>{t('Add to demo cart', '加入演示购物车')}</button><button className="market-text-button" type="button" onClick={() => void share(tx(language, product.title))}>{t('Share item', '分享商品')}</button></div></div><figure><img src={product.image} alt={tx(language, product.imageAlt)} /><figcaption>{t('Project demo visual. It is not a merchant product photo or proof of availability.', '项目演示图。它不是商家商品照片，也不是可售凭证。')}</figcaption></figure></section>{product.story && <section className="demo-story"><figure><img src={product.story.src} alt={tx(language, product.story.alt)} /></figure><div><p className="market-kicker">STORY CONTEXT</p><h2>{t('A project study behind the product story.', '商品故事背后的项目研究。')}</h2><p>{t('This 3D study provides cultural and spatial context only. It does not describe a manufactured or shippable item.', '此 3D 研究仅提供文化与空间语境，不描述真实生产或可发货商品。')}</p></div></section>}</main></div>
  if (route.view === 'cart') return <div className="market-page"><a className="market-skip" href="#market-main">{t('Skip to main content', '跳至主要内容')}</a>{header}<main id="market-main" className="market-cart"><p className="market-kicker">CART / SESSION ONLY</p><h1>{t('Your demo cart', '你的演示购物车')}</h1>{demoNotice}{cartItems.length ? <><div className="demo-cart-lines">{cartItems.map((line) => <article key={line.productId}><img src={line.product.image} alt={tx(language, line.product.imageAlt)} /><div><h2>{tx(language, line.product.title)}</h2><p>{formatDemoPrice(language, line.product.price)}</p><div className="demo-quantity"><button type="button" onClick={() => updateQuantity(line.productId, line.quantity - 1)} aria-label={t(`Remove one ${tx(language, line.product.title)}`, `减少一件${tx(language, line.product.title)}`)}>-</button><span aria-label={t('Quantity', '数量')}>{line.quantity}</span><button type="button" onClick={() => updateQuantity(line.productId, line.quantity + 1)} disabled={line.quantity >= line.product.stock} aria-label={t(`Add one ${tx(language, line.product.title)}`, `增加一件${tx(language, line.product.title)}`)}>+</button><button className="market-text-button" type="button" onClick={() => updateQuantity(line.productId, 0)}>{t('Remove', '移除')}</button></div></div><strong>{formatDemoPrice(language, line.product.price * line.quantity)}</strong></article>)}</div><div className="demo-cart-summary"><p>{t('Demo subtotal', '演示小计')} <strong>{formatDemoPrice(language, cartTotal)}</strong></p><button className="market-action" type="button" onClick={() => marketPath('/checkout')}>{t('Continue to demo payment', '继续演示付款')}</button></div></> : <section className="market-empty"><h2>{t('Your demo cart is empty.', '你的演示购物车为空。')}</h2><p>{t('Explore a cultural concept or Luoyin IP item to test the transaction flow.', '浏览文化概念商品或螺音 IP 周边，体验完整交易流程。')}</p><button className="market-action" type="button" onClick={() => marketPath()}>{t('Explore the market', '浏览商城')}</button></section>}</main></div>
  if (route.view === 'checkout') return <div className="market-page"><a className="market-skip" href="#market-main">{t('Skip to main content', '跳至主要内容')}</a>{header}<main id="market-main" className="market-checkout"><p className="market-kicker">CHECKOUT / DEMO ONLY</p><h1>{t('Simulate payment', '模拟付款')}</h1>{demoNotice}{cartItems.length ? <form onSubmit={completeCheckout}><section className="demo-checkout-summary"><h2>{t('Order summary', '订单摘要')}</h2>{cartItems.map((line) => <p key={line.productId}><span>{tx(language, line.product.title)} x {line.quantity}</span><strong>{formatDemoPrice(language, line.product.price * line.quantity)}</strong></p>)}<p className="demo-checkout-total"><span>{t('Demo total', '演示总计')}</span><strong>{formatDemoPrice(language, cartTotal)}</strong></p></section><fieldset><legend>{t('Demo delivery details', '演示配送信息')}</legend><label>{t('Name', '姓名')}<input name="name" autoComplete="name" required /></label><label>{t('Email', '邮箱')}<input name="email" type="email" autoComplete="email" required /></label><label>{t('Destination', '目的地')}<input name="destination" autoComplete="country-name" required /></label><p>{t('These fields validate the interface only and are discarded when the page changes.', '这些字段仅用于验证界面，并会在页面变更时丢弃。')}</p></fieldset><fieldset><legend>{t('Demo payment method', '演示支付方式')}</legend><label className="demo-radio"><input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /> {t('Card payment simulation', '银行卡支付模拟')}</label><label className="demo-radio"><input type="radio" name="payment" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} /> {t('Wallet payment simulation', '钱包支付模拟')}</label></fieldset><button className="market-action" type="submit">{t('Complete demo payment', '完成演示付款')}</button><button className="market-text-button" type="button" onClick={() => marketPath('/cart')}>{t('Return to cart', '返回购物车')}</button></form> : <section className="market-empty"><h2>{t('There is nothing to simulate yet.', '还没有可模拟付款的商品。')}</h2><button className="market-action" type="button" onClick={() => marketPath()}>{t('Return to market', '返回商城')}</button></section>}</main></div>
  if (route.view === 'receipt') {
    const receiptService = receipt?.serviceId ? demoServices.find((entry) => entry.id === receipt.serviceId) : undefined
    const receiptProducts = receipt?.productIds ? receipt.productIds.map((id) => demoProducts.find((entry) => entry.id === id)).filter((entry): entry is DemoProduct => Boolean(entry)) : []
    return <div className="market-page"><a className="market-skip" href="#market-main">{t('Skip to main content', '跳至主要内容')}</a>{header}<main id="market-main" className="market-receipt">{receipt ? <><p className="market-kicker">{receipt.kind === 'order' ? 'DEMO ORDER RECEIPT' : 'DEMO PROJECT RECEIPT'}</p><h1>{receipt.kind === 'order' ? t('Demo payment complete.', '演示付款已完成。') : t('Project demo created.', '项目演示已创建。')}</h1><p className="demo-reference">{t('Reference', '参考编号')}: <code>{receipt.reference}</code></p>{demoNotice}{receipt.kind === 'order' ? <section><h2>{t('Demo order items', '演示订单商品')}</h2>{receiptProducts.map((entry) => <p key={entry.id}>{tx(language, entry.title)}</p>)}<p>{t('No payment settled, order saved, email sent or shipment created.', '未结算资金、未保存订单、未发送邮件，也未创建发货任务。')}</p></section> : <section><h2>{tx(language, receiptService?.title || { en: 'Selected service', zh: '已选服务' })}</h2><p>{receipt.projectDirection || t('No project direction was provided.', '未提供项目方向。')}</p><p>{t('This is not a quote, agreement, appointment or promise of human follow-up.', '这不是报价、协议、预约或真人跟进承诺。')}</p></section>}<div className="demo-detail-actions"><button className="market-action" type="button" onClick={() => marketPath()}>{t('Continue exploring', '继续浏览')}</button><button className="market-text-button" type="button" onClick={() => void share(receipt.reference)}>{t('Share demo receipt', '分享演示回执')}</button></div></> : <section className="market-empty"><p className="market-kicker">RECEIPT EXPIRED</p><h1>{t('This demo receipt is no longer available.', '此演示回执已失效。')}</h1><p>{t('Demo receipts exist only while this page remains open and are never stored.', '演示回执仅在当前页面打开期间存在，绝不会被存储。')}</p><button className="market-action" type="button" onClick={() => marketPath()}>{t('Return to market', '返回商城')}</button></section>}</main></div>
  }

  return <div className="market-page"><a className="market-skip" href="#market-main">{t('Skip to main content', '跳至主要内容')}</a>{header}<main id="market-main"><section className="market-hero demo-market-hero"><div className="market-hero-copy"><p className="market-kicker">QIONGVERSE DEMO MARKET / HAINAN</p><h1>{t('Three ways to turn a cultural story into a commercial journey.', '用三条路径，让文化故事成为商业旅程。')}</h1><p>{t('Explore a virtual-service brief, a Hainan-inspired culture shop and the Luoyin IP collection in one local, no-money transaction demo.', '在同一场本地无资金交易演示中，浏览虚拟服务项目、海南灵感文化商店与螺音 IP 系列。')}</p>{demoNotice}<div><button className="market-action" type="button" onClick={() => openHomeSection('market-services')}>{t('Start with services', '从服务开始')}</button><button className="market-text-button" type="button" onClick={() => openHomeSection('market-culture')}>{t('Explore shop', '浏览商店')}</button></div></div><figure><img src="/assets/zones/tropical/zone-tropical-wide.webp" alt={t('Project-supplied Hainan coastal exhibition context', '项目提供的海南海岸展览语境图')} /><figcaption>{t('Project context image only. The commercial interactions on this page are a local demo.', '仅为项目语境图。本页商业交互均为本地演示。')}</figcaption></figure></section><section id="market-services" className="demo-services" aria-labelledby="services-title"><div className="market-section-heading"><div><p className="market-kicker">PATH 01 / BUSINESS SERVICES</p><h2 id="services-title">{t('Build the next cultural destination.', '构建下一个文化目的地。')}</h2></div><p>{t('For museums, tourism venues, merchants and enterprises. Select a service to simulate a project brief, not a contract.', '面向博物馆、文旅场馆、商家与企业。选择服务以模拟项目需求，不代表合同。')}</p></div><div className="demo-service-grid">{demoServices.map((entry) => <article className="demo-service-card" key={entry.id}><p className="market-kicker">PROJECT DEMO</p><h3>{tx(language, entry.title)}</h3><p>{tx(language, entry.summary)}</p><ul>{entry.deliverables.map((item) => <li key={item.en}>{tx(language, item)}</li>)}</ul><button className="market-card-action" type="button" onClick={() => setService(entry)}>{t('Configure demo brief', '配置演示需求')}</button></article>)}</div></section><section id="market-culture" className="demo-shop" aria-labelledby="culture-title"><div className="market-section-heading"><div><p className="market-kicker">PATH 02 / CULTURE SHOP</p><h2 id="culture-title">{t('Objects for carrying a Hainan-inspired story.', '携带海南灵感故事的物件。')}</h2></div><p>{t('All prices, stock and checkout outcomes are project-demo data. Images are supplied placeholders, not merchant listing proof.', '所有价格、库存和结账结果均为项目演示数据。图像为提供的占位素材，而非商家上架凭证。')}</p></div><div className="demo-product-grid">{demoProducts.filter((entry) => entry.collection === 'culture').map(productCard)}</div></section><section id="market-ip" className="demo-ip" aria-labelledby="ip-title"><div className="market-section-heading"><div><p className="market-kicker">PATH 03 / LUOYIN IP</p><h2 id="ip-title">{t('Take the guide beyond the exhibition.', '让螺音走出展厅。')}</h2></div><p>{t('Project IP merchandise concepts for the QIONGVERSE story world. Availability is simulated only.', '为琼境故事世界设计的项目 IP 周边概念，仅模拟可售状态。')}</p></div><div className="demo-product-grid demo-ip-grid">{demoProducts.filter((entry) => entry.collection === 'ip').map(productCard)}</div></section><section className="demo-recommendations" aria-labelledby="recommendations-title"><div className="market-section-heading"><div><p className="market-kicker">REFRESH / YOU MAY ALSO LIKE</p><h2 id="recommendations-title">{t('Try another route through the collection.', '再走一条探索路线。')}</h2></div><button className="market-icon-button" type="button" onClick={refreshRecommendations} aria-label={t('Refresh demo recommendations', '刷新演示猜你喜欢')}>Refresh</button></div><div className="demo-product-grid demo-recommendation-grid">{recommendationItems.map(productCard)}</div></section></main><footer className="market-footer"><img src="/assets/brand/qiongverse-wordmark-en.svg" alt="HAINAN QIONGVERSE" /><p>{t('A local competition demo for commercial storytelling. It does not process real commerce.', '用于商业叙事的本地竞赛演示，不处理真实交易。')}</p><button type="button" onClick={() => marketPath('/cart')}>{t('Open demo cart', '打开演示购物车')}</button></footer>{service && <div className="demo-service-modal" role="dialog" aria-modal="true" aria-labelledby="service-dialog-title"><form className="demo-service-sheet" onSubmit={createServiceReceipt}><div className="demo-service-modal-head"><div><p className="market-kicker">LOCAL PROJECT DEMO</p><h2 id="service-dialog-title">{tx(language, service.title)}</h2></div><button type="button" className="market-icon-action" onClick={() => setService(null)} aria-label={t('Close service configuration', '关闭服务配置')}>x</button></div><p>{t('This form creates a local project-demo receipt only. It sends nothing and does not request human follow-up.', '此表单仅生成本地项目演示回执，不会发送信息，也不会请求真人跟进。')}</p><label>{t('Project direction', '项目方向')}<textarea name="direction" maxLength={360} required placeholder={t('Describe the visitor experience you want to demonstrate.', '描述希望演示的访客体验。')} /></label><button className="market-action" type="submit">{t('Create project demo', '生成项目演示')}</button></form></div>}{toast && <p className="market-toast" role="status" aria-live="polite">{toast}</p>}</div>
}
