import { Modals } from '../features/hooks'
import { TriggerList } from '../features/trigger'
import { TriggerForm } from '../features/trigger/create-form'
import { useCreateTrigger } from '../features/trigger/use-create'
import { Modal } from '../features/ui'

export default function TriggersPage() {
	const { onSave } = useCreateTrigger()

	return (
		<div className="grow">
			<div className="px-32 py-16 grow">
				<TriggerList />
			</div>
			<Modal title="New Trigger" kind={Modals.NewTrigger}>
				<TriggerForm onSave={onSave} mode="new" />
			</Modal>
		</div>
	)
}
