import { createReducer } from '@reduxjs/toolkit'
import { getVersionUpgrade, VersionUpgrade } from '@uniswap/token-lists'
import { TokenList } from '@uniswap/token-lists/dist/types'
import { DEFAULT_LIST_OF_LISTS, DEFAULT_TOKEN_LIST_URL } from '../../constants/lists'
import { updateVersion } from '../global/actions'
import { acceptListUpdate, addList, fetchTokenList, removeList, selectList } from './actions'
// !NOTE changed
// import UNISWAP_DEFAULT_LIST from '@uniswap/default-token-list'
// console.log(UNISWAP_DEFAULT_LIST)
const UNISWAP_DEFAULT_LIST = {
	keywords: ["uniswap", "default"],
	logoURI: "ipfs://QmNa8mQkrNKp1WEEeGjFezDmDeodkWRevGFN8JCV7b4Xir",
	name: "Uniswap Default List",
	tags: {},
	timestamp: "2020-09-17T00:12:46.685Z",
	tokens: [
		{
			name: "COOL",
			address: "0x5bd317b32ee4ee1c42043a5d608ac7082575d407",
			symbol: "COOL",
			logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/…m/assets/0xB6eD7644C69416d67B522e20bC294A9a9B405B31/logo.png",
			chainId: 80001,
			decimals: 18
		}
	],
	version: {
		major: 1,
		minor: 1,
		patch: 0
	}
}

export interface ListsState {
  readonly byUrl: {
    readonly [url: string]: {
      readonly current: TokenList | null
      readonly pendingUpdate: TokenList | null
      readonly loadingRequestId: string | null
      readonly error: string | null
    }
  }
  // this contains the default list of lists from the last time the updateVersion was called, i.e. the app was reloaded
  readonly lastInitializedDefaultListOfLists?: string[]
  readonly selectedListUrl: string | undefined
}

const NEW_LIST_STATE: ListsState['byUrl'][string] = {
  error: null,
  current: null,
  loadingRequestId: null,
  pendingUpdate: null
}

type Mutable<T> = { -readonly [P in keyof T]: T[P] extends ReadonlyArray<infer U> ? U[] : T[P] }

const initialState: ListsState = {
  lastInitializedDefaultListOfLists: DEFAULT_LIST_OF_LISTS,
  byUrl: {
    ...DEFAULT_LIST_OF_LISTS.reduce<Mutable<ListsState['byUrl']>>((memo, listUrl) => {
      memo[listUrl] = NEW_LIST_STATE
      return memo
    }, {}),
    [DEFAULT_TOKEN_LIST_URL]: {
      error: null,
      current: UNISWAP_DEFAULT_LIST,
      loadingRequestId: null,
      pendingUpdate: null
    }
  },
	// !NOTE changed
  selectedListUrl: 'https://umaproject.org/uma.tokenlist.json'
}

export default createReducer(initialState, builder =>
  builder
    .addCase(fetchTokenList.pending, (state, { payload: { requestId, url } }) => {
      state.byUrl[url] = {
        current: null,
        pendingUpdate: null,
        ...state.byUrl[url],
        loadingRequestId: requestId,
        error: null
      }
    })
    .addCase(fetchTokenList.fulfilled, (state, { payload: { requestId, tokenList, url } }) => {
      const current = state.byUrl[url]?.current
      const loadingRequestId = state.byUrl[url]?.loadingRequestId

      // no-op if update does nothing
      if (current) {
        const upgradeType = getVersionUpgrade(current.version, tokenList.version)
        if (upgradeType === VersionUpgrade.NONE) return
        if (loadingRequestId === null || loadingRequestId === requestId) {
          state.byUrl[url] = {
            ...state.byUrl[url],
            loadingRequestId: null,
            error: null,
            current: current,
            pendingUpdate: tokenList
          }
        }
      } else {
        state.byUrl[url] = {
          ...state.byUrl[url],
          loadingRequestId: null,
          error: null,
          current: tokenList,
          pendingUpdate: null
        }
      }
    })
    .addCase(fetchTokenList.rejected, (state, { payload: { url, requestId, errorMessage } }) => {
      if (state.byUrl[url]?.loadingRequestId !== requestId) {
        // no-op since it's not the latest request
        return
      }

      state.byUrl[url] = {
        ...state.byUrl[url],
        loadingRequestId: null,
        error: errorMessage,
        current: null,
        pendingUpdate: null
      }
    })
    .addCase(selectList, (state, { payload: url }) => {
      state.selectedListUrl = 'https://umaproject.org/uma.tokenlist.json'
      // automatically adds list
      if (!state.byUrl[url]) {
        state.byUrl[url] = NEW_LIST_STATE
      }
    })
    .addCase(addList, (state, { payload: url }) => {
      if (!state.byUrl[url]) {
        state.byUrl[url] = NEW_LIST_STATE
      }
    })
    .addCase(removeList, (state, { payload: url }) => {
      if (state.byUrl[url]) {
        delete state.byUrl[url]
      }
      if (state.selectedListUrl === url) {
        state.selectedListUrl = 'https://umaproject.org/uma.tokenlist.json'
      }
    })
    .addCase(acceptListUpdate, (state, { payload: url }) => {
      if (!state.byUrl[url]?.pendingUpdate) {
        throw new Error('accept list update called without pending update')
      }
      state.byUrl[url] = {
        ...state.byUrl[url],
        pendingUpdate: null,
        current: state.byUrl[url].pendingUpdate
      }
    })
    .addCase(updateVersion, state => {
      // state loaded from localStorage, but new lists have never been initialized
      if (!state.lastInitializedDefaultListOfLists) {
        state.byUrl = initialState.byUrl
        state.selectedListUrl = 'https://umaproject.org/uma.tokenlist.json'
      } else if (state.lastInitializedDefaultListOfLists) {
        const lastInitializedSet = state.lastInitializedDefaultListOfLists.reduce<Set<string>>(
          (s, l) => s.add(l),
          new Set()
        )
        const newListOfListsSet = DEFAULT_LIST_OF_LISTS.reduce<Set<string>>((s, l) => s.add(l), new Set())

        DEFAULT_LIST_OF_LISTS.forEach(listUrl => {
          if (!lastInitializedSet.has(listUrl)) {
            state.byUrl[listUrl] = NEW_LIST_STATE
          }
        })

        state.lastInitializedDefaultListOfLists.forEach(listUrl => {
          if (!newListOfListsSet.has(listUrl)) {
            delete state.byUrl[listUrl]
          }
        })
      }

      state.lastInitializedDefaultListOfLists = DEFAULT_LIST_OF_LISTS
    })
)
