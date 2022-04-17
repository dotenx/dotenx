import { BsPlusSquare } from 'react-icons/bs'
import { Modals, useModal } from '../features/hooks'
import { TriggerList } from '../features/trigger'
import { TriggerForm } from '../features/trigger/create-form'
import { useCreateTrigger } from '../features/trigger/use-create'
import { Modal } from '../features/ui'

export default function TriggersPage() {
	const { onSave } = useCreateTrigger()

	return (
		<div className="grow">
			<Header />
			<div className="px-24 py-6 grow">
				<TriggerList />
			</div>
			<Modal kind={Modals.NewTrigger}>
				<TriggerForm onSave={onSave} mode="new" />
			</Modal>
		</div>
	)
}

function Header() {
	const modal = useModal()

	return (
		<div className="flex items-center justify-end p-10">
			<button
				className="flex items-center px-2 py-1 mx-1 text-white bg-black border border-black rounded hover:bg-white hover:text-black"
				onClick={() => modal.open(Modals.NewTrigger)}
			>
				New trigger
				<BsPlusSquare className="ml-2" />
			</button>
		</div>
	)
}
