'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Media } from '@/components/Media'
import type { Header as HeaderType } from '@/payload-types'

interface HeaderProps {
  header?: HeaderType | null
  domainName?: string
}

export const HeaderComponent = ({ header, domainName }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const logo = header?.logo
  const navItems = header?.navItems || []

  // Resolve display name for logo fallback
  const displayName = domainName || (typeof header?.domain === 'object' && header?.domain ? header.domain.title : 'SaaS App')

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-zinc-950/70 backdrop-blur-xl shadow-lg shadow-black/20 text-zinc-100 transition-all duration-300">
      {/* Top thin gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-white hover:opacity-95 transition-all duration-200">
              {logo ? (
                <div className="relative h-8 w-auto flex items-center justify-center max-w-37.5 [&_img]:h-8 [&_img]:w-auto [&_img]:object-contain">
                  <Media resource={logo} />
                </div>
              ) : (
                <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent hover:scale-102 transition-transform">
                  {displayName}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item, index) => {
              const isLast = index === navItems.length - 1;
              return (
                <Link
                  key={item.id || item.link}
                  href={item.link}
                  className={`text-sm font-medium transition-all duration-300 px-4 py-2 rounded-full ${
                    isLast && navItems.length > 2
                      ? 'bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 active:scale-95'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-zinc-100 transition-colors focus:outline-hidden"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                // Close Icon
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Hamburger Icon
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden border-t border-white/5 bg-zinc-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2" id="mobile-menu">
          {navItems.map((item, index) => {
            const isLast = index === navItems.length - 1;
            return (
              <Link
                key={item.id || item.link}
                href={item.link}
                onClick={() => setIsOpen(false)}
                className={`block rounded-xl px-4 py-3 text-base font-medium transition-all ${
                  isLast && navItems.length > 2
                    ? 'bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-center shadow-lg shadow-indigo-500/25 mt-4'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
          {navItems.length === 0 && (
            <p className="px-4 py-3 text-sm text-zinc-500 italic">No navigation items configured.</p>
          )}
        </div>
      )}
    </header>
  )
}
