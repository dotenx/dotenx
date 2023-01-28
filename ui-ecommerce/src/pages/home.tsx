import {
	ActionIcon,
	Anchor,
	Badge,
	Button,
	Loader,
	Switch,
	Textarea,
	TextInput,
} from "@mantine/core"
import { useForm } from "@mantine/form"
import { closeAllModals, openModal } from "@mantine/modals"
import { TbPlus, TbTrash } from "react-icons/tb"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { Link } from "react-router-dom"
import { z } from "zod"
import { QueryKey } from "../api"
import { createProject, deleteProject, getProjects } from "../api/project"
import { ContentWrapper } from "../features/ui"

export function HomePage() {
	const onClickAddProject = () => {
		openModal({ title: "Create Project", children: <ProjectForm /> })
	}

	return (
		<ContentWrapper>
			<div className="container p-10 mx-auto space-y-6">
				<div className="flex justify-between">
					<h2 className="text-2xl">Projects</h2>
					<Button leftIcon={<TbPlus />} onClick={onClickAddProject}>
						Add Project
					</Button>
				</div>
				<hr />
				<ProjectList />
			</div>
		</ContentWrapper>
	)
}

function ProjectList() {
	const projectsQuery = useQuery([QueryKey.GetProjects], getProjects)
	const deleteProjectMutation = useMutation(deleteProject)
	const queryClient = useQueryClient()

	const projects = projectsQuery.data?.data ?? []

	if (projectsQuery.isLoading) return <Loader />

	return (
		<ul className="space-y-4">
			{projects.map((project) => (
				<li key={project.name} className="flex flex-col gap-2">
					<div className="flex justify-between">
						<Anchor
							component={Link}
							to={`/projects/${project.name}/products`}
							className="self-start"
						>
							{project.name}
						</Anchor>
						<ActionIcon
							loading={deleteProjectMutation.isLoading}
							onClick={() => {
								if (project.tag)
									deleteProjectMutation.mutate(
										{ projectTag: project.tag },
										{
											onSuccess: () =>
												queryClient.invalidateQueries([
													QueryKey.GetProjects,
												]),
										}
									)
							}}
						>
							<TbTrash />
						</ActionIcon>
					</div>
					<div className="flex gap-1">
						<p className="text-xs">{project.description}</p>
						{project.hasDatabase && <Badge>With Database</Badge>}
					</div>
				</li>
			))}
		</ul>
	)
}

const schema = z.object({
	name: z.string().min(2).max(20),
	description: z.string().min(2).max(100).optional(),
	hasDatabase: z.boolean(),
})

type Schema = z.infer<typeof schema>

function ProjectForm() {
	const createProjectMutation = useMutation(createProject)
	const form = useForm<Schema>({
		initialValues: { name: "", description: "", hasDatabase: false },
	})
	const queryClient = useQueryClient()

	const onSubmit = form.onSubmit((values) => {
		createProjectMutation.mutate(values, {
			onSuccess: () => {
				closeAllModals()
				queryClient.invalidateQueries([QueryKey.GetProjects])
			},
		})
	})

	return (
		<form onSubmit={onSubmit} className="space-y-6">
			<TextInput label="Name" withAsterisk {...form.getInputProps("name")} />
			<Textarea label="Description" {...form.getInputProps("description")} />
			<Switch label="Create database" {...form.getInputProps("hasDatabase")} />
			<Button loading={createProjectMutation.isLoading} type="submit" fullWidth>
				Create Project
			</Button>
		</form>
	)
}
