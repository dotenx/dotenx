import { Modals, useModal } from "../features/hooks"
import { IntegrationForm, IntegrationList } from "../features/integration"
import { ContentWrapper, Modal } from "../features/ui"

export default function IntegrationsPage() {
	const modal = useModal()

	return (
		<>
			<ContentWrapper>
				<IntegrationList />
			</ContentWrapper>
			<Modal kind={Modals.NewIntegration} title="New Integration">
				<IntegrationForm onSuccess={() => modal.close()} />
			</Modal>
		</>
	)
}
