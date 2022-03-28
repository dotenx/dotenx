/** @jsxImportSource @emotion/react */
import { BsPlusSquare } from 'react-icons/bs'
import { useLocation } from 'react-router-dom'
import { Button } from '../components/button'
import { Layout } from '../components/layout'
import { Modal } from '../components/modal'
import { NewTrigger } from '../containers/new-trigger'
import { TriggerList } from '../containers/trigger-list'
import { Modals, useModal } from '../hooks/use-modal'

export default function Triggers() {
	const location = useLocation()

	return (
		<Layout pathname={location.pathname} header={<Header />}>
			<div css={{ padding: '48px 96px', flexGrow: 1 }}>
				<TriggerList />
			</div>
			<Modal kind={Modals.NewTrigger}>
				<NewTrigger />
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
				onClick={() => modal.open(Modals.NewTrigger)}
			>
				New trigger
				<BsPlusSquare css={{ marginLeft: 10 }} />
			</Button>
		</div>
	)
}
