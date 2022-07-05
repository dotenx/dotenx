import { Modals } from '../features/hooks'
import { ProviderForm, ProviderList } from '../features/provider'
import { ContentWrapper, Modal } from '../features/ui'

export default function ProvidersPage() {
	return (
		<>
			<ContentWrapper>
				<ProviderList />
			</ContentWrapper>
			<Modal kind={Modals.NewProvider} title="New Provider">
				<ProviderForm />
			</Modal>
		</>
	)
}
