import { ChainId } from 'niftex-uni-sdk'
import MULTICALL_ABI from './abi.json'

// !NOTE changed
const MULTICALL_NETWORKS: { [chainId: number]: string } = {
  [ChainId.MAINNET]: '0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441',
  [ChainId.ROPSTEN]: '0x53C43764255c17BD724F74c4eF150724AC50a3ed',
  [ChainId.KOVAN]: '0x2cc8688C5f75E365aaEEb4ea8D6a480405A48D2A',
  [ChainId.RINKEBY]: '0x42Ad527de7d4e9d9d011aC45B31D8551f8Fe9821',
  [ChainId.GÖRLI]: '0x77dCa2C955b15e9dE4dbBCf1246B4B85b651e50e',
	[80001]: '0x3Ce721cfF1BD68E4DC49976Fa27Ec96798BbbD19',
	[137]: '0xb492A363fC9c7a4ECD048e7900af3C13F68C132a'
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
