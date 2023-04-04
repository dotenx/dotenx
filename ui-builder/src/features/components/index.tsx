import { ReactNode } from 'react'
import {
	TbArticle,
	TbBorderHorizontal,
	TbBrandMixpanel,
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
	TbSlideshow,
	TbTableAlias,
	TbUser,
	TbUsers,
} from 'react-icons/tb'
import { AboutFramedImage } from './about-framed-image'
import { AboutLeft } from './about-left'
import { AboutLeft2 } from './about-left-2'
import { AboutLeft3 } from './about-left-3'
import { AboutLeft4 } from './about-left-4'
import { AboutLongDetailsLeft } from './about-long-details-left'
import { AboutLongDetailsRight } from './about-long-details-right'
import { AboutRight } from './about-right'
import { AboutRight2 } from './about-right-2'
import { AboutRight3 } from './about-right-3'
import { AboutRight4 } from './about-right-4'
import { AboutVideoStatsLeft } from './about-video-stats-left'
import { AboutVideoStatsRight } from './about-video-stats-right'
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
import { CustomersStatLogo } from './customers-stat-logo'
import { CustomersUserProfiles } from './customers-users'
import { DividerSimpleLine } from './divider-simple-line'
import { DividerSimpleTitle } from './divider-simple-title'
import { DividerStats } from './divider-stats'
import { DividerTextSections } from './divider-text-sections'
import { FaqBasic } from './faq-basic'
import { FaqBasicStyled } from './faq-basic-styled'
import { FaqCollapsible } from './faq-collapsible'
import { FeatureCardsImage } from './feature-cards-image'
import { FeatureCenterCards } from './feature-center-cards'
import { FeatureCenterGrid } from './feature-center-grid'
import { FeatureDetailsGridImageTagLeft } from './feature-details-grid-image-tag-left'
import { FeatureDetailsGridImageTagLeft2 } from './feature-details-grid-image-tag-left-2'
import { FeatureDetailsGridImageTagRight } from './feature-details-grid-image-tag-right'
import { FeatureDetailsGridImageTagRight2 } from './feature-details-grid-image-tag-right-2'
import { FeatureDetailsLeft } from './feature-details-left'
import { FeatureDetailsRight } from './feature-details-right'
import { FeatureGridImageTag } from './feature-grid-image-tag'
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
import { HeroWithRating } from './hero-with-rating'
import { HeroWithRatingTwoCTAs } from './hero-with-rating-two-cta'
import { HeroWithRatingTwoCTAs2 } from './hero-with-rating-two-cta-2'
import { Navbar } from './navbar'
import { PricingSimple } from './pricing-simple'
import { PricingSimple2 } from './pricing-simple-2'
import { Slider1 } from './slider-1'
import { StepGridCtaLeft } from './step-grid-cta-left'
import { TeamCenterGrid } from './team-center-grid'
import { TeamIndividualMember } from './team-individual-member'
import { TeamRoundCenter } from './team-round-center'
import { TeamRoundLeft } from './team-round-left'
import { TeamSquareGrid } from './team-square-grid'
import { TestimonialSimple } from './testimonial-simple'
import { TestimonialSlider } from './testimonial-slider'

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
			BasicBox,
		],
	},
	{
		title: 'About us',
		icon: <TbArticle />,
		items: [
			AboutLeft,
			AboutRight,
			AboutLeft2,
			AboutRight2,
			AboutLongDetailsLeft,
			AboutLongDetailsRight,
			AboutLeft3,
			AboutRight3,
			AboutFramedImage,
			AboutLeft4,
			AboutRight4,
			AboutVideoStatsLeft,
			AboutVideoStatsRight,
		],
	},
	{
		title: 'Customers',
		icon: <TbUser />,
		items: [CustomersLogoGrid, CustomersGrid, CustomersUserProfiles, CustomersStatLogo],
	},
	{
		title: 'Comparison Table',
		icon: <TbTableAlias />,
		items: [ComparisonTableSimple],
	},
	{
		title: 'FAQ',
		icon: <TbQuestionCircle />,
		items: [FaqBasic, FaqBasicStyled, FaqCollapsible],
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
			FeatureCardsImage,
			FeatureGridImageTag,
			FeatureDetailsGridImageTagLeft,
			FeatureDetailsGridImageTagRight,
			FeatureDetailsGridImageTagLeft2,
			FeatureDetailsGridImageTagRight2,
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
		items: [
			HeroFullWidth,
			HeroCtaLeft,
			HeroCtaRight,
			HeroWithRating,
			HeroWithRatingTwoCTAs,
			HeroWithRatingTwoCTAs2,
		],
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
		items: [
			TeamCenterGrid,
			TeamRoundCenter,
			TeamRoundLeft,
			TeamSquareGrid,
			TeamIndividualMember,
		],
	},
	{
		title: 'Testimonial',
		icon: <TbMessageChatbot />,
		items: [TestimonialSimple, TestimonialSlider],
	},
	{
		title: 'Form',
		icon: <TbForms />,
		items: [Form, FormEmailInput1],
	},
	{
		title: 'Slideshow',
		icon: <TbSlideshow />,
		items: [BasicSlideshow, Slider1],
	},
	{
		title: 'Steps',
		icon: <TbBrandMixpanel />,
		items: [StepGridCtaLeft],
	},
]

export type ComponentSection = (typeof COMPONENTS)[number]

export type Components = { title: string; items: (typeof Component)[]; icon?: ReactNode }[]
