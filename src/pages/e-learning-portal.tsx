import React from 'react'
import dynamic from 'next/dynamic'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import Head from 'next/head'

const DynamicELearningHero = dynamic(() => import('../components/e-learning/hero'))
const DynamicELearningFeatures = dynamic(() => import('../components/e-learning/features'))

const ELearningPortal: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Economics E-Learning Portal | Digital Learning Platform for Economics</title>
        <meta 
          name="description" 
          content="Access our comprehensive digital economics learning platform with chapter-wise video lectures, PDF materials, practice tests, and expert support. Study anytime, anywhere."
        />
        <meta 
          name="keywords" 
          content="economics e-learning, digital economics education, online economics classes, economics video lectures, economics study materials, economics practice tests, CBSE economics, ICSE economics"
        />
      </Head>
      <DynamicELearningHero />
      <DynamicELearningFeatures />
    </>
  )
}

ELearningPortal.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default ELearningPortal 