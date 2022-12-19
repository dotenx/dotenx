import produce from 'immer'
import { ReactNode, useMemo } from 'react'
import imageUrl from '../../assets/components/about-left.png'

import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { IconElement } from '../elements/extensions/icon'
import { ImageElement } from '../elements/extensions/image'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import { Expression } from '../states/expression'
import { ImageDrop } from '../ui/image-drop'
import { Intelinput, inteliText } from '../ui/intelinput'
import ColorOptions from './basic-components/color-options'
import { Controller, ElementOptions } from './controller'
import { ComponentName, DividerCollapsible, SimpleComponentOptionsProps } from './helpers'
import { DraggableTab, DraggableTabs } from './helpers/draggable-tabs'

export class AboutLeft extends Controller {
	name = 'About us with details on the left'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <AboutLeftOptions options={options} />
	}
}

// =============  renderOptions =============

function AboutLeftOptions({ options }: SimpleComponentOptionsProps) {
	const wrapper = options.element as BoxElement
	const heroImage = options.element.children?.[1] as ImageElement
	const title = options.element.children?.[0].children?.[0] as TextElement
	const subTitle = options.element.children?.[0].children?.[1] as TextElement
	const featureLinesWrapper = options.element.children?.[0].children?.[2] as BoxElement
	const featureLines = featureLinesWrapper.children as BoxElement[]
	const cta = options.element.children?.[0].children?.[3] as LinkElement
	const ctaText = cta.children?.[0] as TextElement

	const tabsList: DraggableTab[] | null[] = useMemo(() => {
		return featureLines.map((featureLine, index) => {
			const icon = featureLine.children?.[0] as IconElement
			const text = featureLine.children?.[1] as TextElement
			return {
				id: featureLine.id,
				content: (
					<div key={index}>
						<Intelinput
							label="Title"
							name="title"
							size="xs"
							value={text.data.text}
							onChange={(value) =>
								options.set(
									produce(text, (draft) => {
										draft.data.text = value
									})
								)
							}
						/>
						<DividerCollapsible closed title="details color">
							{ColorOptions.getTextColorOption({
								options,
								wrapperDiv: icon,
								title: 'Icon color',
							})}
							{ColorOptions.getTextColorOption({
								wrapperDiv: text,
								options,
								title: 'text color',
							})}
						</DividerCollapsible>
					</div>
				),
				onTabDelete: () => {
					options.set(
						produce(featureLinesWrapper, (draft) => {
							draft.children.splice(index, 1)
						})
					)
				},
			}
		})
	}, [featureLines])

	return (
		<div className="space-y-6">
			<ComponentName name="About us with details on the left" />
			<ImageDrop
				onChange={(src) =>
					options.set(
						produce(heroImage, (draft) => {
							draft.data.src = Expression.fromString(src)
						})
					)
				}
				src={heroImage.data.src.toString()}
			/>
			<Intelinput
				label="Title"
				name="title"
				size="xs"
				value={title.data.text}
				onChange={(value) =>
					options.set(
						produce(title, (draft) => {
							draft.data.text = value
						})
					)
				}
			/>
			<Intelinput
				label="Sub-title"
				name="subtitle"
				size="xs"
				value={subTitle.data.text}
				onChange={(value) =>
					options.set(
						produce(subTitle, (draft) => {
							draft.data.text = value
						})
					)
				}
			/>
			<Intelinput
				label="CTA"
				name="cta"
				size="xs"
				value={ctaText.data.text}
				onChange={(value) =>
					options.set(
						produce(ctaText, (draft) => {
							draft.data.text = value
						})
					)
				}
			/>
			<Intelinput
				label="CTA Link"
				name="ctaLink"
				size="xs"
				value={cta.data.href}
				onChange={(value) =>
					options.set(
						produce(cta, (draft) => {
							draft.data.href = value
						})
					)
				}
			/>
			<DividerCollapsible closed title="color">
				{ColorOptions.getBackgroundOption({
					options,
					wrapperDiv: wrapper,
				})}
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: title,
					title: 'Title color',
				})}
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: subTitle,
					title: 'Subtitle color',
				})}
				{ColorOptions.getBackgroundOption({
					options,
					wrapperDiv: cta,
					title: 'Button background color',
				})}
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: cta,
					title: 'Button text color',
				})}
			</DividerCollapsible>

			<DraggableTabs
				onDragEnd={(event) => {
					const { active, over } = event
					if (active.id !== over?.id) {
						const oldIndex = tabsList.findIndex((tab) => tab.id === active?.id)
						const newIndex = tabsList.findIndex((tab) => tab.id === over?.id)
						options.set(
							produce(featureLinesWrapper, (draft) => {
								const temp = draft.children![oldIndex]
								draft.children![oldIndex] = draft.children![newIndex]
								draft.children![newIndex] = temp
							})
						)
					}
				}}
				onAddNewTab={() => {
					options.set(
						produce(featureLinesWrapper, (draft) => {
							draft.children.push(createLine('Lorem ipsum dolor sit amet'))
						})
					)
				}}
				tabs={tabsList}
			/>
		</div>
	)
}

