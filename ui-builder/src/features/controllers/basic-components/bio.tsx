import { TextInput } from '@mantine/core'
import produce from 'immer'
import { Element } from '../../elements/element'
import { BoxElement } from '../../elements/extensions/box'
import { TextElement } from '../../elements/extensions/text'
import ProfessionalSocials from './professional-socials'

const createLayout = (name: string, description: string) =>
	produce(new BoxElement(), (draft) => {
		draft.style.desktop = {
			default: {
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				paddingLeft: '10%',
				paddingRight: '10%',
				paddingBottom: '20px',
				gap: '10px',
			},
		}

		const nameText = produce(new TextElement(), (draft) => {
			draft.style.desktop = {
				default: {
					fontSize: '21px',
					fontWeight: 'bold',
					marginTop: '10px',
				},
			}
			draft.data.text = name
		})

		const descriptionText = produce(new TextElement(), (draft) => {
			draft.style.desktop = {
				default: {
					fontSize: '14px',
					marginTop: '10px',
					marginBottom: '20px',
				},
			}
			draft.data.text = description
		})

		const socialsWrapper = produce(new BoxElement(), (draft) => {
			draft.style.desktop = {
				default: {
					width: '50%',
				},
			}
			draft.children = [ProfessionalSocials.getComponent()]
		})

		draft.children = [nameText, descriptionText, socialsWrapper]
	})

type OptionsProps = {
	set: (element: Element) => void
	root: BoxElement
}

function Options({ set, root }: OptionsProps): JSX.Element {
	const nameText = root.children[0] as TextElement
	const descriptionText = root.children[1] as TextElement
	const socialsRoot = root.children[2] as BoxElement
	return (
		<>
			<TextInput
				placeholder="Name"
				name="name"
				size="xs"
				value={nameText.data.text}
				onChange={(event) =>
					set(
						produce(nameText, (draft) => {
							draft.data.text = event.target.value
						})
					)
				}
			/>
			<TextInput
				placeholder="Description"
				name="description"
				size="xs"
				value={descriptionText.data.text}
				onChange={(event) =>
					set(
						produce(descriptionText, (draft) => {
							draft.data.text = event.target.value
						})
					)
				}
			/>
			{ProfessionalSocials.getOptions({ set, root: socialsRoot })}
		</>
	)
}

export default class Bio {
	getComponent = (name: string, description: string) => createLayout(name, description)
	static getOptions = ({ set, root }: { set: (element: Element) => void; root: BoxElement }) => (
		<Options set={set} root={root} />
	)
}
