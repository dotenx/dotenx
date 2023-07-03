import { ReactNode } from 'react'
import {
	TbArticle,
	TbAtom2,
	TbBorderHorizontal,
	TbBrandMixpanel,
	TbClick,
	TbForms,
	TbLayoutBottombar,
	TbLayoutNavbar,
	TbList,
	TbMessageChatbot,
	TbPhoto,
	TbQuestionMark,
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
import { AboutLeft5 } from './about-left-5'
import { AboutLeftWithLink } from './about-left-with-link'
import { AboutLongDetailsLeft } from './about-long-details-left'
import { AboutLongDetailsRight } from './about-long-details-right'
import { AboutRight } from './about-right'
import { AboutRight2 } from './about-right-2'
import { AboutRight3 } from './about-right-3'
import { AboutRight4 } from './about-right-4'
import { AboutRight5 } from './about-right-5'
import { AboutRightWithLink } from './about-right-with-link'
import { AboutVideo1 } from './about-video-1'
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
import { ComparisonTable1 } from './comparison-table-1'
import { Component } from './component'
import { CustomersGrid } from './customers-grid'
import { CustomersLogoGrid } from './customers-logo-grid'
import { CustomersStatLogo } from './customers-stat-logo'
import { CustomersUserProfiles } from './customers-users'
import { DividerSimpleLine } from './divider-simple-line'
import { DividerSimpleTitle } from './divider-simple-title'
import { DividerStats } from './divider-stats'
import { DividerStatsWithLogos } from './divider-stats-logos'
import { DividerTextSections } from './divider-text-sections'
import { DynamicTable } from './dynamics/table'
import { FaqBasic } from './faq-basic'
import { FaqBasicStyled } from './faq-basic-styled'
import { FaqCollapsible } from './faq-collapsible'
import { Faq1 } from './faq/faq-1'
import { Faq2 } from './faq/faq-2'
import { Faq3 } from './faq/faq-3'
import { Faq4 } from './faq/faq-4'
import { Faq5 } from './faq/faq-5'
import { Faq6 } from './faq/faq-6'
import { Faq7 } from './faq/faq-7'
import { FeatureCardsImage } from './feature-cards-image'
import { FeatureCenterCards } from './feature-center-cards'
import { FeatureCenterGrid } from './feature-center-grid'
import { FeatureCtaImageTag } from './feature-cta-image-tag'
import { FeatureDetailsGridImageTagLeft } from './feature-details-grid-image-tag-left'
import { FeatureDetailsGridImageTagLeft2 } from './feature-details-grid-image-tag-left-2'
import { FeatureDetailsGridImageTagRight } from './feature-details-grid-image-tag-right'
import { FeatureDetailsGridImageTagRight2 } from './feature-details-grid-image-tag-right-2'
import { FeatureDetailsLeft } from './feature-details-left'
import { FeatureDetailsRight } from './feature-details-right'
import { FeatureGridImageTag } from './feature-grid-image-tag'
import { FeatureGridImages } from './feature-grid-images'
import { Feature1 } from './features/feature-1'
import { Feature10 } from './features/feature-10'
import { Feature11 } from './features/feature-11'
import { Feature12 } from './features/feature-12'
import { Feature13 } from './features/feature-13'
import { Feature14 } from './features/feature-14'
import { Feature15 } from './features/feature-15'
import { Feature16 } from './features/feature-16'
import { Feature17 } from './features/feature-17'
import { Feature18 } from './features/feature-18'
import { Feature19 } from './features/feature-19'
import { Feature2 } from './features/feature-2'
import { Feature20 } from './features/feature-20'
import { Feature21 } from './features/feature-21'
import { Feature22 } from './features/feature-22'
import { Feature23 } from './features/feature-23'
import { Feature24 } from './features/feature-24'
import { Feature3 } from './features/feature-3'
import { Feature4 } from './features/feature-4'
import { Feature5 } from './features/feature-5'
import { Feature6 } from './features/feature-6'
import { Feature7 } from './features/feature-7'
import { Feature8 } from './features/feature-8'
import { Feature9 } from './features/feature-9'
import { FooterGrid } from './footer-grid'
import { FooterSimple } from './footer-simple'
import { FooterSimpleCentered } from './footer-simple-center'
import { FooterSimpleWithLinksOnRight } from './footer-simple-links-on-right'
import { FooterSimpleWithLinksOnRight2 } from './footer-simple-links-on-right-2'
import { FooterSimpleWithInput } from './footer-simple-with-input-1'
import { FooterSimpleWithInput2 } from './footer-simple-with-input-2'
import { FooterSimpleWithInput3 } from './footer-simple-with-input-3'
import { FooterSimpleWithInput4 } from './footer-simple-with-input-4'
import { FooterSimpleWithInput5 } from './footer-simple-with-input-5'
import { FooterSimpleWithInput6 } from './footer-simple-with-input-6'
import { FooterSimpleWithInput7 } from './footer-simple-with-input-7'
import { FooterSimpleWithoutIcon } from './footer-simple-without-icon'
import { Form } from './form'
import { Form2 } from './form-2'
import { FormEmailInput1 } from './form-email-input-1'
import { FormEmailInput2 } from './form-email-input-2'
import { GalleryBasic } from './gallery-basic'
import { GalleryBasicRounded } from './gallery-basic-rounded'
import { GalleryMasonryOne } from './gallery-masonry-1'
import { GalleryMasonryTwo } from './gallery-masonry-2'
import { GalleryMasonryCustomLayout } from './gallery-masonry-custom-layout'
import { GalleryWithCaptions } from './gallery-with-caption'
import { Gallery1 } from './gallery/gallery-1'
import { Gallery2 } from './gallery/gallery-2'
import { Hero10 } from './hero new/hero-10'
import { Hero11 } from './hero new/hero-11'
import { Hero12 } from './hero new/hero-12'
import { Hero13 } from './hero new/hero-13'
import { Hero14 } from './hero new/hero-14'
import { Hero15 } from './hero new/hero-15'
import { Hero16 } from './hero new/hero-16'
import { Hero17 } from './hero new/hero-17'
import { Hero18 } from './hero new/hero-18'
import { Hero19 } from './hero new/hero-19'
import { Hero2 } from './hero new/hero-2'
import { Hero20 } from './hero new/hero-20'
import { Hero21 } from './hero new/hero-21'
import { Hero22 } from './hero new/hero-22'
import { Hero23 } from './hero new/hero-23'
import { Hero24 } from './hero new/hero-24'
import { Hero25 } from './hero new/hero-25'
import { Hero26 } from './hero new/hero-26'
import { Hero27 } from './hero new/hero-27'
import { Hero28 } from './hero new/hero-28'
import { Hero29 } from './hero new/hero-29'
import { Hero3 } from './hero new/hero-3'
import { Hero30 } from './hero new/hero-30'
import { Hero31 } from './hero new/hero-31'
import { Hero32 } from './hero new/hero-32'
import { Hero33 } from './hero new/hero-33'
import { Hero4 } from './hero new/hero-4'
import { Hero5 } from './hero new/hero-5'
import { Hero6 } from './hero new/hero-6'
import { Hero7 } from './hero new/hero-7'
import { Hero8 } from './hero new/hero-8'
import { Hero9 } from './hero new/hero-9'
import { HeroCtaLeft } from './hero-cta-left'
import { HeroCtaRight } from './hero-cta-right'
import { HeroFullWidth } from './hero-full-width'
import { HeroWithBgOneCta } from './hero-with-bg-one-cta'
import { HeroWithBgTwoCta } from './hero-with-bg-two-cta'
import { HeroWithImageTwoCta } from './hero-with-image-two-cta'
import { HeroWithRating } from './hero-with-rating'
import { HeroWithRatingTwoCTAs } from './hero-with-rating-two-cta'
import { HeroWithRatingTwoCTAs2 } from './hero-with-rating-two-cta-2'
import { Navbar } from './navbar'
import { NavbarWithDropDownCtaCenterLogo } from './navbar-with-dropdown-cta-center-logo'
import { Pricing1 } from './plans-new/pricing-1'
import { Pricing2 } from './plans-new/pricing-2'
import { Pricing3 } from './plans-new/pricing-3'
import { Pricing4 } from './plans-new/pricing-4'
import { Pricing5 } from './plans-new/pricing-5'
import { Pricing6 } from './plans-new/pricing-6'
import { Navbar1 } from './navbars/navbar-1'
import { Navbar10 } from './navbars/navbar-10'
import { Navbar11 } from './navbars/navbar-11'
import { Navbar12 } from './navbars/navbar-12'
import { Navbar2 } from './navbars/navbar-2'
import { Navbar3 } from './navbars/navbar-3'
import { Navbar4 } from './navbars/navbar-4'
import { Navbar5 } from './navbars/navbar-5'
import { Navbar6 } from './navbars/navbar-6'
import { Navbar7 } from './navbars/navbar-7'
import { Navbar8 } from './navbars/navbar-8'
import { Navbar9 } from './navbars/navbar-9'
import { NavbarWithDropDownCta1 } from './navbars/navbar-with-dropdown-cta'
import { NavbarWithMultiColumnDropDownCta1 } from './navbars/navbar-with-multicolumn-dropdown-cta'
import { PricingSimple } from './pricing-simple'
import { PricingSimple2 } from './pricing-simple-2'
import { Slider1 } from './slider-1'
import { Slider2 } from './slider-2'
import { StepGridCtaLeft } from './step-grid-cta-left'
import { TeamCenterGrid } from './team-center-grid'
import { TeamIndividualMember } from './team-individual-member'
import { TeamIndividualMember2 } from './team-individual-member-2'
import { TeamRoundCenter } from './team-round-center'
import { TeamRoundLeft } from './team-round-left'
import { TeamSquareGrid } from './team-square-grid'
import { TestimonialSimple } from './testimonial-simple'
import { TestimonialSlider } from './testimonial-slider'
import { TestimonialSlider2 } from './testimonial-slider-2'
import { Testimonials1 } from './testimonials/testimonials-1'
import { Testimonials2 } from './testimonials/testimonials-2'
import { Testimonials3 } from './testimonials/testimonials-3'
import { Testimonials4 } from './testimonials/testimonials-4'
import { Testimonials5 } from './testimonials/testimonials-5'
import { Testimonials6 } from './testimonials/testimonials-6'

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
		title: 'Navbar',
		icon: <TbLayoutNavbar />,
		items: [
			Navbar1,
			Navbar2,
			Navbar3,
			Navbar4,
			Navbar5,
			Navbar6,
			Navbar7,
			Navbar8,
			Navbar9,
			Navbar10,
			Navbar11,
			Navbar12,
			Navbar,
			// NavbarWithDropDownCta,
			NavbarWithDropDownCta1,
			NavbarWithDropDownCtaCenterLogo,
			NavbarWithMultiColumnDropDownCta1,
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
			HeroWithBgOneCta,
			HeroWithBgTwoCta,
			HeroWithImageTwoCta,
			Hero2,
			Hero3,
			Hero4,
			Hero5,
			Hero6,
			Hero7,
			Hero8,
			Hero9,
			Hero10,
			Hero11,
			Hero12,
			Hero13,
			Hero14,
			Hero15,
			Hero16,
			Hero17,
			Hero18,
			Hero19,
			Hero20,
			Hero21,
			Hero22,
			Hero23,
			Hero24,
			Hero25,
			Hero26,
			Hero27,
			Hero28,
			Hero29,
			Hero30,
			Hero31,
			Hero32,
			Hero33,
		],
	},
	{
		title: 'About us',
		icon: <TbArticle />,
		items: [
			AboutLeftWithLink,
			AboutRightWithLink,
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
			AboutLeft5,
			AboutRight5,
			AboutVideoStatsLeft,
			AboutVideoStatsRight,
			AboutVideo1,
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
		items: [ComparisonTable1],
	},
	{
		title: 'FAQ',
		icon: <TbQuestionMark />,
		items: [Faq1, Faq2, Faq3, Faq4, Faq5, Faq6, Faq7, FaqBasic, FaqBasicStyled, FaqCollapsible],
	},
	{
		title: 'Divider',
		icon: <TbBorderHorizontal />,
		items: [
			DividerSimpleTitle,
			DividerSimpleLine,
			DividerTextSections,
			DividerStats,
			DividerStatsWithLogos,
		],
	},
	{
		title: 'Features',
		icon: <TbList />,
		items: [
			Feature1,
			Feature2,
			Feature3,
			Feature4,
			Feature5,
			Feature6,
			Feature7,
			Feature8,
			Feature9,
			Feature10,
			Feature11,
			Feature12,
			Feature13,
			Feature14,
			Feature15,
			Feature16,
			Feature17,
			Feature18,
			Feature19,
			Feature20,
			Feature21,
			Feature22,
			Feature23,
			Feature24,
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
			FeatureCtaImageTag,
		],
	},
	{
		title: 'Gallery',
		icon: <TbPhoto />,
		items: [
			Gallery1,
			Gallery2,
			GalleryBasic,
			GalleryBasicRounded,
			GalleryWithCaptions,
			GalleryMasonryOne,
			GalleryMasonryTwo,
			GalleryMasonryCustomLayout,
		],
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
			TeamIndividualMember2,
		],
	},
	{
		title: 'Form',
		icon: <TbForms />,
		items: [Form, Form2, FormEmailInput1, FormEmailInput2],
	},
	{
		title: 'Slideshow',
		icon: <TbSlideshow />,
		items: [BasicSlideshow, Slider1, Slider2],
	},
	{
		title: 'Steps',
		icon: <TbBrandMixpanel />,
		items: [StepGridCtaLeft],
	},
	{
		title: 'Pricing',
		icon: <TbReportMoney />,
		items: [
			PricingSimple,
			PricingSimple2,
			Pricing1,
			Pricing2,
			Pricing3,
			Pricing4,
			Pricing5,
			Pricing6,
		],
	},
	{
		title: 'Testimonial',
		icon: <TbMessageChatbot />,
		items: [
			Testimonials1,
			Testimonials2,
			Testimonials3,
			Testimonials4,
			Testimonials5,
			Testimonials6,
			TestimonialSimple,
			TestimonialSlider,
			TestimonialSlider2,
		],
	},
	{
		title: 'Footers',
		icon: <TbLayoutBottombar />,
		items: [
			FooterGrid,
			FooterSimple,
			FooterSimpleCentered,
			FooterSimpleWithoutIcon,
			FooterSimpleWithInput,
			FooterSimpleWithInput2,
			FooterSimpleWithInput3,
			FooterSimpleWithInput4,
			FooterSimpleWithInput5,
			FooterSimpleWithInput6,
			FooterSimpleWithInput7,
			FooterSimpleWithLinksOnRight,
			FooterSimpleWithLinksOnRight2,
		],
	},
	{
		title: 'Dynamics',
		icon: <TbAtom2 />,
		items: [DynamicTable],
	},
]

export type ComponentSection = (typeof COMPONENTS)[number]

export type Components = { title: string; items: (typeof Component)[]; icon?: ReactNode }[]
