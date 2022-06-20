import { Modals } from '../features/hooks'
import { ProviderForm, ProviderList } from '../features/provider'
import { Modal } from '../features/ui'

export default function ProvidersPage() {
	return (
		<>
			<main className="px-32 py-16 grow">
				<ProviderList />
			</main>
			<Modal kind={Modals.NewProvider} title="New Provider">
				<ProviderForm />
			</Modal>
		</>
	)
}
