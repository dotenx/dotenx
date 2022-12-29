import { Code, Container, Divider, Loader, Title } from '@mantine/core'
import { Prism } from '@mantine/prism'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { QueryKey } from '../api'
import { Extension, getExtension } from '../features/extensions/api'
import { ExtensionActions } from '../features/extensions/extension-list'
import { useGetProjectTag } from '../features/page/use-get-project-tag'
import { BackToExtensions } from './extension-create'
import { BuilderLink } from './extensions'

export function ExtensionDetailsPage() {
	const { name = '', projectName = '' } = useParams()
	const projectTag = useGetProjectTag(projectName)
	const extensionQuery = useQuery(
		[QueryKey.Extension, name, projectTag],
		() => getExtension({ name, projectTag }),
		{ enabled: !!name && !!projectTag }
	)
	const extension = extensionQuery.data?.data

	if (extensionQuery.isLoading || !extension) return <Loader size="xs" mx="auto" mt="xl" />

	return (
		<div className="flex">
			<BuilderLink projectName={projectName} />
			<Container className="grow">
				<div className="flex items-center justify-between">
					<Title my="xl">{extension?.name}</Title>
					<div className="flex items-center gap-1">
						<ExtensionActions
							name={name}
							projectTag={projectTag}
							projectName={projectName}
						/>
						<BackToExtensions projectName={projectName} />
					</div>
				</div>
				<Divider mb="xl" />
				<ExtensionDetails extension={extension} />
			</Container>
		</div>
	)
}

function ExtensionDetails({ extension }: { extension: Extension }) {
	return (
		<div className="pb-10 space-y-4">
			<div>
				<Title order={4}>Name</Title>
				<p>{extension.name}</p>
			</div>
			<div>
				<Title order={4} mb="xs">
					Inputs
				</Title>
				<div className="flex flex-wrap gap-4">
					{extension.content.inputs.map((input) => (
						<Code key={input.name}>{input.name}</Code>
					))}
				</div>
			</div>
			<div>
				<Title order={4} mb="xs">
					Outputs
				</Title>
				<div className="flex flex-wrap gap-4">
					{extension.content.outputs.map((output) => (
						<Code key={output.name}>{output.name}</Code>
					))}
				</div>
			</div>
			<div>
				<Title order={4}>HTML</Title>
				<Prism colorScheme="dark" noCopy language="markup">
					{extension.content.html}
				</Prism>
			</div>
			<div>
				<Title order={4}>Init</Title>
				<Prism colorScheme="dark" noCopy language="javascript">
					{extension.content.init}
				</Prism>
			</div>
			<div>
				<Title order={4}>Action</Title>
				<Prism colorScheme="dark" noCopy language="javascript">
					{extension.content.action}
				</Prism>
			</div>
			<div>
				<Title order={4}>Head</Title>
				<Prism colorScheme="dark" noCopy language="markup">
					{extension.content.head}
				</Prism>
			</div>
		</div>
	)
}
