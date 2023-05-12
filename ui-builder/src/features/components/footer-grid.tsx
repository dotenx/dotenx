import { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ActionIcon, Button, Collapse } from '@mantine/core'
import produce from 'immer'
import { ReactNode, useEffect, useState } from 'react'
import { TbPlus, TbX } from 'react-icons/tb'
import imageUrl from '../../assets/components/footer-grid.png'
import { deserializeElement } from '../../utils/deserialize'
import { Element } from '../elements/element'
import { useSetElement } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { IconElement } from '../elements/extensions/icon'
import { ImageElement } from '../elements/extensions/image'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { BoxStylerSimple } from '../simple/stylers/box-styler'
import { ImageStyler } from '../simple/stylers/image-styler'
import { LinkStyler } from '../simple/stylers/link-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component, ElementOptions } from './component'
import {
	ComponentName,
	DividerCollapsible,
	repeatObject,
	SimpleComponentOptionsProps,
} from './helpers'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'
import { SortableItem, VerticalSortable } from './vertical-sortable'

export class FooterGrid extends Component {
	name = 'Footer grid'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <FooterGridOptions options={options} />
	}
}

// =============  renderOptions =============

function FooterGridOptions({ options }: SimpleComponentOptionsProps): JSX.Element {
	const [items, setSocialIconItems] = useState<string[]>([])
	const [addIconOpened, setAddIconOpened] = useState(false)

	const icons = {
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

	const [unusedIcons, setUnusedIcons] = useState<SocialIcon[]>([])

	const socialsDiv = options.element.children?.[1].children?.[1] as BoxElement

	const secondFooterTextComponent = options.element.children?.[1].children?.[0] as TextElement

	function handleDragEnd(event: any) {
		const { active, over } = event

		if (active.id !== over.id) {
			const oldIndex = items.indexOf(active.id)
			const newIndex = items.indexOf(over.id)
			setSocialIconItems((items) => {
				return arrayMove(items, oldIndex, newIndex)
			})
			options.set(
				produce(socialsDiv, (draft) => {
					draft.children = arrayMove(draft.children, oldIndex, newIndex)
				})
			)
		}
	}

	useEffect(() => {
		const itemsTemp = socialsDiv.children?.map((item) => item.id)
		setSocialIconItems(itemsTemp)
	}, [socialsDiv.children])

	return (
		<>
			<ComponentName name="Footer grid" />
			<DividerCollapsible closed title="Logo column">
				<LogoColumn />
			</DividerCollapsible>
			<DividerCollapsible closed title="Link Columns">
				<ColumnsOptions />
			</DividerCollapsible>
			{/* Secondary footer */}
			<DividerCollapsible closed title="Secondary footer">
				<TextStyler label="text" element={secondFooterTextComponent} />
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
					<div className="flex w-full my-2 gap-x-1">
						{unusedIcons.map((u: SocialIcon) => (
							<FontAwesomeIcon
								className="w-5 h-5 cursor-pointer"
								onClick={() => {
									setUnusedIcons(unusedIcons.filter((i) => i !== u))
									setSocialIconItems([...items, u])
									options.set(
										produce(socialsDiv, (draft) => {
											draft.children.push(createSocial('fab', u, icons[u]))
										})
									)
								}}
								key={u}
								style={{
									color: icons[u],
								}}
								icon={['fab', u as IconName]}
							/>
						))}
					</div>
				</Collapse>
				{/* Order icons */}
				<VerticalSortable items={items} onDragEnd={handleDragEnd}>
					<div className="flex flex-col justify-items-stretch gap-y-2">
						{items.map((id, index) => {
							const item = socialsDiv.children?.[index] as LinkElement
							const icon = item.children?.[0] as IconElement
							return (
								<SortableItem key={id} id={id}>
									<div className="flex items-center w-full h-full mx-2 justify-stretch gap-x-1">
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
										<LinkStyler placeholder="Link" element={item} />
										<FontAwesomeIcon
											className="w-3 h-3 text-red-500 cursor-pointer"
											icon={['fas', 'trash']}
											onClick={() => {
												setSocialIconItems((items) =>
													items.splice(index, 1)
												)
												setUnusedIcons([
													...unusedIcons,
													icon.data.name as SocialIcon,
												])
												options.set(
													produce(socialsDiv, (draft) => {
														draft.children?.splice(index, 1)
													})
												)
											}}
										/>
									</div>
								</SortableItem>
							)
						})}
					</div>
				</VerticalSortable>
			</DividerCollapsible>
		</>
	)
}

function LogoColumn() {
	const set = useSetElement()
	const component = useSelectedElement<BoxElement>()!
	const column = component.children?.[0].children?.[0] as BoxElement
	const logo = column.children?.[0].children?.[0] as ImageElement
	const title = column.children?.[0].children?.[1] as TextElement

	const addLine = () => {
		set(column, (draft) => draft.children?.push(createLeftTextLine('New line')))
	}
	return (
		<div className="flex flex-col space-y-4 justify-stretch">
			<ImageStyler element={logo} />
			<BoxStylerSimple label="Background color" element={component} />
			<TextStyler label="Title" element={title} />
			<LogoColumnLines column={column as BoxElement} />
			<Button className="mt-2" size="xs" onClick={addLine} leftIcon={<TbPlus />}>
				Add line
			</Button>
		</div>
	)
}

function ColumnsOptions() {
	const component = useSelectedElement<BoxElement>()!
	const rightDiv = component.children?.[0].children?.[1] as BoxElement

	const addTab = () => {
		const columnLines = [
			createColumnLine('About us', ''),
			createColumnLine('Our services', ''),
			createColumnLine('Our products', ''),
			createColumnLine('Contact us', ''),
		]
		const newTabElement = new BoxElement()
		newTabElement.children = [createColumnTitle('Column title'), ...columnLines]
		return newTabElement
	}

	return (
		<DndTabs
			containerElement={rightDiv}
			insertElement={addTab}
			renderItemOptions={(item) => <ColumnItemOptions item={item} />}
		/>
	)
}

function ColumnItemOptions({ item }: { item: Element }) {
	const set = useSetElement()
	const columnLines = item.children
	const title = columnLines?.[0] as TextElement

	return (
		<OptionsWrapper>
			<TextStyler label="Title" element={title} />
			<ColumnLines column={item as BoxElement} />
			<Button
				className="mt-2"
				size="xs"
				onClick={() => {
					set(column, (draft) => {
						draft.children?.push(createColumnLine('New Link', '')) // TODO: Assign a new id (it currently assigns the same link to each item causing issues)
					})
				}}
				leftIcon={<TbPlus />}
			>
				Add Link
			</Button>
		</OptionsWrapper>
	)
}

type ColumnLinesProps = {
	column: BoxElement
}

function ColumnLines({ column }: ColumnLinesProps): JSX.Element {
	const set = useSetElement()
	const columnLines = column.children?.slice(1) as LinkElement[]
	const [items, setItems] = useState<string[]>([])

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event

		if (active.id !== over?.id) {
			const oldIndex = items.indexOf(active?.id as string)
			const newIndex = items.indexOf(over?.id as string)
			setItems((items) => {
				return arrayMove(items, oldIndex, newIndex)
			})
			set(column, (draft) => {
				draft.children = [
					column.children![0],
					...arrayMove(columnLines, oldIndex, newIndex),
				]
			})
		}
	}

	useEffect(() => {
		const itemsTemp = columnLines.map((item) => item.id)
		setItems(itemsTemp)
	}, [columnLines])

	return (
		<VerticalSortable items={items} onDragEnd={handleDragEnd}>
			<div className="flex flex-col w-full px-1 justify-items-stretch gap-y-2">
				{items.map((id, index) => {
					if (index > columnLines.length - 1) return // TODO: This part is nonsense, but it works. Ideally the items should be updated when the columnLines are updated. useMemo should help
					const item = columnLines?.[index] as LinkElement
					const label = item.children?.[0] as TextElement
					const onDelete = () => {
						setItems((items) => items.splice(index, 1))
						set(column, (draft) => {
							draft.children?.splice(index + 1, 1)
						})
					}
					return (
						<SortableItem key={id} id={id}>
							<ActionIcon ml="auto" size="xs" onClick={onDelete}>
								<TbX />
							</ActionIcon>
							<div className="space-y-2">
								<TextStyler label="Text" element={label} />
								<LinkStyler label="Link" element={item} />
							</div>
						</SortableItem>
					)
				})}
			</div>
		</VerticalSortable>
	)
}

