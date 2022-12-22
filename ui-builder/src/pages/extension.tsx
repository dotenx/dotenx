import { Container, Divider, Loader, Title } from '@mantine/core'
import { Prism } from '@mantine/prism'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { QueryKey } from '../api'
import { Extension, getExtension } from '../features/extensions/api'
import { ExtensionActions } from '../features/extensions/extension-list'
import { BackToExtensions } from './extension-create'

export function ExtensionDetailsPage() {
	const { id = '' } = useParams()
	const extensionQuery = useQuery([QueryKey.Extension, id], () => getExtension({ id }), {
		enabled: !!id,
	})
	const extension = extensionQuery.data?.data

	if (extensionQuery.isLoading || !extension) return <Loader size="xs" mx="auto" mt="xl" />

	return (
		<Container>
			<div className="flex items-center justify-between">
				<Title my="xl">{extension?.name}</Title>
				<div className="flex items-center gap-1">
					<ExtensionActions id={id} />
					<BackToExtensions />
				</div>
			</div>
			<Divider mb="xl" />
			<ExtensionDetails extension={extension} />
		</Container>
	)
}

function ExtensionDetails({ extension }: { extension: Extension }) {
	return (
		<div className="space-y-4">
			<div>
				<Title order={4}>Name</Title>
				<p>{extension.name}</p>
			</div>

			<div>
				<Title order={4}>HTML</Title>
				<Prism colorScheme="dark" noCopy language="markup">
					{extension.html}
				</Prism>
			</div>
			<div>
				<Title order={4}>JavaScript</Title>
				<Prism colorScheme="dark" noCopy language="javascript">
					{extension.js}
				</Prism>
			</div>
			<div>
				<Title order={4}>Head</Title>
				<Prism colorScheme="dark" noCopy language="markup">
					{extension.head}
				</Prism>
			</div>
		</div>
	)
}
