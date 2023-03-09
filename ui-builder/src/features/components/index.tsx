import { ReactNode } from 'react'
import {
	TbArticle,
	TbBorderHorizontal,
	TbClick,
	TbForms,
	TbLayoutBottombar,
	TbLayoutNavbar,
	TbList,
	TbMessageChatbot,
	TbPhoto,
	TbQuestionCircle,
	TbReportMoney,
	TbSection,
	TbTableAlias,
	TbUser,
	TbUsers,
} from 'react-icons/tb'
import { AboutLeft } from './about-left'
import { AboutRight } from './about-right'
import { BasicBox } from './basic-box'
import { BasicButton } from './basic-button'
import { BasicColumns } from './basic-columns'
import { BasicImage } from './basic-image'
import { BasicSlideshow } from './basic-slideshow'
import { BasicText } from './basic-text'
import { BasicVideo } from './basic-video'
import { BasicYouTube } from './basic-youtube'
import { ComparisonTableSimple } from './comparison-table-simple'
import { Component } from './component'
import { CustomersGrid } from './customers-grid'
import { CustomersLogoGrid } from './customers-logo-grid'
import { DividerSimpleLine } from './divider-simple-line'
import { DividerSimpleTitle } from './divider-simple-title'
import { DividerStats } from './divider-stats'
import { DividerTextSections } from './divider-text-sections'
import { FaqBasic } from './faq-basic'
import { FaqBasicStyled } from './faq-basic-styled'
import { FeatureCenterCards } from './feature-center-cards'
import { FeatureCenterGrid } from './feature-center-grid'
import { FeatureDetailsLeft } from './feature-details-left'
import { FeatureDetailsRight } from './feature-details-right'
import { FeatureGridImages } from './feature-grid-images'
import { FooterGrid } from './footer-grid'
import { FooterSimple } from './footer-simple'
import { Form } from './form'
import { FormEmailInput1 } from './form-email-input-1'
import { GalleryBasic } from './gallery-basic'
import { GalleryBasicRounded } from './gallery-basic-rounded'
import { GalleryMasonryOne } from './gallery-masonry-1'
import { GalleryMasonryTwo } from './gallery-masonry-2'
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

export const COMPONENTS: Components = [
	{
		title: 'Basic',
		icon: <TbClick />,
		items: [
			BasicImage,
			BasicText,
			BasicButton,
			BasicVideo,
			BasicYouTube,
			BasicColumns,
			BasicSlideshow,
			BasicBox,
		],
	},
	{
		title: 'About',
		icon: <TbArticle />,
		items: [AboutLeft, AboutRight],
	},
	{
		title: 'Customers',
		icon: <TbUser />,
		items: [CustomersLogoGrid, CustomersGrid],
	},
	{
		title: 'Comparison Table',
		icon: <TbTableAlias />,
		items: [ComparisonTableSimple],
	},
	{
		title: 'FAQ',
		icon: <TbQuestionCircle />,
		items: [FaqBasic, FaqBasicStyled],
	},
	{
		title: 'Divider',
		icon: <TbBorderHorizontal />,
		items: [DividerSimpleTitle, DividerSimpleLine, DividerTextSections, DividerStats],
	},
	{
		title: 'Features',
		icon: <TbList />,
		items: [
			FeatureCenterGrid,
			FeatureCenterCards,
			FeatureGridImages,
			FeatureDetailsLeft,
			FeatureDetailsRight,
		],
	},
	{
		title: 'Footers',
		icon: <TbLayoutBottombar />,
		items: [FooterGrid, FooterSimple],
	},
	{
		title: 'Gallery',
		icon: <TbPhoto />,
		items: [
			GalleryBasic,
			GalleryBasicRounded,
			GalleryWithCaptions,
			GalleryMasonryOne,
			GalleryMasonryTwo,
		],
	},
	{
		title: 'Hero',
		icon: <TbSection />,
		items: [HeroFullWidth, HeroCtaLeft, HeroCtaRight],
	},
	{
		title: 'Navbar',
		icon: <TbLayoutNavbar />,
		items: [Navbar],
	},
	{
		title: 'Pricing',
		icon: <TbReportMoney />,
		items: [PricingSimple, PricingSimple2],
	},
	{
		title: 'Team',
		icon: <TbUsers />,
		items: [TeamCenterGrid, TeamRoundCenter, TeamRoundLeft],
	},
	{
		title: 'Testimonial',
		icon: <TbMessageChatbot />,
		items: [TestimonialSimple],
	},
	{
		title: 'Form',
		icon: <TbForms />,
		items: [Form, FormEmailInput1],
	},
]

export type ComponentSection = (typeof COMPONENTS)[number]

export type Components = { title: string; items: (typeof Component)[]; icon?: ReactNode }[]
