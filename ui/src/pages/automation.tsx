import { useParams } from 'react-router-dom'
import { Automation } from '../features/automation'

export const AUTOMATION_PROJECT_NAME = 'AUTOMATION_STUDIO'

export default function AutomationPage() {
	const { name } = useParams()
	return <Automation projectName={AUTOMATION_PROJECT_NAME} name={name} kind="automation" />
}
