import { Footer, ThemeSwitch } from 'nextra-theme-blog'
import { getPageMap } from 'nextra/page-map'
import { Navbar } from '@/components/navbar'
import { Search } from 'nextra/components'
import React from 'react'

const CustomFooter = async () => {
  return (
    <div className="pt-32">
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4">
          <Navbar pageMap={await getPageMap()} />
          <div className="flex gap-2 items-center">
            <Search placeholder="Search posts..." />
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomFooter
