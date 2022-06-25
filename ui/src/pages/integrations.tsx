import { Modals, useModal } from '../features/hooks'
import { IntegrationForm, IntegrationList } from '../features/integration'
import { Modal } from '../features/ui'

export default function IntegrationsPage() {
	const modal = useModal()

	return (
		<div className="grow">
			<div className="px-32 py-16 grow">
				<IntegrationList />
			</div>
			<Modal kind={Modals.NewIntegration} title="New Integration">
				<IntegrationForm onSuccess={() => modal.close()} />
			</Modal>
		</div>
	)
}
