import { BsPlusSquare } from 'react-icons/bs'
import { Modals, useModal } from '../features/hooks'
import { IntegrationList, NewIntegration } from '../features/integration'
import { Modal } from '../features/ui'

export default function IntegrationsPage() {
	return (
		<div>
			<div className="px-24 py-12 grow">
				<IntegrationList />
			</div>
			<Modal kind={Modals.NewIntegration}>
				<NewIntegration />
			</Modal>
		</div>
	)
}

function Header() {
	const modal = useModal()

	return (
		<div className="flex items-center justify-end h-full px-4 py-2">
			<button
				className="flex items-center px-2 py-1 mx-1 text-white bg-black border border-black rounded hover:bg-white hover:text-black"
				onClick={() => modal.open(Modals.NewIntegration)}
			>
				New integration
				<BsPlusSquare className="ml-2" />
			</button>
		</div>
	)
}
