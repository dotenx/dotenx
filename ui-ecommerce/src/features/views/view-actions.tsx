import { Button } from "@mantine/core"
import { openModal } from "@mantine/modals"
import { IoList, IoTrash } from "react-icons/io5"
import { useMutation } from "react-query"
import { useNavigate } from "react-router-dom"
import { deleteView } from "../../api"
import { ViewEndpoints } from "./view-endpoints"

export function ViewActions({
	projectName,
	projectTag,
	viewName,
	isPublic,
}: {
	projectName: string
	projectTag: string
	viewName: string
	isPublic: boolean
}) {
	const navigate = useNavigate()
	const deleteMutation = useMutation(deleteView)
	const handleDelete = () => {
		deleteMutation.mutate(
			{ projectName, viewName },
			{ onSuccess: () => navigate(`/builder/projects/${projectName}/tables`) }
		)
	}
	const showEndpoints = () => {
		openModal({
			title: "Endpoints",
			fullScreen: true,
			children: (
				<ViewEndpoints projectTag={projectTag} viewName={viewName} isPublic={isPublic} />
			),
		})
	}

	return (
		<div className="flex gap-2">
			<Button
				variant="outline"
				onClick={handleDelete}
				loading={deleteMutation.isLoading}
				leftIcon={<IoTrash />}
				size="xs"
			>
				Delete View
			</Button>
			<Button size="xs" leftIcon={<IoList />} onClick={showEndpoints}>
				Endpoints
			</Button>
		</div>
	)
}
