import { Button, Title, Tooltip } from "@mantine/core"
import { BsGithub } from "react-icons/bs"
import { RiGitlabFill } from "react-icons/ri"
import { FaBitbucket } from "react-icons/fa"
import { ContentWrapper } from "../../features/ui"
import { useState } from "react"
import GithubIntegration from "./github"
import { gitProviders } from "../../api"

export default function GitIntegrationPage() {
	const [selectedProvider, setSelectedProvider] = useState<gitProviders>()

	if (!selectedProvider)
		return (
			<ContentWrapper>
				<div className="flex justify-start">
					<Title order={2}>Git integration</Title>
				</div>
				<div className="flex flex-col items-center ">
					<div className="mt-28 mb-8 font-medium">
						Select a Git provider to import an existing project from a Git Repository.
					</div>
					<div className="flex gap-2">
						<Button
							onClick={() => setSelectedProvider("github")}
							className="font-medium"
							size="lg"
							color={"dark"}
							radius={"md"}
							leftIcon={<BsGithub className="h-7 w-7" />}
						>
							Connect to Github
						</Button>
						<Tooltip openDelay={700} withinPortal withArrow label={"under development"}>
							<div>
								<Button
									disabled
									onClick={() => setSelectedProvider("gitlab")}
									className="font-medium"
									size="lg"
									color={"orange"}
									radius={"md"}
									leftIcon={<RiGitlabFill className="h-7 w-7" />}
								>
									Connect to Gitlab
								</Button>
							</div>
						</Tooltip>
						<Tooltip openDelay={700} withinPortal withArrow label={"under development"}>
							<div>
								<Button
									disabled
									onClick={() => setSelectedProvider("bitbucket")}
									className="font-medium"
									size="lg"
									color={"blue"}
									radius={"md"}
									leftIcon={<FaBitbucket className="h-7 w-7" />}
								>
									Connect to Bitbucket
								</Button>
							</div>
						</Tooltip>
					</div>
				</div>
			</ContentWrapper>
		)
	return (
		<ContentWrapper>
			<div className="flex justify-start">
				<Title order={2}>Git integration</Title>
			</div>
			{selectedProvider === "github" && (
				<GithubIntegration resetProvider={() => setSelectedProvider(undefined)} />
			)}
		</ContentWrapper>
	)
}
