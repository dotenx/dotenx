import create from 'zustand'
import { AnyJson } from '../../utils'

interface PageStates {
	states: States
	toggleState: (name: string) => void
	setState: (name: string, value: AnyJson) => void
}

type States = Record<string, AnyJson>

export const usePageStates = create<PageStates>()((set) => ({
	states: {},
	toggleState: (name) =>
		set((state) => ({ ...state, states: { ...state.states, [name]: !state.states[name] } })),
	setState: (name, value) =>
		set((state) => ({ ...state, states: { ...state.states, [name]: value } })),
}))
