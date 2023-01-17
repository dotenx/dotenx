import { useParams } from "react-router-dom"
import { Automation } from "../features/automation"
import { AUTOMATION_PROJECT_NAME } from "./automation"

export default function InteractionPage() {
	const { name, projectName = AUTOMATION_PROJECT_NAME } = useParams()
	return <Automation projectName={projectName} name={name} kind="interaction" />
}
