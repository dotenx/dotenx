import { useParams } from 'react-router-dom'
import { Automation } from '../features/automation'

export default function TemplatePage() {
	const { name } = useParams()
	return <Automation name={name} kind="template" />
}
