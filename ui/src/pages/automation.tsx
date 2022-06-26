import { useParams } from 'react-router-dom'
import { Automation } from '../features/automation'

export default function AutomationPage() {
	const { name } = useParams()
	return <Automation name={name} kind="automation" />
}
