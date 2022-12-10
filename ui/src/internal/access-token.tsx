import { ActionIcon, Button, Code } from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { IoCheckmark, IoCopy, IoRepeat, IoTrash } from 'react-icons/io5'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useParams } from 'react-router-dom'
import { getProject, QueryKey } from '../api'
import { Loader } from '../features/ui'
import {
	deleteAccessToken,
	getAccessToken,
	InternalQueryKey,
	setAccessToken,
	updateAccessToken,
} from './internal-api'

export function AccessToken() {
	const queryClient = useQueryClient()
	const query = useQuery(InternalQueryKey.GetAccessToken, getAccessToken)
	const { projectName = '' } = useParams()
	const projectQuery = useQuery([QueryKey.GetProject, projectName], () => getProject(projectName))
	const projectTag = projectQuery.data?.data.tag ?? ''

	const generateMutation = useMutation(setAccessToken, {
		onSuccess: () => queryClient.invalidateQueries(InternalQueryKey.GetAccessToken),
	})
	const regenerateMutation = useMutation(updateAccessToken, {
		onSuccess: () => queryClient.invalidateQueries(InternalQueryKey.GetAccessToken),
	})
	const deleteMutation = useMutation(deleteAccessToken, {
		onSuccess: () => {
			queryClient.invalidateQueries(InternalQueryKey.GetAccessToken)
			query.remove()
		},
	})
	const accessToken = query.data?.data.accessToken

	if (query.isLoading || projectQuery.isLoading) return <Loader />

	if (!accessToken) {
		return (
			<div>
				<div className="flex items-center mb-4  justify-between">
					<div>
						Project tag: <Code>{projectTag}</Code>
					</div>
					<div>
						<CopyButton text={projectTag} />
					</div>
				</div>
				<Button
					type="button"
					onClick={() => generateMutation.mutate()}
					loading={generateMutation.isLoading}
				>
					Generate personal access token
				</Button>
			</div>
		)
	}

	return (
		<div>
			<div className="flex items-center mb-2">Project tag: {projectTag}</div>
			<div className="flex items-center justify-between gap-2">
				{accessToken && <Code>{accessToken}</Code>}
				<div className="flex gap-0.5">
					<ActionIcon
						type="button"
						title="Delete existing access token"
						onClick={() => deleteMutation.mutate()}
						loading={deleteMutation.isLoading}
					>
						<IoTrash />
					</ActionIcon>
					<ActionIcon
						type="button"
						title="Generate a new access token"
						onClick={() => regenerateMutation.mutate()}
						loading={regenerateMutation.isLoading}
					>
						<IoRepeat />
					</ActionIcon>
					<CopyButton text={accessToken} />
				</div>
			</div>
			<p className="mt-10">Set this header in requests</p>
			<Code>DTX-auth: {accessToken}</Code>
		</div>
	)
}

function CopyButton({ text }: { text: string }) {
	const clipboard = useClipboard({ timeout: 1000 })

	return (
		<ActionIcon type="button" title="Copy access token" onClick={() => clipboard.copy(text)}>
			{clipboard.copied ? <IoCheckmark /> : <IoCopy />}
		</ActionIcon>
	)
}
