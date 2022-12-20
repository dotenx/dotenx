import { Anchor, Button, Container, Divider, Title } from '@mantine/core'
import { TbPlus } from 'react-icons/tb'
import { Link } from 'react-router-dom'
import { PluginList } from '../features/plugins/plugin-list'

export function PluginsPage() {
	return (
		<Container>
			<div className="flex items-center justify-between">
				<Title my="xl">Plugins</Title>
				<AddPluginLink />
			</div>
			<Divider />
			<PluginList />
		</Container>
	)
}

function AddPluginLink() {
	return (
		<Anchor component={Link} to="/plugins-create">
			<Button size="xs" leftIcon={<TbPlus />}>
				Plugin
			</Button>
		</Anchor>
	)
}
