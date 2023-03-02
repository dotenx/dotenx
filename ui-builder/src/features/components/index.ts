import { AboutLeft } from './about-left'
import { AboutRight } from './about-right'
import { BasicButton } from './basic-button'
import { BasicImage } from './basic-image'
import { BasicText } from './basic-text'
import { BasicVideo } from './basic-video'
import { BasicYouTube } from './basic-youtube'
import {
	ChartArea,
	ChartBar,
	ChartBubble,
	ChartDoughnut,
	ChartLine,
	ChartPie,
	ChartPolarArea,
	ChartRadar,
	ChartScatter,
} from './chart-bar'
import { ComparisonTableSimple } from './comparison-table-simple'
import { Component } from './component'
import { CustomersGrid } from './customers-grid'
import { CustomersLogoGrid } from './customers-logo-grid'
import { DividerSimpleLine } from './divider-simple-line'
import { DividerSimpleTitle } from './divider-simple-title'
import { DividerTextSections } from './divider-text-sections'
import { FaqBasic } from './faq-basic'
import { FaqBasicStyled } from './faq-basic-styled'
import { FeatureCenterCards } from './feature-center-cards'
import { FeatureCenterGrid } from './feature-center-grid'
import { FeatureDetailsLeft } from './feature-details-left'
import { FeatureDetailsRight } from './feature-details-right'
import { FeatureGridImages } from './feature-grid-images'
import { FooterGrid } from './footer-grid'
import { Form } from './form'
import { FooterSimple } from './footer-simple'
import { GalleryBasic } from './gallery-basic'
import { GalleryBasicRounded } from './gallery-basic-rounded'
import { GalleryWithCaptions } from './gallery-with-caption'
import { HeroCtaLeft } from './hero-cta-left'
import { HeroCtaRight } from './hero-cta-right'
import { HeroFullWidth } from './hero-full-width'
import { Navbar } from './navbar'
import { PricingSimple } from './pricing-simple'
import { PricingSimple2 } from './pricing-simple-2'
import { TeamCenterGrid } from './team-center-grid'
import { TeamRoundCenter } from './team-round-center'
import { TeamRoundLeft } from './team-round-left'
import { TestimonialSimple } from './testimonial-simple'
import { DividerStats } from './divider-stats'
import { GalleryMasonryOne } from './gallery-masonry-1'
import { GalleryMasonryTwo } from './gallery-masonry-2'

export const COMPONENTS: Components = [
	{
		title: 'Basic',
		items: [BasicImage, BasicText, BasicButton, BasicVideo, BasicYouTube],
	},
	{
		title: 'About',
		items: [AboutLeft, AboutRight],
	},
	{
		title: 'Charts',
		items: [
			ChartBar,
			ChartArea,
			ChartBubble,
			ChartDoughnut,
			ChartLine,
			ChartPie,
			ChartPolarArea,
			ChartRadar,
			ChartScatter,
		],
	},
	{ title: 'Customers', items: [CustomersLogoGrid, CustomersGrid] },
	{ title: 'Comparison Table', items: [ComparisonTableSimple] },
	{ title: 'FAQ', items: [FaqBasic, FaqBasicStyled] },
	{ title: 'Divider', items: [DividerSimpleTitle, DividerSimpleLine, DividerTextSections, DividerStats] },
	{
		title: 'Features',
		items: [
			FeatureCenterGrid,
			FeatureCenterCards,
			FeatureGridImages,
			FeatureDetailsLeft,
			FeatureDetailsRight,
		],
	},
	{ title: 'Footers', items: [FooterGrid, FooterSimple] },
	{
		title: 'Gallery',
		items: [GalleryBasic, GalleryBasicRounded, GalleryWithCaptions, GalleryMasonryOne, GalleryMasonryTwo],
	},
	{
		title: 'Hero',
		items: [HeroFullWidth, HeroCtaLeft, HeroCtaRight],
	},
	{ title: 'Navbar', items: [Navbar] },
	{ title: 'Pricing', items: [PricingSimple, PricingSimple2] },
	{ title: 'Team', items: [TeamCenterGrid, TeamRoundCenter, TeamRoundLeft] },
	{ title: 'Testimonial', items: [TestimonialSimple] },
	{ title: 'Form', items: [Form] },
]

export type ComponentSection = (typeof COMPONENTS)[number]

export type Components = { title: string; items: (typeof Component)[] }[]
