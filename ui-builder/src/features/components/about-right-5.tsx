import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/about-right-5.png'
import { deserializeElement } from '../../utils/deserialize'
import { Element } from '../elements/element'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { fontSizes } from '../simple/font-sizes'
import { color } from '../simple/palette'
import { ImageStyler } from '../simple/stylers/image-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'
import { frameGrid } from '../elements/constructor'

export class AboutRight5 extends Component {
	name = 'About us with details on the right - 5'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(): ReactNode {
		return <AboutRight5Options />
	}
}

// =============  renderOptions =============

function AboutRight5Options() {
	const component = useSelectedElement<BoxElement>()!
	const heroImage = component.find<ImageElement>(tagIds.heroImage)!
	
	const featureLinesWrapper = component.find<BoxElement>(tagIds.featureLinesWrapper)!

	return (
		<ComponentWrapper name="About us with details on the right - 5">
			<ImageStyler element={heroImage} />
			<DndTabs
				containerElement={featureLinesWrapper}
				renderItemOptions={(item) => <ItemOptions item={item} />}
				insertElement={() =>
					createFeatureLine('Your brand is your promise to your customers')
				}
			/>
		</ComponentWrapper>
	)
}

function ItemOptions({ item }: { item: Element }) {
	const image = item.find<ImageElement>(tagIds.image)!
	const title = item.find<TextElement>(tagIds.detailsTitle)!
	const details = item.find<TextElement>(tagIds.detailsText)!

	return (
		<OptionsWrapper>
			<TextStyler label="Title" element={title} />
			<TextStyler label="Details" element={details} />
			<ImageStyler element={image} />
		</OptionsWrapper>
	)
}

const tagIds = {
	heroImage: 'heroImage',
	title: 'title',
	featureLinesWrapper: 'featureLinesWrapper',
	image: 'image',
	detailsTitle: 'detailsTitle',
	detailsText: 'detailsText',
}

// =============  defaultData =============

const component = frameGrid().serialize()

const heroImage = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			maxWidth: '100%',
		},
	}
	draft.data.src = Expression.fromString('https://files.dotenx.com/assets/hero-bg-wva.jpeg')
	draft.tagId = tagIds.heroImage
}).serialize()

const detailsWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
			alignItems: 'flex-start',
		},
	}
	draft.style.tablet = {
		default: {
			lineHeight: '1.3',
		},
	}
	draft.style.mobile = {
		default: {
			lineHeight: '1.2',
		},
	}
}).serialize()


const featureLinesWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			rowGap: '1.5rem',
			marginTop: '20px',
		},
	}
	draft.style.tablet = {
		default: {
			rowGap: '7px',
			marginTop: '16px',
		},
	}
	draft.style.mobile = {
		default: {
			rowGap: '5px',
			marginTop: '12px',
		},
	}
	draft.tagId = tagIds.featureLinesWrapper
}).serialize()

const createFeatureLine = (txt: string) =>
	produce(new BoxElement(), (draft) => {
		draft.style.desktop = {
			default: {
				display: 'flex',
				alignItems: 'flex-start',
				marginTop: '10px',
				columnGap: '10px',
			},
		}
		draft.style.tablet = {
			default: {
				marginTop: '7px',
				columnGap: '7px',
			},
		}
		draft.style.mobile = {
			default: {
				marginTop: '5px',
				columnGap: '5px',
			},
		}
		const image = produce(new ImageElement(), (draft) => {
			draft.style.desktop = {
				default: {
					minWidth: '48px',
					minHeight: '48px',
					objectFit: 'cover',
					objectPosition: 'center center',
					marginRight: '24px'
				},
			}
			draft.style.tablet = {
				default: {
					minWidth: '32px',
					minHeight: '32px',
				},
			}
			draft.tagId = tagIds.image
			draft.data.src = Expression.fromString('https://files.dotenx.com/assets/icons-cloud-39.png')
		})

		const textsWrapper = produce(new BoxElement(), (draft) => {
			draft.style.desktop = {
				default: {
					display: 'flex',
					flexDirection: 'column',
					rowGap: '1rem',
				},
			}
			const title = produce(new TextElement(), (draft) => {
				draft.style.desktop = {
					default: {
						fontSize: fontSizes.h4.desktop,
						fontWeight: 'bold',
						color: color('secondary'),
					},
				}
				draft.style.tablet = {
					default: {
						fontSize: fontSizes.h4.tablet,
					},
				}
				draft.style.mobile = {
					default: {
						fontSize: fontSizes.h4.mobile,
					},
				}
				draft.tagId = tagIds.detailsTitle
				draft.data.text = Expression.fromString(txt)
			})
			const details = produce(new TextElement(), (draft) => {
				draft.style.desktop = {
					default: {
						fontSize: fontSizes.normal.desktop,
						color: color('text'),
					},
				}
				draft.style.tablet = {
					default: {
						fontSize: fontSizes.normal.tablet,
					},
				}
				draft.style.mobile = {
					default: {
						fontSize: fontSizes.normal.mobile,
					},
				}
				draft.tagId = tagIds.detailsText
				draft.data.text = Expression.fromString('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc vel ultricies ultricies, nunc nunc ultricies nunc, nec ultricies nunc nunc vel nunc.')
			})
			draft.children = [title, details]
		})

		draft.children = [image, textsWrapper]
	})

const featureLines = [
	createFeatureLine('Your brand is your promise to your customers.').serialize(),
	createFeatureLine('Having a simple UI is a great way to improve your brand').serialize(),
	createFeatureLine('Creativity is just connecting things').serialize(),
]

const defaultData = {
	...component,
	components: [
		heroImage,
		{
			...featureLinesWrapper,
			components: featureLines,
		},
	],
}