function LogoColumnLines({ column }: { column: BoxElement }): JSX.Element {
	const set = useSetElement()
	const columnLines = column.children?.slice(1) as TextElement[]
	const [items, setItems] = useState<string[]>([])

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event

		if (active.id !== over?.id) {
			const oldIndex = items.indexOf(active?.id as string)
			const newIndex = items.indexOf(over?.id as string)
			setItems((items) => arrayMove(items, oldIndex, newIndex))
			set(column, (draft) => {
				draft.children = [
					column.children![0],
					...arrayMove(columnLines, oldIndex, newIndex),
				]
			})
		}
	}

	useEffect(() => {
		const itemsTemp = columnLines.map((item) => item.id)
		setItems(itemsTemp)
	}, [columnLines])

	return (
		<VerticalSortable items={items} onDragEnd={handleDragEnd}>
			<div className="flex flex-col w-full px-1 justify-items-stretch gap-y-2">
				{items.map((id, index) => {
					if (index > columnLines.length - 1) return // TODO: This part is nonsense, but it works. Ideally the items should be updated when the columnLines are updated. useMemo should help
					const item = columnLines?.[index] as TextElement
					const deleteColumn = () => {
						setItems((items) => items.splice(index, 1))
						set(column, (draft) => {
							draft.children?.splice(index + 1, 1)
						})
					}
					return (
						<SortableItem key={id} id={id}>
							<ActionIcon ml="auto" size="xs" onClick={deleteColumn}>
								<TbX />
							</ActionIcon>
							<TextStyler label="Text" element={item} />
						</SortableItem>
					)
				})}
			</div>
		</VerticalSortable>
	)
}

