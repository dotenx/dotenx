import { Modals } from '../features/hooks'
import { ProviderForm, ProviderList } from '../features/provider'
import { ContentWrapper, NewModal } from '../features/ui'

export default function ProvidersPage() {
	return (
		<>
			<ContentWrapper>
				<ProviderList />
			</ContentWrapper>
			<NewModal kind={Modals.NewProvider} title="Add a new provider">
				<ProviderForm />
			</NewModal>
		</>
	)
}
