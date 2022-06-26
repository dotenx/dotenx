import clsx from 'clsx'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { TriggerData } from '../../api'
import { selectedAutomationDataAtom } from '../atoms'
import { TaskNodeData, TriggerEntity } from '../flow'
import { Modals, useModal } from '../hooks'
import { IntegrationForm } from '../integration'
import { Modal } from '../ui'
import { TriggerForm } from './form'
import { useTriggerForm } from './use-form'

interface TriggerSettingsModalProps {
	updateNode: (id: string, data: TaskNodeData) => void
	withIntegration: boolean
}

export function TriggerSettingsModal({ updateNode, withIntegration }: TriggerSettingsModalProps) {
	const [isAddingIntegration, setIsAddingIntegration] = useState(false)
	const modal = useModal()
	useEffect(() => {
		if (!modal.isOpen) setIsAddingIntegration(false)
	}, [modal.isOpen])

	return (
		<Modal
			title="Trigger Settings"
			kind={Modals.TriggerSettings}
			size={isAddingIntegration ? 'lg' : 'md'}
		>
			{({ id, data }: TriggerEntity) => (
				<TriggerSettings
					id={id}
					data={data}
					updateNode={updateNode}
					isAddingIntegration={isAddingIntegration}
					setIsAddingIntegration={setIsAddingIntegration}
					withIntegration={withIntegration}
				/>
			)}
		</Modal>
	)
}

interface TriggerSettingsProps {
	id: string
	data: TriggerData
	updateNode: (id: string, data: TaskNodeData) => void
	isAddingIntegration: boolean
	setIsAddingIntegration: (value: boolean) => void
	withIntegration: boolean
}

function TriggerSettings({
	id,
	data,
	updateNode,
	isAddingIntegration,
	setIsAddingIntegration,
	withIntegration,
}: TriggerSettingsProps) {
	const modal = useModal()
	const [automation] = useAtom(selectedAutomationDataAtom)
	const triggerForm = useTriggerForm({
		onSave: (values) => {
			updateNode(id, values)
			modal.close()
		},
		defaultValues: {
			...data,
			pipeline_name: automation?.name ?? 'default',
		},
	})

	useEffect(() => {
		if (triggerForm.triggerType) setIsAddingIntegration(false)
	}, [setIsAddingIntegration, triggerForm.triggerType])

	return (
		<div className={clsx('grid h-full', isAddingIntegration && 'grid-cols-2')}>
			<div className={clsx(isAddingIntegration && 'pr-10')}>
				<TriggerForm
					triggerForm={triggerForm}
					mode="settings"
					onAddIntegration={() => setIsAddingIntegration(true)}
					disableSubmit={isAddingIntegration}
					withIntegration={withIntegration}
				/>
			</div>
			{isAddingIntegration && (
				<div className="pl-10 border-l">
					<IntegrationForm
						onBack={() => setIsAddingIntegration(false)}
						integrationKind={triggerForm.selectedTriggerIntegrationKind}
						onSuccess={(addedIntegrationName) => {
							setIsAddingIntegration(false)
							triggerForm.setValue('integration', addedIntegrationName)
						}}
					/>
				</div>
			)}
		</div>
	)
}
