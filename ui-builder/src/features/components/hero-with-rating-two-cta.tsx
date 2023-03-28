import { Slider } from '@mantine/core'
import produce from 'immer'
import imageUrl from '../../assets/components/hero-with-rating-two-cta.png'
import { deserializeElement } from '../../utils/deserialize'
import { Element } from '../elements/element'
import { useSetElement } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { IconElement } from '../elements/extensions/icon'
import { ImageElement } from '../elements/extensions/image'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { color } from '../simple/palette'
import { IconStyler } from '../simple/stylers/icon-styler'
import { ImageStyler } from '../simple/stylers/image-styler'
import { LinkStyler } from '../simple/stylers/link-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class HeroWithRatingTwoCTAs extends Component {
	name = 'Hero with rating and two CTAs'
	image = imageUrl
	defaultData =  deserializeElement(defaultData)
	renderOptions = () => <HeroWithRatingTwoCTAsOptions />
}

// =============  renderOptions =============

function HeroWithRatingTwoCTAsOptions() {
	const component = useSelectedElement<BoxElement>()!
	const heroImage = component.find<ImageElement>(tagIds.heroImage)!
	const title = component.find<TextElement>(tagIds.title)!
	const subtitle = component.find<TextElement>(tagIds.subtitle)!
	const featureLinesWrapper = component.find<BoxElement>(tagIds.featureLinesWrapper)!
	const cta1 = component.find<LinkElement>(tagIds.cta1)!
	const cta1Text = component.find<TextElement>(tagIds.cta1Text)!
	const cta2 = component.find<LinkElement>(tagIds.cta2)!
	const cta2Text = component.find<TextElement>(tagIds.cta2Text)!
	const ratingWrapper = component.find<BoxElement>(tagIds.ratingWrapper)!
	const ratingText = component.find<TextElement>(tagIds.ratingText)!
	const set = useSetElement()

	return (
		<ComponentWrapper name="Hero with rating and two CTAs">
			<ImageStyler element={heroImage} />
			<TextStyler label="Title" element={title} />
			<TextStyler label="Subtitle" element={subtitle} />
			<TextStyler label="CTA1" element={cta1Text} />
			<LinkStyler label="CTA1 Link" element={cta1} />
			<TextStyler label="CTA2" element={cta2Text} />
			<LinkStyler label="CTA2 Link" element={cta2} />
			<p className="mb-2 font-medium cursor-default">Rating</p>
			<Slider
				step={0.1}
				min={0}
				max={5}
				styles={{ markLabel: { display: 'none' } }}
				value={(ratingWrapper.internal?.rating as number) ?? 0}
				label={(value) => value.toFixed(1)}
				onChange={(val) => {
					set(ratingWrapper, (draft) => {
						draft.internal = { ...draft.internal, rating: val }
						draft.children = [
							...generateRating(5, val),
							draft.children?.[draft.children.length - 1],
						]
					})
				}}
			/>
			<TextStyler label="Rating text" element={ratingText} />
			<p className="font-medium cursor-default">Features</p>
			<DndTabs
				containerElement={featureLinesWrapper}
				renderItemOptions={(item) => <ItemOptions item={item} />}
				insertElement={() => createLine('Lorem ipsum dolor sit amet')}
			/>
		</ComponentWrapper>
	)
}

function ItemOptions({ item }: { item: Element }) {
	const icon = item.children?.[0] as IconElement
	const text = item.children?.[1] as TextElement

	return (
		<OptionsWrapper>
			<TextStyler label="Title" element={text} />
			<IconStyler label="Icon color" element={icon} />
		</OptionsWrapper>
	)
}

const tagIds = {
	heroImage: 'heroImage',
	title: 'title',
	subtitle: 'subtitle',
	featureLinesWrapper: 'featureLinesWrapper',
	cta1: 'cta1',
	cta1Text: 'cta1Text',
	cta2: 'cta2',
	cta2Text: 'cta2Text',
	ratingWrapper: 'ratingWrapper',
	ratingText: 'ratingText',
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
			columnGap: '10px',
		},
	}
	draft.style.tablet = {
		default: {
			gridTemplateColumns: ' 1fr ',
			paddingLeft: '10%',
			paddingRight: '10%',
			rowGap: '30px',
		},
	}
	draft.style.mobile = {
		default: {
			paddingLeft: '5%',
			paddingRight: '5%',
			rowGap: '20px',
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
			color: color('primary'),
		},
	}
	draft.style.mobile = {
		default: {
			fontSize: '30px',
		},
	}
	draft.data.text = Expression.fromString('Simplify your business')
	draft.tagId = tagIds.title
}).serialize()

const subtitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '16px',
			color: color('primary', 0.9),
		},
	}
	draft.style.mobile = {
		default: {
			fontSize: '12px',
			marginBottom: '10px',
		},
	}
	draft.data.text = Expression.fromString('Branding starts from the inside out')
	draft.tagId = tagIds.subtitle
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
	draft.tagId = tagIds.featureLinesWrapper
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
					color: color('accent'),
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
					color: color('text'),
				},
			}
			draft.data.text = Expression.fromString(
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
			)
		})

		draft.children = [icon, text]
	})

