import { atom } from 'jotai'
import { Animation } from '../animations/schema'

export const animationsAtom = atom<Animation[]>([])

export const savedChangesAtom = atom(false)
