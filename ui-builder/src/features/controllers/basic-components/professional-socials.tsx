import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ActionIcon, Collapse, TextInput } from '@mantine/core'
import produce from 'immer'
import { useState } from 'react'
import { TbPlus } from 'react-icons/tb'
import { Element } from '../../elements/element'
import { BoxElement } from '../../elements/extensions/box'
import { IconElement } from '../../elements/extensions/icon'
import { LinkElement } from '../../elements/extensions/link'
import { TextElement } from '../../elements/extensions/text'
import VerticalOptions from '../helpers/vertical-options'

const iconsSet = {
	facebook: '#3b5998',
	twitter: '#1da1f2',
	instagram: '#e1306c',
	linkedin: '#0077b5',
	youtube: '#ff0000',
	discord: '#7289da',
	vimeo: '#1ab7ea',
	whatsapp: '#25d366',
}
type SocialIcon =
	| 'facebook'
	| 'twitter'
	| 'instagram'
	| 'linkedin'
	| 'youtube'
	| 'discord'
	| 'vimeo'
	| 'whatsapp'

const createLayout = (icons: SocialIcon[]) =>
	produce(new BoxElement(), (draft) => {
		draft.style.desktop = {
			default: {
				display: 'flex',
				justifyContent: 'space-between',
				width: '100%',
			},
		}

		draft.children = icons.map((icon) => createSocialLink(icon, iconsSet[icon]))
	})

function createSocialLink(iconName: string, color: string) {
	return produce(new LinkElement(), (draft) => {
		draft.data.href = '#'
		draft.data.openInNewTab = true

		const icon = produce(new IconElement(), (draft) => {
			draft.style.desktop = {
				default: {
					width: '16px',
					height: '16px',
					color,
				},
			}

			draft.data.name = iconName
			draft.data.type = 'fab'
		})
		draft.children = [icon]
	})
}

type OptionsProps = {
	set: (element: Element) => void
	root: BoxElement
}

function Options({ set, root }: OptionsProps): JSX.Element {
	const containerDiv = root.children[0] as BoxElement
	const [addIconOpened, setAddIconOpened] = useState(false)
	const [unusedIcons, setUnusedIcons] = useState<SocialIcon[]>([])

	return (
		<>
			<VerticalOptions
				set={set}
				containerDiv={containerDiv}
				items={containerDiv.children.map((child, index) => {
					const link = child as LinkElement
					const icon = link.children?.[0] as IconElement
					return {
						id: child.id,
						content: (
							<div className="flex justify-stretch h-full w-full gap-x-1 items-center mx-2">
								<FontAwesomeIcon
									style={{
										color: icon.style.desktop!.default!.color,
									}}
									className="w-5 h-5"
									icon={[
										icon.data.type as IconPrefix,
										icon.data.name as IconName,
									]}
								/>
								<TextInput
									placeholder="Link"
									name="link"
									size="xs"
									value={link.data.href}
									onChange={(event) =>
										set(
											produce(link, (draft) => {
												draft.data.href = event.target.value
											})
										)
									}
								/>
								<FontAwesomeIcon
									className="w-3 h-3 text-red-500 cursor-pointer"
									icon={['fas', 'trash']}
									onClick={() => {
										setUnusedIcons([
											...unusedIcons,
											icon.data.name as SocialIcon,
										])
										set(
											produce(containerDiv, (draft) => {
												draft.children?.splice(index, 1)
											})
										)
									}}
								/>
							</div>
						),
					}
				})}
			/>
			{/* Add new icon */}
			<ActionIcon
				onClick={() => setAddIconOpened((o) => !o)}
				variant="transparent"
				disabled={unusedIcons.length === 0}
			>
				<TbPlus
					size={16}
					className={
						unusedIcons.length !== 0
							? 'text-red-500 rounded-full border-red-500 border'
							: ''
					}
				/>
			</ActionIcon>
			<Collapse in={addIconOpened}>
				<div className="flex w-full gap-x-1 my-2">
					{unusedIcons.map((u: SocialIcon) => (
						<FontAwesomeIcon
							className="w-5 h-5 cursor-pointer"
							onClick={() => {
								setUnusedIcons(unusedIcons.filter((i) => i !== u))
								set(
									produce(containerDiv, (draft) => {
										draft.children.push(createSocialLink(u, iconsSet[u]))
									})
								)
							}}
							key={u}
							style={{
								color: iconsSet[u],
							}}
							icon={['fab', u as IconName]}
						/>
					))}
				</div>
			</Collapse>
		</>
	)
}

export default class ProfessionalSocials {
	static getComponent = () => createLayout(['facebook', 'twitter', 'linkedin'])
	static getOptions = ({ set, root }: { set: (element: Element) => void; root: BoxElement }) => (
		<Options set={set} root={root} />
	)
}

export class Socials {
	static getComponent = () => createLayout(['facebook','twitter','instagram','linkedin','youtube','discord','vimeo','whatsapp'] as SocialIcon[])
	static getOptions = ({ set, root }: { set: (element: Element) => void; root: BoxElement }) => (
		<Options set={set} root={root} />
	)
}