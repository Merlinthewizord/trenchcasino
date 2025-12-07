// src/sections/Header.tsx
import {
  GambaUi,
  TokenValue,
  useCurrentPool,
  useGambaPlatformContext,
  useUserBalance,
} from 'gamba-react-ui-v2'
import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { Modal } from '../components/Modal'
import LeaderboardsModal from '../sections/LeaderBoard/LeaderboardsModal'
import { PLATFORM_JACKPOT_FEE, PLATFORM_CREATOR_ADDRESS } from '../constants'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useTokenMarketData } from '../hooks/useTokenMarketData'
import TokenSelect from './TokenSelect'
import { UserButton } from './UserButton'
import { ENABLE_LEADERBOARD } from '../constants'

const Bonus = styled.button`
  all: unset;
  cursor: pointer;
  color: #ffe42d;
  border-radius: 10px;
  padding: 2px 10px;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: bold;
  transition: background-color 0.2s;
  &:hover {
    background: white;
  }
`

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  background: #000000cc;
  backdrop-filter: blur(20px);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
`

const Logo = styled(NavLink)`
  height: 35px;
  margin: 0 15px;
  & > img {
    height: 120%;
  }
`

const MarketCapDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 5px 12px;
  background: linear-gradient(135deg, #ff6b3520 0%, #ff853520 100%);
  border-radius: 10px;
  border: 1px solid #ff6b3540;
  gap: 2px;

  @media (max-width: 800px) {
    display: none;
  }
`

const MarketCapLabel = styled.div`
  font-size: 10px;
  color: #ff6b35;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const MarketCapValue = styled.div`
  font-size: 14px;
  color: #ffffff;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
`

const PriceChange = styled.span<{ positive: boolean }>`
  font-size: 11px;
  color: ${props => props.positive ? '#1de87e' : '#ff4f4f'};
  font-weight: 600;
`

export default function Header() {
  const pool = useCurrentPool()
  const context = useGambaPlatformContext()
  const balance = useUserBalance()
  const isDesktop = useMediaQuery('lg')
  const { data: marketData, loading: marketLoading } = useTokenMarketData()
  const [showLeaderboard, setShowLeaderboard] = React.useState(false)
  const [bonusHelp, setBonusHelp] = React.useState(false)
  const [jackpotHelp, setJackpotHelp] = React.useState(false)

  const formatMarketCap = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`
    }
    return `$${value.toFixed(2)}`
  }

  return (
    <>
      {bonusHelp && (
        <Modal onClose={() => setBonusHelp(false)}>
          <h1>Divine Blessings ✨</h1>
          <p>
            Lord Fishnu has blessed you with <b>
              <TokenValue amount={balance.bonusBalance} />
            </b>{' '}
            worth of sacred plays. These divine blessings will be bestowed automatically when you
            play in the Church.
          </p>
          <p>Note that an offering fee is still required from your wallet for each play.</p>
        </Modal>
      )}

      {jackpotHelp && (
        <Modal onClose={() => setJackpotHelp(false)}>
          <h1>Sacred Treasure of Lord Fishnu 💰🐟</h1>
          <p style={{ fontWeight: 'bold' }}>
            The divine treasury holds <TokenValue amount={pool.jackpotBalance} /> in sacred
            offerings.
          </p>
          <p>
            Lord Fishnu's treasure grows with every wager placed by faithful followers. As the
            divine bounty increases, so does your chance of receiving Fishnu's ultimate blessing. Once a blessed one is chosen,
            the treasury resets and the cycle of fortune begins anew.
          </p>
          <p>
            You offer a maximum of{' '}
            {(PLATFORM_JACKPOT_FEE * 100).toLocaleString(undefined, { maximumFractionDigits: 4 })}
            % of each wager for a chance to receive Lord Fishnu's favor.
          </p>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {context.defaultJackpotFee === 0 ? 'DISABLED' : 'ENABLED'}
            <GambaUi.Switch
              checked={context.defaultJackpotFee > 0}
              onChange={(checked) =>
                context.setDefaultJackpotFee(checked ? PLATFORM_JACKPOT_FEE : 0)
              }
            />
          </label>
        </Modal>
      )}

      {ENABLE_LEADERBOARD && showLeaderboard && (
        <LeaderboardsModal
          creator={PLATFORM_CREATOR_ADDRESS.toBase58()}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      <StyledHeader>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Logo to="/">
            <img alt="Site logo" src="/FAKEMONEY.PNG" />
          </Logo>

          {marketData && !marketLoading && (
            <MarketCapDisplay>
              <MarketCapLabel>🐟 $SCF Market Cap</MarketCapLabel>
              <MarketCapValue>
                {formatMarketCap(marketData.marketCap)}
                {marketData.priceChange24h !== 0 && (
                  <PriceChange positive={marketData.priceChange24h > 0}>
                    {marketData.priceChange24h > 0 ? '↑' : '↓'}
                    {Math.abs(marketData.priceChange24h).toFixed(2)}%
                  </PriceChange>
                )}
              </MarketCapValue>
            </MarketCapDisplay>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {pool.jackpotBalance > 0 && (
            <Bonus onClick={() => setJackpotHelp(true)}>
              💰 <TokenValue amount={pool.jackpotBalance} />
            </Bonus>
          )}

          {balance.bonusBalance > 0 && (
            <Bonus onClick={() => setBonusHelp(true)}>
              ✨ <TokenValue amount={balance.bonusBalance} />
            </Bonus>
          )}

          {/* Leaderboard shows only on desktop */}
          {isDesktop && (
            <GambaUi.Button onClick={() => setShowLeaderboard(true)}>
              Leaderboard
            </GambaUi.Button>
          )}

          <TokenSelect />
          <UserButton />
        </div>
      </StyledHeader>
    </>
  )
}
