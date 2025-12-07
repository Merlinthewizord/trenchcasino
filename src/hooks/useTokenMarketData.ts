import { useEffect, useState } from 'react'

interface TokenMarketData {
  marketCap: number
  price: number
  priceChange24h: number
  volume24h: number
  liquidity: number
}

const SCF_TOKEN_ADDRESS = 'GPqgnQ5xD8oPGT2aN3bZ467EHmDbEt7aRhJuUQGLpump'

export function useTokenMarketData() {
  const [data, setData] = useState<TokenMarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${SCF_TOKEN_ADDRESS}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch market data')
        }

        const json = await response.json()

        if (json.pairs && json.pairs.length > 0) {
          // Get the pair with highest liquidity
          const pair = json.pairs.reduce((prev: any, current: any) =>
            (prev.liquidity?.usd || 0) > (current.liquidity?.usd || 0) ? prev : current
          )

          setData({
            marketCap: pair.marketCap || 0,
            price: parseFloat(pair.priceUsd) || 0,
            priceChange24h: parseFloat(pair.priceChange?.h24) || 0,
            volume24h: pair.volume?.h24 || 0,
            liquidity: pair.liquidity?.usd || 0,
          })
          setError(null)
        } else {
          setData(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchMarketData()

    // Poll every 30 seconds
    const interval = setInterval(fetchMarketData, 30000)

    return () => clearInterval(interval)
  }, [])

  return { data, loading, error }
}
