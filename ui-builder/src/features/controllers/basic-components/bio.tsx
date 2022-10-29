import { TextInput } from '@mantine/core'
import produce from 'immer'
import { WritableDraft } from 'immer/dist/internal'
import { Element } from '../../elements/element'
import { BoxElement } from '../../elements/extensions/box'
import { TextElement } from '../../elements/extensions/text'
import { Intelinput, inteliText } from '../../ui/intelinput'
import ProfessionalSocials from './professional-socials'

const createLayout = (name: string, description: string, align: 'left' | 'center') =>
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

		if (align === 'left') {
			draft.style.desktop!.default!.alignItems = 'flex-start'
			draft.style.desktop!.default!.paddingLeft = '0px'
			draft.style.desktop!.default!.paddingRight = '0px'
		}

		const nameText = produce(new TextElement(), (draft) => {
			draft.style.desktop = {
				default: {
					fontSize: '21px',
					fontWeight: 'bold',
					marginTop: '10px',
				},
			}
			draft.data.text = inteliText(name)
		})

		const descriptionText = produce(new TextElement(), (draft) => {
			draft.style.desktop = {
				default: {
					fontSize: '14px',
					marginTop: '10px',
					marginBottom: '20px',
				},
			}
			draft.data.text = inteliText(description)
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
			<Intelinput
				label="Name"
				name="name"
				size="xs"
				value={nameText.data.text}
				onChange={(value) =>
					set(
						produce(nameText, (draft) => {
							draft.data.text = value
						})
					)
				}
			/>
			<Intelinput
				label="Description"
				name="description"
				size="xs"
				value={descriptionText.data.text}
				onChange={(value) =>
					set(
						produce(descriptionText, (draft) => {
							draft.data.text = value
						})
					)
				}
			/>
			{ProfessionalSocials.getOptions({ set, root: socialsRoot })}
		</>
	)
}

export default class Bio {
	static getComponent = (
		name: string,
		description: string,
		align: 'left' | 'center' = 'center'
	) => createLayout(name, description, align)
	static getOptions = ({ set, root }: { set: (element: Element) => void; root: BoxElement }) => (
		<Options set={set} root={root} />
	)
}
