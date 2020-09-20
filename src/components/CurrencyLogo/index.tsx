import { Currency, ETHER, Token } from 'niftex-uni-sdk'
import React, { useMemo } from 'react'
import styled from 'styled-components'

// import EthereumLogo from '../../assets/images/ethereum-logo.png'
import useHttpLocations from '../../hooks/useHttpLocations'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import Logo from '../Logo'

const getTokenLogoURL = (address: string) => {
	// !NOTE changed ETH -> MATIC
	if (address.toLowerCase() === '0x714550C2C1Ea08688607D86ed8EeF4f5E4F22323'.toLowerCase()) {
		return 'https://etherscan.io/token/images/weth_28.png';
	}
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`
}

// const StyledEthereumLogo = styled.img<{ size: string }>`
//   width: ${({ size }) => size};
//   height: ${({ size }) => size};
//   box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
//   border-radius: 24px;
// `

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
`

export default function CurrencyLogo({
  currency,
  size = '24px',
  style
}: {
  currency?: Currency
  size?: string
  style?: React.CSSProperties
}) {
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)

  const srcs: string[] = useMemo(() => {
		// !NOTE changed ETH -> MATIC
    if (currency === ETHER) return [getTokenLogoURL('0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0')]

    if (currency instanceof Token) {
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, getTokenLogoURL(currency.address)]
      }

      return [getTokenLogoURL(currency.address)]
    }
    return []
  }, [currency, uriLocations])

  // if (currency === ETHER) {
  //   return <StyledEthereumLogo src={EthereumLogo} size={size} style={style} />
  // }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />
}