// =============  defaultData =============

const wrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr ',
			width: '100%',
			minHeight: '600px',
			alignItems: 'center',
			justifyContent: 'center',
			fontFamily: 'Rubik sans-serif',
			paddingLeft: '10%',
			paddingRight: '10%',
			paddingTop: '40px',
			paddingBottom: '40px',
		},
	}

	draft.style.tablet = {
		default: {
			height: 'auto',
			gridTemplateColumns: ' 1fr ',
		},
	}
	draft.style.mobile = {
		default: {
			paddingLeft: '10%',
			paddingRight: '10%',
		},
	}
}).serialize()
const heroImage = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: '100%',
			maxWidth: '600px',
			height: 'auto',
		},
	}
	draft.data.src = Expression.fromString(
		'https://files.dotenx.com/68c53d72-a5b6-4be5-b0b4-498bd6b43bfd.png'
	)
}).serialize()
const detailsWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'flex-start',
			maxWidth: '50%',
			lineHeight: '1.6',
		},
	}
	draft.style.tablet = {
		default: {
			width: '100%',
			maxWidth: '100%',
			textAlign: 'center',
			justifyContent: 'center',
			alignItems: 'center',
			lineHeight: '1.3',
		},
	}

	draft.style.mobile = {
		default: {
			lineHeight: '1.2',
		},
	}
}).serialize()

const title = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '50px',
			fontWeight: 'bold',
			marginBottom: '30px',
			color: '#333333',
		},
	}

	draft.style.mobile = {
		default: {
			fontSize: '30px',
			marginBottom: '20px',
			color: '#333333',
		},
	}

	draft.data.text = inteliText('Simplify your business')
}).serialize()

const subTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '18px',
			color: '#696969',
		},
	}
	draft.style.mobile = {
		default: {
			fontSize: '14px',
			marginBottom: '10px',
		},
	}
	draft.data.text = inteliText(
		'Branding starts from the inside out. We help you build a strong brand from the inside out.'
	)
}).serialize()

const featureLinesWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			marginTop: '20px',
			marginBottom: '20px',
			fontSize: '15px',
		},
	}
	draft.style.mobile = {
		default: {
			marginTop: '0px',
			marginBottom: '12px',
			fontSize: '12px',
		},
	}
}).serialize()

const createFeatureLine = () =>
	produce(new BoxElement(), (draft) => {
		draft.style.desktop = {
			default: {
				display: 'flex',
				alignItems: 'center',
				marginTop: '10px',
				marginBottom: '10px',
				marginLeft: '0px',
				marginRight: '0px',
			},
		}
		const icon = produce(new IconElement(), (draft) => {
			draft.style.desktop = {
				default: {
					flex: '0 0 auto',
					width: '16px',
					height: '16px',
					marginRight: '10px',
					color: '#6aa512',
				},
			}
			draft.style.tablet = {
				default: {
					width: '12px',
					height: '12px',
					marginRight: '8px',
				},
			}
			draft.style.mobile = {
				default: {
					width: '8px',
					height: '8px',
					marginRight: '4px',
				},
			}
			draft.data.name = 'check'
			draft.data.type = 'fas'
		})

		const text = produce(new TextElement(), (draft) => {
			draft.style.desktop = {
				default: {
					marginLeft: '8px',
					color: '#717171',
				},
			}
			draft.data.text = inteliText('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
		})

		draft.children = [icon, text]
	})

const createLine = (text: string) => {
	return produce(createFeatureLine(), (draft) => {
		;(draft.children[1]! as TextElement).data.text = inteliText(text)
	})
}

const featureLines = [
	createLine('Your brand is your promise to your customers').serialize(),
	createLine('Having a simple UI is a great way to improve your brand').serialize(),
	createLine('Creativity is just connecting things').serialize(),
]

const cta = produce(new LinkElement(), (draft) => {
	draft.style.desktop = {
		default: {
			backgroundColor: '#7670f1',
			border: 'none',
			padding: '15px',
			borderRadius: '15px',
			marginTop: '10px',
			width: '180px',
			height: 'auto',
			color: 'white',
			fontSize: '26px',
			fontWeight: 'bold',
			textAlign: 'center',
			textDecoration: 'none',
			cursor: 'pointer',
		},
	}
	draft.style.tablet = {
		default: {
			justifySelf: 'center',
		},
	}

	draft.style.mobile = {
		default: {
			marginTop: '8px',
			width: '120px',
			fontSize: '14px',
			fontWeight: 'bold',
		},
	}

	const element = new TextElement()
	element.data.text = inteliText('Get Started')

	draft.data.href = Expression.fromString('#')
	draft.data.openInNewTab = false

	draft.children = [element]
}).serialize()

const defaultData = {
	...wrapper,
	components: [
		{
			...detailsWrapper,
			components: [
				title,
				subTitle,
				{
					...featureLinesWrapper,
					components: featureLines,
				},
				cta,
			],
		},
		heroImage,
	],
}
