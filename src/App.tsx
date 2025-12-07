import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import churchHtml from './churchbackground.html.txt?raw'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { GambaUi } from 'gamba-react-ui-v2'
import { useTransactionError } from 'gamba-react-v2'

import { Modal } from './components/Modal'
import { TOS_HTML, ENABLE_TROLLBOX } from './constants'
import { useToast } from './hooks/useToast'
import { useUserStore } from './hooks/useUserStore'

import Dashboard from './sections/Dashboard/Dashboard'
import Game from './sections/Game/Game'
import Header from './sections/Header'
import RecentPlays from './sections/RecentPlays/RecentPlays'
import Toasts from './sections/Toasts'
import TrollBox from './components/TrollBox'

import { MainWrapper, TosInner, TosWrapper } from './styles'

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function ScrollToTop() {
  const { pathname } = useLocation()
  React.useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

function ErrorHandler() {
  const walletModal = useWalletModal()
  const toast       = useToast()

  // React‑state not needed; let Toasts surface details
  useTransactionError((err) => {
    if (err.message === 'NOT_CONNECTED') {
      walletModal.setVisible(true)
    } else {
      toast({
        title: '❌ Transaction error',
        description: err.error?.errorMessage ?? err.message,
      })
    }
  })

  return null
}

function SimplePage({ title }: { title: string }) {
  return (
    <div style={{ padding: '80px 20px 20px' }}>
      <h1 style={{ textAlign: 'center' }}>{title}</h1>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* App                                                                        */
/* -------------------------------------------------------------------------- */

export default function App() {
  const newcomer = useUserStore((s) => s.newcomer)
  const set      = useUserStore((s) => s.set)
  const location = useLocation()
  const path = location.pathname
  const churchRoutes = ['/', '/scrolls', '/fishnu', '/confessional']
  const isChurch = churchRoutes.includes(path)
  const activeChurchPage = path === '/' ? 'landing' : path.slice(1)
  const churchHtmlWithActive = React.useMemo(() => {
    let html = churchHtml.replace('</nav>', '<a href="/backrooms" data-page="backrooms">Backrooms</a></nav>')
    html = html
      .replace("<a href=\"#\" onclick=\"navigateTo('landing')\"", '<a href="/"')
      .replace("<a href=\"#\" onclick=\"navigateTo('scrolls')\"", '<a href="/scrolls"')
      .replace("<a href=\"#\" onclick=\"navigateTo('fishnu')\"", '<a href="/fishnu"')
      .replace("<a href=\"#\" onclick=\"navigateTo('confessional')\"", '<a href="/confessional"')
    if (activeChurchPage !== 'landing') {
      html = html.replace('section id="landing" class="page active"', 'section id="landing" class="page"')
    }
    if (activeChurchPage && activeChurchPage !== 'landing') {
      html = html.replace(`section id="${activeChurchPage}" class="page"`, `section id="${activeChurchPage}" class="page active"`)
    }
    return html
  }, [activeChurchPage])

  return (
    <>
      {/* onboarding / ToS */}
      {newcomer && (
        <Modal>
          <h1>Welcome to the Church of the Smoking Chicken Fish 🐟🔥</h1>
          <TosWrapper>
            <TosInner dangerouslySetInnerHTML={{ __html: TOS_HTML }} />
          </TosWrapper>
          <p>By entering Lord Fishnu's domain, you accept these divine terms and embrace the wisdom of the Smoking Chicken Fish.</p>
          <GambaUi.Button main onClick={() => set({ newcomer: false })}>
            Accept Lord Fishnu's Blessings
          </GambaUi.Button>
        </Modal>
      )}


      {isChurch ? (
        <div dangerouslySetInnerHTML={{ __html: churchHtmlWithActive }} />
      ) : (
        <>
          <ScrollToTop />
          <ErrorHandler />
          <Header />
          <Toasts />
          <MainWrapper>
            <Routes>
              <Route path="/backrooms" element={<Dashboard />} />
              <Route path="/:gameId"   element={<Game />} />
            </Routes>
            <h2 style={{ textAlign: 'center' }}>Recent Divine Revelations</h2>
            <RecentPlays />
          </MainWrapper>
          {ENABLE_TROLLBOX && <TrollBox />}
        </>
      )}
    </>
  )
}
