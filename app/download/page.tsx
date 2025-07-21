"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, CheckCircle, X, Zap, Shield, Clock, Users, Star, Crown } from "lucide-react"
import { useLanguage } from '@/contexts/LanguageContext'
import { toast } from "@/hooks/use-toast"

interface PricingPlan {
  id: string
  name: string
  price: number
  period: string
  features: string[]
  popular?: boolean
  recommended?: boolean
}

export default function DownloadPage() {
  const { language } = useLanguage()
  const [selectedPlan, setSelectedPlan] = useState<string>('free')
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)
  const [userOS, setUserOS] = useState<string>('')

  // 检测用户操作系统
  useState(() => {
    const platform = navigator.platform.toLowerCase()
    if (platform.includes('win')) setUserOS('windows')
    else if (platform.includes('mac')) setUserOS('mac')
    else if (platform.includes('linux')) setUserOS('linux')
  })

  const pricingPlans: PricingPlan[] = [
    {
      id: 'free',
      name: language === 'zh' ? '免费版' : 'Free',
      price: 0,
      period: language === 'zh' ? '永久' : 'Forever',
      features: [
        language === 'zh' ? '文件大小限制: 50MB' : 'File size limit: 50MB',
        language === 'zh' ? '基础加密算法' : 'Basic encryption algorithms',
        language === 'zh' ? '标准压缩' : 'Standard compression',
        language === 'zh' ? '网页版使用' : 'Web version access',
        language === 'zh' ? '社区支持' : 'Community support'
      ]
    },
    {
      id: 'pro',
      name: language === 'zh' ? '专业版' : 'Pro',
      price: 9.99,
      period: language === 'zh' ? '/月' : '/month',
      features: [
        language === 'zh' ? '文件大小限制: 2GB' : 'File size limit: 2GB',
        language === 'zh' ? '高级加密算法' : 'Advanced encryption algorithms',
        language === 'zh' ? '智能压缩' : 'Smart compression',
        language === 'zh' ? '客户端应用' : 'Desktop client app',
        language === 'zh' ? '批量处理' : 'Batch processing',
        language === 'zh' ? '优先支持' : 'Priority support',
        language === 'zh' ? '云同步' : 'Cloud sync'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: language === 'zh' ? '企业版' : 'Enterprise',
      price: 29.99,
      period: language === 'zh' ? '/月' : '/month',
      features: [
        language === 'zh' ? '无文件大小限制' : 'Unlimited file size',
        language === 'zh' ? '军用级加密' : 'Military-grade encryption',
        language === 'zh' ? '多级压缩' : 'Multi-level compression',
        language === 'zh' ? '团队协作' : 'Team collaboration',
        language === 'zh' ? 'API访问' : 'API access',
        language === 'zh' ? '24/7支持' : '24/7 support',
        language === 'zh' ? '自定义部署' : 'Custom deployment',
        language === 'zh' ? '审计日志' : 'Audit logs'
      ],
      recommended: true
    }
  ]

  const downloadLinks = {
    windows: {
      free: 'https://github.com/your-repo/securefiles-client/releases/latest/download/SecureFiles-Free-Windows.exe',
      pro: 'https://github.com/your-repo/securefiles-client/releases/latest/download/SecureFiles-Pro-Windows.exe',
      enterprise: 'https://github.com/your-repo/securefiles-client/releases/latest/download/SecureFiles-Enterprise-Windows.exe'
    },
    mac: {
      free: 'https://github.com/your-repo/securefiles-client/releases/latest/download/SecureFiles-Free-Mac.dmg',
      pro: 'https://github.com/your-repo/securefiles-client/releases/latest/download/SecureFiles-Pro-Mac.dmg',
      enterprise: 'https://github.com/your-repo/securefiles-client/releases/latest/download/SecureFiles-Enterprise-Mac.dmg'
    },
    linux: {
      free: 'https://github.com/your-repo/securefiles-client/releases/latest/download/SecureFiles-Free-Linux.AppImage',
      pro: 'https://github.com/your-repo/securefiles-client/releases/latest/download/SecureFiles-Pro-Linux.AppImage',
      enterprise: 'https://github.com/your-repo/securefiles-client/releases/latest/download/SecureFiles-Enterprise-Linux.AppImage'
    }
  }

  const handleDownload = async (plan: string) => {
    if (plan === 'free') {
      // 免费版直接下载
      downloadClientApp(plan)
    } else {
      // 付费版跳转到支付页面
      window.location.href = `/payment?plan=${plan}`
    }
  }

  const downloadClientApp = async (plan: string) => {
    setIsDownloading(true)
    setDownloadProgress(0)

    try {
      const os = userOS || 'windows'
      const downloadUrl = downloadLinks[os as keyof typeof downloadLinks]?.[plan as keyof typeof downloadLinks.windows]
      
      if (!downloadUrl) {
        throw new Error('Download link not available')
      }

      // 模拟下载进度
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + Math.random() * 10
        })
      }, 200)

      // 实际下载
      const response = await fetch(downloadUrl)
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `SecureFiles-${plan}-${os}.${os === 'mac' ? 'dmg' : os === 'windows' ? 'exe' : 'AppImage'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setDownloadProgress(100)
      toast({
        title: language === 'zh' ? '下载完成' : 'Download Complete',
        description: language === 'zh' ? '客户端应用下载成功' : 'Client app downloaded successfully',
        variant: "default",
      })

    } catch (error) {
      console.error('Download failed:', error)
      toast({
        title: language === 'zh' ? '下载失败' : 'Download Failed',
        description: language === 'zh' ? '请检查网络连接后重试' : 'Please check your connection and try again',
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
      setDownloadProgress(0)
    }
  }

  const getCurrentPlan = () => pricingPlans.find(plan => plan.id === selectedPlan)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {language === 'zh' ? '下载 SecureFiles 客户端' : 'Download SecureFiles Client'}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {language === 'zh' 
            ? '选择适合您需求的版本，享受更强大的文件处理能力' 
            : 'Choose the version that fits your needs and enjoy more powerful file processing capabilities'}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* 定价方案 */}
        <div className="lg:col-span-2">
          <Tabs value={selectedPlan} onValueChange={setSelectedPlan} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {pricingPlans.map(plan => (
                <TabsTrigger key={plan.id} value={plan.id} className="relative">
                  {plan.name}
                  {plan.popular && (
                    <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">
                      {language === 'zh' ? '热门' : 'Popular'}
                    </Badge>
                  )}
                  {plan.recommended && (
                    <Badge variant="default" className="absolute -top-2 -right-2 text-xs">
                      {language === 'zh' ? '推荐' : 'Recommended'}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {pricingPlans.map(plan => (
              <TabsContent key={plan.id} value={plan.id} className="mt-6">
                <Card className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''} ${plan.recommended ? 'ring-2 ring-purple-500' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <CardDescription>
                          {plan.price === 0 ? (
                            <span className="text-2xl font-bold text-green-600">
                              {language === 'zh' ? '免费' : 'Free'}
                            </span>
                          ) : (
                            <span className="text-2xl font-bold">
                              ${plan.price}
                              <span className="text-sm text-muted-foreground">{plan.period}</span>
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      {plan.popular && (
                        <Badge variant="secondary" className="text-sm">
                          <Star className="h-3 w-3 mr-1" />
                          {language === 'zh' ? '最受欢迎' : 'Most Popular'}
                        </Badge>
                      )}
                      {plan.recommended && (
                        <Badge variant="default" className="text-sm">
                          <Crown className="h-3 w-3 mr-1" />
                          {language === 'zh' ? '企业推荐' : 'Enterprise Choice'}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={() => handleDownload(plan.id)}
                      disabled={isDownloading}
                      className="w-full"
                      size="lg"
                    >
                      {isDownloading ? (
                        <>
                          <Download className="h-4 w-4 mr-2 animate-spin" />
                          {language === 'zh' ? '下载中...' : 'Downloading...'}
                        </>
                      ) : plan.price === 0 ? (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          {language === 'zh' ? '免费下载' : 'Free Download'}
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          {language === 'zh' ? '立即购买' : 'Get Started'}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* 下载进度和系统信息 */}
        <div className="space-y-6">
          {/* 下载进度 */}
          {isDownloading && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  {language === 'zh' ? '下载进度' : 'Download Progress'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={downloadProgress} className="w-full mb-2" />
                <p className="text-sm text-muted-foreground">
                  {Math.round(downloadProgress)}% {language === 'zh' ? '完成' : 'Complete'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 系统要求 */}
          <Card>
            <CardHeader>
              <CardTitle>{language === 'zh' ? '系统要求' : 'System Requirements'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">{language === 'zh' ? 'Windows' : 'Windows'}</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Windows 10 或更高版本</li>
                  <li>• 4GB RAM (推荐 8GB)</li>
                  <li>• 500MB 可用磁盘空间</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">{language === 'zh' ? 'macOS' : 'macOS'}</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• macOS 10.15 或更高版本</li>
                  <li>• 4GB RAM (推荐 8GB)</li>
                  <li>• 500MB 可用磁盘空间</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">{language === 'zh' ? 'Linux' : 'Linux'}</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Ubuntu 18.04+ / CentOS 7+</li>
                  <li>• 4GB RAM (推荐 8GB)</li>
                  <li>• 500MB 可用磁盘空间</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 版本对比 */}
          <Card>
            <CardHeader>
              <CardTitle>{language === 'zh' ? '版本对比' : 'Version Comparison'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{language === 'zh' ? '文件大小限制' : 'File Size Limit'}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">50MB</Badge>
                    <Badge variant="outline">2GB</Badge>
                    <Badge variant="outline">∞</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{language === 'zh' ? '加密算法' : 'Encryption'}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">基础</Badge>
                    <Badge variant="outline">高级</Badge>
                    <Badge variant="outline">军用级</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{language === 'zh' ? '客户端应用' : 'Desktop App'}</span>
                  <div className="flex gap-2">
                    <X className="h-4 w-4 text-red-500" />
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{language === 'zh' ? '批量处理' : 'Batch Processing'}</span>
                  <div className="flex gap-2">
                    <X className="h-4 w-4 text-red-500" />
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{language === 'zh' ? '技术支持' : 'Support'}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">社区</Badge>
                    <Badge variant="outline">优先</Badge>
                    <Badge variant="outline">24/7</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 常见问题 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{language === 'zh' ? '常见问题' : 'Frequently Asked Questions'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">
                {language === 'zh' ? '免费版和付费版有什么区别？' : 'What\'s the difference between free and paid versions?'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === 'zh' 
                  ? '免费版限制文件大小为50MB，仅支持基础功能。付费版支持更大文件、更多算法和客户端应用。'
                  : 'Free version limits file size to 50MB with basic features. Paid versions support larger files, more algorithms, and desktop client app.'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">
                {language === 'zh' ? '如何升级到付费版？' : 'How do I upgrade to a paid version?'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === 'zh' 
                  ? '选择付费方案后，系统会引导您完成支付流程，然后下载对应的客户端应用。'
                  : 'After selecting a paid plan, the system will guide you through the payment process, then download the corresponding client app.'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">
                {language === 'zh' ? '支持哪些操作系统？' : 'What operating systems are supported?'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === 'zh' 
                  ? '支持Windows 10+、macOS 10.15+和主流Linux发行版。'
                  : 'Supports Windows 10+, macOS 10.15+, and major Linux distributions.'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">
                {language === 'zh' ? '可以退款吗？' : 'Can I get a refund?'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === 'zh' 
                  ? '支持30天无理由退款，如果您对产品不满意，我们全额退款。'
                  : '30-day money-back guarantee. If you\'re not satisfied, we\'ll provide a full refund.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 