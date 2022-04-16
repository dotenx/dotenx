import { useAtom } from 'jotai'
import { modalAtom } from '../atoms'

export enum Modals {
	NodeSettings = 'node-settings',
	EdgeSettings = 'edge-settings',
	TriggerSettings = 'trigger-settings',
	SaveAutomation = 'save-automation',
	TaskLog = 'task-log',
	NewIntegration = 'new-integration',
	NewTrigger = 'new-trigger',
}

export function useModal() {
	const [modal, setModal] = useAtom(modalAtom)

	return {
		...modal,
		open: (kind: Modals, data: unknown = null) => setModal({ isOpen: true, kind, data }),
		close: () => setModal({ isOpen: false, kind: null, data: null }),
	}
}
