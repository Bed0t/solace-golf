'use client'
import dynamic from 'next/dynamic'
import './configurator.css'
import Header from '@/components/Header'

const ConfiguratorApp = dynamic(() => import('./_components/ConfiguratorApp'), { ssr: false })

export default function Page() {
  return (
    <>
      <Header variant="fixed" />
      <ConfiguratorApp />
    </>
  )
}


