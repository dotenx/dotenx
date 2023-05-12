import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/about-left-4.png'
import { deserializeElement } from '../../utils/deserialize'
import { Element } from '../elements/element'
import { BoxElement } from '../elements/extensions/box'
import { IconElement } from '../elements/extensions/icon'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { fontSizes } from '../simple/font-sizes'
import { color } from '../simple/palette'
import { IconStyler } from '../simple/stylers/icon-styler'
import { ImageStyler } from '../simple/stylers/image-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class AboutLeft4 extends Component {
	name = 'About us with details on the left - 4'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(): ReactNode {
		return <AboutLeft4Options />
	}
}

// =============  renderOptions =============

function AboutLeft4Options() {
	const component = useSelectedElement<BoxElement>()!
	const heroImage = component.find<ImageElement>(tagIds.heroImage)!
	const title = component.find<TextElement>(tagIds.title)!
	const featureLinesWrapper = component.find<BoxElement>(tagIds.featureLinesWrapper)!

	return (
		<ComponentWrapper name="About us with details on the left - 4">
			<ImageStyler element={heroImage} />
			<TextStyler label="Title" element={title} />
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
	const icon = item.find<IconElement>(tagIds.icon)!
	const title = item.find<TextElement>(tagIds.detailsTitle)!
	const details = item.find<TextElement>(tagIds.detailsText)!

	return (
		<OptionsWrapper>
			<TextStyler label="Title" element={title} />
			<TextStyler label="Details" element={details} />
			<IconStyler label="Icon color" element={icon} />
		</OptionsWrapper>
	)
}

const tagIds = {
	heroImage: 'heroImage',
	title: 'title',
	featureLinesWrapper: 'featureLinesWrapper',
	icon: 'icon',
	detailsTitle: 'detailsTitle',
	detailsText: 'detailsText',
}

// =============  defaultData =============

const component = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr ',
			width: '100%',
			alignItems: 'center',
			justifyContent: 'center',
			paddingLeft: '15%',
			paddingRight: '15%',
			paddingTop: '40px',
			paddingBottom: '40px',
			gap: '40px',
		},
	}
	draft.style.tablet = {
		default: {
			gridTemplateColumns: ' 1fr ',
			paddingLeft: '10%',
			paddingRight: '10%',
			gap: '30px',
		},
	}
	draft.style.mobile = {
		default: {
			paddingLeft: '5%',
			paddingRight: '5%',
			gap: '20px',
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

const title = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: fontSizes.h1.desktop,
			fontWeight: 'bold',
			color: color('primary'),
		},
	}
	draft.style.tablet = {
		default: {
			fontSize: fontSizes.h1.tablet,
		},
	}
	draft.style.mobile = {
		default: {
			fontSize: fontSizes.h1.mobile,
		},
	}
	draft.data.text = Expression.fromString('Simplify your business')
	draft.tagId = tagIds.title
}).serialize()

const featureLinesWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			rowGap: '10px',
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
		const iconWrapper = produce(new BoxElement(), (draft) => {
			draft.style.desktop = {
				default: {
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: color('accent', 0.2),
					borderRadius: '50%',
					marginTop: '4px',
					padding: '4px',
				},
			}
			draft.style.tablet = {
				default: {
					marginTop: '3px',
					padding: '3px',
				},
			}
			draft.style.mobile = {
				default: {
					marginTop: '2px',
					padding: '2px',
				},
			}

			const icon = produce(new IconElement(), (draft) => {
				draft.style.desktop = {
					default: {
						width: fontSizes.normal.desktop,
						height: fontSizes.normal.desktop,
						fontSize: fontSizes.normal.desktop,
						color: color('accent'),
					},
				}
				draft.style.tablet = {
					default: {
						width: fontSizes.normal.tablet,
						height: fontSizes.normal.tablet,
						fontSize: fontSizes.normal.tablet,
					},
				}
				draft.style.mobile = {
					default: {
						width: fontSizes.normal.mobile,
						height: fontSizes.normal.mobile,
						fontSize: fontSizes.normal.mobile,
					},
				}
				draft.data.name = 'check'
				draft.data.type = 'fas'
				draft.tagId = tagIds.icon
			})
			draft.children = [icon]
		})

		const textsWrapper = produce(new BoxElement(), (draft) => {
			draft.style.desktop = {
				default: {
					display: 'flex',
					flexDirection: 'column',
					rowGap: '10px',
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
				draft.data.text = Expression.fromString(txt)
			})
			draft.children = [title, details]
		})

		draft.children = [iconWrapper, textsWrapper]
	})

const featureLines = [
	createFeatureLine('Your brand is your promise to your customers').serialize(),
	createFeatureLine('Having a simple UI is a great way to improve your brand').serialize(),
	createFeatureLine('Creativity is just connecting things').serialize(),
]

const defaultData = {
	...component,
	components: [
		{
			...detailsWrapper,
			components: [
				title,
				{
					...featureLinesWrapper,
					components: featureLines,
				},
			],
		},
		heroImage,
	],
}
