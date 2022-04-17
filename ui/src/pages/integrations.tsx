import { BsPlusSquare } from 'react-icons/bs'
import { Modals, useModal } from '../features/hooks'
import { IntegrationList, NewIntegration } from '../features/integration'
import { Modal } from '../features/ui'

export default function IntegrationsPage() {
	return (
		<div className="grow">
			<Header />
			<div className="px-24 py-6 grow">
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
		<div className="flex items-center justify-end p-10">
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
