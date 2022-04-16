/** @jsxImportSource @emotion/react */
import { BsPlusSquare } from 'react-icons/bs'
import { Modals, useModal } from '../features/hooks'
import { IntegrationList, NewIntegration } from '../features/integration'
import { Button, Layout, Modal } from '../features/ui'

export default function IntegrationsPage() {
	return (
		<Layout header={<Header />}>
			<div css={{ padding: '48px 96px', flexGrow: 1 }}>
				<IntegrationList />
			</div>
			<Modal kind={Modals.NewIntegration}>
				<NewIntegration />
			</Modal>
		</Layout>
	)
}

function Header() {
	const modal = useModal()

	return (
		<div
			css={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'end',
				height: '100%',
				padding: '10px 20px',
			}}
		>
			<Button
				css={{
					padding: '4px 10px',
					fontSize: '16px',
				}}
				onClick={() => modal.open(Modals.NewIntegration)}
			>
				New integration
				<BsPlusSquare css={{ marginLeft: 10 }} />
			</Button>
		</div>
	)
}
