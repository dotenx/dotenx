import { atom } from 'jotai'
import { Automation, AutomationData } from '../../api'
import { initialElements } from '../flow'
import { Modals } from '../hooks'

export const selectedExecutionAtom = atom<number | undefined>(undefined)
export const listenAtom = atom(0)
export const selectedPipelineDataAtom = atom<Automation | undefined>(undefined)
export const selectedPipelineAtom = atom<AutomationData | undefined>(undefined)
export const flowAtom = atom(initialElements)
export const modalAtom = atom<{ isOpen: boolean; kind: Modals | null; data: unknown | null }>({
	isOpen: false,
	kind: null,
	data: null,
})
