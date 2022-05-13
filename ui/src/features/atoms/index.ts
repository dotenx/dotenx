import { atom } from 'jotai'
import { Automation, AutomationData } from '../../api'
import { initialElements } from '../flow'
import { Modals } from '../hooks'

export const listenAtom = atom(0)
export const selectedAutomationDataAtom = atom<Automation | undefined>(undefined)
export const selectedAutomationAtom = atom<AutomationData | undefined>(undefined)
export const flowAtom = atom(initialElements)
export const modalAtom = atom<{ isOpen: boolean; kind: Modals | null; data: unknown | null }>({
	isOpen: false,
	kind: null,
	data: null,
})