// #region defaultData
const wrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			boxSizing: 'border-box',
			flexDirection: 'column',
			paddingLeft: '10%',
			paddingRight: '10%',
			paddingTop: '20px',
			paddingBottom: '20px',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'stretch',
			width: '100%',
			height: 'auto',
			backgroundColor: '#f1f1f1',
		},
	}
}).serialize()

const leftRightWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 2fr',
			paddingBottom: '20px',
		},
	}
	draft.style.mobile = {
		default: {
			gridTemplateColumns: '1fr',
		},
	}
}).serialize()

const left = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'stretch',
			gap: '10px',
			fontFamily: 'roboto',
		},
	}
}).serialize()

const logo = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			alignItems: 'center',
		},
	}
}).serialize()

const logoImage = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: '100px',
			height: 'auto',
			objectFit: 'cover',
			objectPosition: 'center center',
		},
	}
	draft.data.src = Expression.fromString(
		'https://images.unsplash.com/photo-1484256017452-47f3e80eae7c?dpr=1&auto=format&fit=crop&w=2850&q=60&cs=tinysrgb'
	)
}).serialize()

const logoText = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: 'large',
			fontWeight: 'bold',
			marginTop: '10px',
			paddingLeft: '20px',
		},
	}
	draft.data.text = Expression.fromString('Company name')
}).serialize()

