"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Shield, 
  Menu, 
  X, 
  BarChart3, 
  Crown, 
  Globe, 
  Lock, 
  Unlock, 
  Cloud, 
  Zap, 
  Archive, 
  Download,
  User,
  LogIn,
  UserPlus,
  Settings,
  LogOut,
  ChevronDown
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // 模拟登录状态
  const { language, setLanguage, t } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh')
  }

  const handleLogin = () => {
    console.log("Login clicked")
    setIsLoggedIn(true)
  }

  const handleSignup = () => {
    console.log("Signup clicked")
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    console.log("Logout clicked")
    setIsLoggedIn(false)
  }

  // 模拟用户数据
  const user = {
    name: language === 'zh' ? "张先生" : "Mr. Zhang",
    email: "zhang@example.com",
    tier: "free",
    avatar: "/placeholder-user.jpg"
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

            {/* 用户菜单 */}
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.tier === 'premium' ? 'default' : 'secondary'} className="text-xs">
                        {user.tier === 'premium' ? (
                          <>
                            <Crown className="h-3 w-3 mr-1" />
                            {language === 'zh' ? '高级版' : 'Premium'}
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3 mr-1" />
                            {language === 'zh' ? '免费版' : 'Free'}
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    {language === 'zh' ? '个人资料' : 'Profile'}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    {language === 'zh' ? '设置' : 'Settings'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {language === 'zh' ? '退出登录' : 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{language === 'zh' ? '用户' : 'User'}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleLogin}>
                    <LogIn className="h-4 w-4 mr-2" />
                    {language === 'zh' ? '登录' : 'Login'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignup}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {language === 'zh' ? '免费注册' : 'Free Register'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
                
                {/* 移动端用户菜单 */}
                {isLoggedIn ? (
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-xs">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleLogout}
                      className="flex-1"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {language === 'zh' ? '退出登录' : 'Logout'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 flex-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleLogin}
                      className="flex-1"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      {language === 'zh' ? '登录' : 'Login'}
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSignup}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {language === 'zh' ? '注册' : 'Register'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
