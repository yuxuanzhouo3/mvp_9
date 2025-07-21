"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Menu, X, BarChart3, Crown, Globe, Lock, Unlock, Cloud, Zap, Archive, Download } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-emerald-600" />
            <span className="text-xl font-bold text-gray-900">SecureFiles</span>
            <Badge variant="outline" className="text-xs">
              {t('nav.version')}
            </Badge>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/encrypt" className="flex items-center gap-2 text-gray-700 hover:text-emerald-600">
              <Lock className="h-4 w-4" />
              {language === 'zh' ? '加密' : 'Encrypt'}
            </Link>
            <Link href="/decrypt" className="flex items-center gap-2 text-gray-700 hover:text-emerald-600">
              <Unlock className="h-4 w-4" />
              {language === 'zh' ? '解密' : 'Decrypt'}
            </Link>
            <Link href="/cloud" className="flex items-center gap-2 text-gray-700 hover:text-emerald-600">
              <Cloud className="h-4 w-4" />
              {language === 'zh' ? '云端' : 'Cloud'}
            </Link>
            <Link href="/compress" className="flex items-center gap-2 text-gray-700 hover:text-emerald-600">
              <Zap className="h-4 w-4" />
              {language === 'zh' ? '压缩' : 'Compress'}
            </Link>
            <Link href="/decompress" className="flex items-center gap-2 text-gray-700 hover:text-emerald-600">
              <Archive className="h-4 w-4" />
              {language === 'zh' ? '解压缩' : 'Decompress'}
            </Link>
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-emerald-600">
              <BarChart3 className="h-4 w-4" />
              {t('nav.dashboard')}
            </Link>
            <Link href="/pricing" className="flex items-center gap-2 text-gray-700 hover:text-emerald-600">
              <Crown className="h-4 w-4" />
              {t('nav.pricing')}
            </Link>
            <Link href="/download" className="flex items-center gap-2 text-gray-700 hover:text-emerald-600">
              <Download className="h-4 w-4" />
              {language === 'zh' ? '下载客户端' : 'Download Client'}
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              {language === 'zh' ? 'EN' : '中'}
            </Button>
            <Button variant="outline">{t('nav.login')}</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">{t('nav.register')}</Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              <Link href="/encrypt" className="flex items-center gap-2 text-gray-700">
                <Lock className="h-4 w-4" />
                {language === 'zh' ? '加密' : 'Encrypt'}
              </Link>
              <Link href="/decrypt" className="flex items-center gap-2 text-gray-700">
                <Unlock className="h-4 w-4" />
                {language === 'zh' ? '解密' : 'Decrypt'}
              </Link>
              <Link href="/cloud" className="flex items-center gap-2 text-gray-700">
                <Cloud className="h-4 w-4" />
                {language === 'zh' ? '云端' : 'Cloud'}
              </Link>
              <Link href="/compress" className="flex items-center gap-2 text-gray-700">
                <Zap className="h-4 w-4" />
                {language === 'zh' ? '压缩' : 'Compress'}
              </Link>
              <Link href="/decompress" className="flex items-center gap-2 text-gray-700">
                <Archive className="h-4 w-4" />
                {language === 'zh' ? '解压缩' : 'Decompress'}
              </Link>
              <Link href="/dashboard" className="flex items-center gap-2 text-gray-700">
                <BarChart3 className="h-4 w-4" />
                {t('nav.dashboard')}
              </Link>
              <Link href="/pricing" className="flex items-center gap-2 text-gray-700">
                <Crown className="h-4 w-4" />
                {t('nav.pricing')}
              </Link>
              <Link href="/download" className="flex items-center gap-2 text-gray-700">
                <Download className="h-4 w-4" />
                {language === 'zh' ? '下载客户端' : 'Download Client'}
              </Link>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 flex-1"
                >
                  <Globe className="h-4 w-4" />
                  {language === 'zh' ? 'EN' : '中'}
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  {t('nav.login')}
                </Button>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">{t('nav.register')}</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