const createLeftTextLine = (text: string) =>
	produce(new TextElement(), (draft) => {
		draft.style.desktop = {
			default: {},
		}
		draft.data.text = Expression.fromString(text)
	})

const leftTextLines = [
	createLeftTextLine('We do this and that').serialize(),
	createLeftTextLine('11 - 13 York Street, Sydney, NSW 2000').serialize(),
	createLeftTextLine('02 1234 5678').serialize(),
	createLeftTextLine('support@example.com').serialize(),
]

const right = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			paddingLeft: '15px',
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr',
		},
	}
	draft.style.mobile = {
		default: {
			marginTop: '20px',
			gridTemplateColumns: '1fr',
			paddingLeft: '0px',
		},
	}
}).serialize()

const column = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {},
	}
}).serialize()

const createColumnTitle = (text: string) =>
	produce(new TextElement(), (draft) => {
		draft.style.desktop = {
			default: {
				fontSize: 'large',
				fontWeight: 'bold',
			},
		}
		draft.data.text = Expression.fromString(text)
	})

const createColumnLine = (text: string, href: string) =>
	produce(new LinkElement(), (draft) => {
		draft.style.desktop = {
			default: { marginTop: '15px' },
		}
		const element = produce(new TextElement(), (draft) => {
			draft.data.text = Expression.fromString(text)
		})
		draft.data.href = Expression.fromString(href)
		draft.children = [element]
	})

const columnLines = [
	createColumnLine('About us', ''),
	createColumnLine('Our services', ''),
	createColumnLine('Our products', ''),
	createColumnLine('Contact us', ''),
].map((item) => item.serialize())

const secondaryFooter = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			justifyContent: 'space-between',
			paddingTop: '10px',
			borderTop: '1px solid #bfbfbf',
			maxHeight: '40px',
		},
	}
}).serialize()

const secondaryFooterLeft = produce(new TextElement(), (draft) => {
	draft.style.mobile = {
		default: {
			fontSize: 'small',
		},
	}
	draft.data.text = Expression.fromString('©2030 Company name. All rights reserved.')
}).serialize()

const socials = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			gap: '10px',
		},
	}
}).serialize()

const social = produce(new LinkElement(), (draft) => {
	const element = produce(new IconElement(), (draft) => {
		draft.style.desktop = {
			default: {
				width: '20px',
				height: '20px',
				color: '#bfbfbf',
			},
		}
		draft.data.type = 'fab'
		draft.data.name = 'facebook'
	})

	draft.children = [element]
	draft.data.href = new Expression()
})

const createSocial = (type: string, name: string, color: string) => {
	return produce(social, (draft) => {
		draft.children[0].data!.type = type
		draft.children[0].data!.name = name
		draft.children[0].style!.desktop!.default!.color = color
	})
}

const socialsList = [
	createSocial('fab', 'facebook', '#3b5998'),
	createSocial('fab', 'twitter', '#1da1f2'),
	createSocial('fab', 'instagram', '#e1306c'),
	createSocial('fab', 'linkedin', '#0077b5'),
	createSocial('fab', 'youtube', '#ff0000'),
	createSocial('fab', 'discord', '#7289da'),
	createSocial('fab', 'vimeo', '#1ab7ea'),
	createSocial('fab', 'whatsapp', '#25d366'),
].map((social) => social.serialize())

const defaultData = {
	...wrapper,
	components: [
		{
			...leftRightWrapper,
			components: [
				{
					...left,
					components: [
						{
							...logo,
							components: [logoImage, logoText],
						},
						...leftTextLines,
					],
				},
				{
					...right,
					components: repeatObject(
						{
							...column,
							components: [
								createColumnTitle('Column title').serialize(),
								...columnLines,
							],
						},
						3
					),
				},
			],
		},
		{
			...secondaryFooter,
			components: [
				{
					...secondaryFooterLeft,
				},
				{
					...socials,
					components: socialsList,
				},
			],
		},
	],
}
// #endregion
