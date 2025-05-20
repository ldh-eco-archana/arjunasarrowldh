import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import Head from 'next/head'
import { useRouter } from 'next/router'

const DynamicELearningHero = dynamic(() => import('../components/e-learning/hero'))
const DynamicELearningFeatures = dynamic(() => import('../components/e-learning/features'))
const DynamicELearningPricing = dynamic(() => import('../components/e-learning/pricing'))

// Preload login page to reduce redirect time
const LoginPage = dynamic(() => import('./login'), { ssr: true })

const ELearningPortal: NextPageWithLayout = () => {
  const router = useRouter()
  
  // Preload the login page on mount
  useEffect(() => {
    router.prefetch('/login')
  }, [router])
  
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
      <DynamicELearningPricing />
    </>
  )
}

ELearningPortal.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default ELearningPortal 