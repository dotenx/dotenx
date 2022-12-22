import { Anchor, Button, Container, Divider, Title } from '@mantine/core'
import { TbPlus } from 'react-icons/tb'
import { Link } from 'react-router-dom'
import { ExtensionList } from '../features/extensions/extension-list'

export function ExtensionsPage() {
	return (
		<Container>
			<div className="flex items-center justify-between">
				<Title my="xl">Extensions</Title>
				<AddExtensionLink />
			</div>
			<Divider />
			<ExtensionList />
		</Container>
	)
}

function AddExtensionLink() {
	return (
		<Anchor component={Link} to="/extensions-create">
			<Button size="xs" leftIcon={<TbPlus />}>
				Extension
			</Button>
		</Anchor>
	)
}
