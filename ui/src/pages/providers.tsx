import { Modals } from '../features/hooks'
import { ProviderForm, ProviderList } from '../features/provider'
import { NewModal } from '../features/ui'

export default function ProvidersPage() {
	return (
		<>
			<div className=" w-full">
				<ProviderList />
			</div>
			<NewModal size="xl" kind={Modals.NewProvider} title="Add a new provider">
				<ProviderForm />
			</NewModal>
		</>
	)
}