const createLine = (text: string) => {
	return produce(createFeatureLine(), (draft) => {
		const textElement = draft.children[1]! as TextElement
		textElement.data.text = Expression.fromString(text)
	})
}

const featureLines = [
	createLine('Your brand is your promise to your customers').serialize(),
	createLine('Having a simple UI is a great way to improve your brand').serialize(),
	createLine('Creativity is just connecting things').serialize(),
]

const ctaWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			columnGap: '20px',
		},
	}
	draft.style.tablet = {
		default: {
			columnGap: '10px',
		},
	}
	draft.style.mobile = {
		default: {
			columnGap: '5px',
		},
	}
}).serialize()

const cta1 = produce(new LinkElement(), (draft) => {
	draft.style.desktop = {
		default: {
			backgroundColor: color('primary'),
			border: 'none',
			borderRadius: '10px',
			textAlign: 'center',
			textDecoration: 'none',
			cursor: 'pointer',
			paddingTop: '8px',
			paddingBottom: '8px',
			paddingLeft: '20px',
			paddingRight: '20px',
		},
	}
	draft.style.tablet = {
		default: {
			justifySelf: 'center',
			paddingLeft: '15px',
			paddingRight: '15px',
		},
	}

	const element = new TextElement()
	element.data.text = Expression.fromString('Get Started Now')
	element.tagId = tagIds.cta1Text
	element.style.desktop = {
		default: {
			color: 'hsla(0, 0%, 100%, 1)',
			fontSize: '22px',
			fontWeight: 'bold',
		},
	}
	element.style.tablet = {
		default: {
			fontSize: '18px',
		},
	}
	element.style.mobile = {
		default: {
			fontSize: '14px',
		},
	}

	draft.data.href = Expression.fromString('#')
	draft.data.openInNewTab = false

	draft.children = [element]
	draft.tagId = tagIds.cta1
}).serialize()

const cta2 = produce(new LinkElement(), (draft) => {
	draft.style.desktop = {
		default: {
			borderWidth: '1px',
			borderStyle: 'solid',
			borderColor: color('primary'),
			borderRadius: '10px',
			textAlign: 'center',
			textDecoration: 'none',
			cursor: 'pointer',
			paddingTop: '8px',
			paddingBottom: '8px',
			paddingLeft: '20px',
			paddingRight: '20px',
		},
	}
	draft.style.tablet = {
		default: {
			justifySelf: 'center',
			paddingLeft: '15px',
			paddingRight: '15px',
		},
	}

	const element = new TextElement()
	element.data.text = Expression.fromString('Request a Demo')
	element.tagId = tagIds.cta2Text
	element.style.desktop = {
		default: {
			color: color('primary'),
			fontSize: '22px',
			fontWeight: 'bold',
		},
	}
	element.style.tablet = {
		default: {
			fontSize: '18px',
		},
	}
	element.style.mobile = {
		default: {
			fontSize: '14px',
		},
	}

	draft.data.href = Expression.fromString('#')
	draft.data.openInNewTab = false

	draft.children = [element]
	draft.tagId = tagIds.cta2
}).serialize()

const ratingWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			alignItems: 'center',
			marginTop: '20px',
		},
	}
	draft.style.tablet = {
		default: {
			marginTop: '15px',
		},
	}
	draft.style.mobile = {
		default: {
			marginTop: '10px',
		},
	}

	const stars = generateRating(5, 3.9)
	const text = produce(new TextElement(), (draft) => {
		draft.style.desktop = {
			default: {
				marginLeft: '8px',
				fontSize: '15px',
				color: color('text'),
			},
		}
		draft.style.tablet = {
			default: {
				fontSize: '13px',
			},
		}
		draft.style.mobile = {
			default: {
				fontSize: '11px',
			},
		}

		draft.data.text = Expression.fromString('Rated 3.9 by 1,000+ users')
		draft.tagId = tagIds.ratingText
	})
	draft.children = [...stars, text]
	draft.tagId = tagIds.ratingWrapper
	draft.internal = {
		rating: 3.9,
	}
}).serialize()

// Creates an array of IconElements with the given count and rating
function generateRating(count: number, rating: number) {
	const stars = []
	for (let i = 0; i < count; i++) {
		const star = produce(new IconElement(), (draft) => {
			draft.style.desktop = {
				default: {
					flex: '0 0 auto',
					width: '16px',
					height: '16px',
					marginRight: '10px',
					color: '#F7B005',
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
			if (rating - i >= 1) {
				draft.data.name = 'star'
				draft.data.type = 'fas'
			} else if (rating - i >= 0.5) {
				draft.data.name = 'star-half-alt'
				draft.data.type = 'fas'
			} else {
				draft.data.name = 'star'
				draft.data.type = 'far'
			}
		})
		stars.push(star)
	}
	return stars
}

const defaultData = {
	...component,
	components: [
		{
			...detailsWrapper,
			components: [
				ratingWrapper,
				title,
				subtitle,
				{
					...featureLinesWrapper,
					components: featureLines,
				},
				{ ...ctaWrapper, components: [cta1, cta2] },
			],
		},
		heroImage,
	],
}
