import { ActionIcon, Button, Code } from "@mantine/core"
import { useClipboard } from "@mantine/hooks"
import { useState } from "react"
import { IoCheckmark, IoCopy, IoRepeat, IoTrash } from "react-icons/io5"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { useParams } from "react-router-dom"
import { getProject, QueryKey } from "../api"
import { Loader } from "../features/ui"
import {
	deleteAccessToken,
	getAccessToken,
	InternalQueryKey,
	setAccessToken,
	updateAccessToken,
} from "./internal-api"

export function AccessToken() {
	const queryClient = useQueryClient()
	const query = useQuery(InternalQueryKey.GetAccessToken, getAccessToken)
	const { projectName = "" } = useParams()
	const projectQuery = useQuery([QueryKey.GetProject, projectName], () => getProject(projectName))
	const projectTag = projectQuery.data?.data.tag ?? ""
	const [showConfirmDelete, setShowConfirmDelete] = useState(false)
	const [showConfirmRegenerate, setShowConfirmRegenerate] = useState(false)
	const generateMutation = useMutation(setAccessToken, {
		onSuccess: () => queryClient.invalidateQueries(InternalQueryKey.GetAccessToken),
	})
	const regenerateMutation = useMutation(updateAccessToken, {
		onSuccess: () => {
			setShowConfirmRegenerate(false),
				queryClient.invalidateQueries(InternalQueryKey.GetAccessToken)
		},
	})
	const deleteMutation = useMutation(deleteAccessToken, {
		onSuccess: () => {
			setShowConfirmDelete(false)
			queryClient.invalidateQueries(InternalQueryKey.GetAccessToken)
			query.remove()
		},
	})
	const accessToken = query.data?.data.accessToken
	if (query.isLoading || projectQuery.isLoading) return <Loader />

	if (!accessToken) {
		return (
			<div>
				<div className="flex items-center  justify-between border-b mb-4 py-4">
					<div>
						<span className="text-sm">Project tag:</span> <Code>{projectTag}</Code>
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
			<div className="flex items-center  justify-between border-b  py-4">
				<div>
					<span className="text-xs">Project tag: </span> <Code>{projectTag}</Code>
				</div>
				<div>
					<CopyButton text={projectTag} />
				</div>
			</div>
			<div className="border-b py-4">
				<div className="flex items-center  justify-between gap-2 ">
					{accessToken && (
						<div>
							<span className="text-xs whitespace-nowrap">Access token: </span>
							<Code>{accessToken}</Code>
						</div>
					)}
					<div className="flex gap-0.5">
						<ActionIcon
							className={`${showConfirmDelete && "!bg-slate-200"}`}
							type="button"
							title="Delete existing access token"
							onClick={() => {
								setShowConfirmRegenerate(false),
									setShowConfirmDelete(!showConfirmDelete)
							}}
							loading={deleteMutation.isLoading}
						>
							<IoTrash />
						</ActionIcon>
						<ActionIcon
							type="button"
							className={`${showConfirmRegenerate && "!bg-slate-200"}`}
							title="Generate a new access token"
							onClick={() => {
								setShowConfirmDelete(false),
									setShowConfirmRegenerate(!showConfirmRegenerate)
							}}
							loading={regenerateMutation.isLoading}
						>
							<IoRepeat />
						</ActionIcon>
						<CopyButton text={accessToken} />
					</div>
				</div>
				{showConfirmDelete && (
					<div className="flex flex-col  space-y-2 mt-2 border p-2 ">
						<p>Are you sure you want to delete existing access token?</p>
						<div className="flex justify-end w-full">
							<Button
								size="xs"
								loading={deleteMutation.isLoading}
								onClick={() => deleteMutation.mutate()}
							>
								Delete
							</Button>
						</div>
					</div>
				)}
				{showConfirmRegenerate && (
					<div className="flex flex-col  space-y-2 mt-2 border p-2 ">
						<p>Are you sure you want to generate a new access token?</p>
						<div className="flex justify-end w-full">
							<Button
								size="xs"
								loading={regenerateMutation.isLoading}
								onClick={() => regenerateMutation.mutate()}
							>
								Generate
							</Button>
						</div>
					</div>
				)}
			</div>
			<p className="mt-4">Set this header in requests</p>
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
