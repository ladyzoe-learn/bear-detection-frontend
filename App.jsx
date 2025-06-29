import { useState, useEffect } from 'react'
import { Upload, Camera, BarChart3, Users, AlertTriangle, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import './App.css'

const API_BASE_URL = 'http://127.0.0.1:5000/api'

function App( ) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [detectionResult, setDetectionResult] = useState(null)
  const [statistics, setStatistics] = useState(null)
  const [recentDetections, setRecentDetections] = useState([])
  const [error, setError] = useState(null)

  // 載入統計資料
  useEffect(() => {
    fetchStatistics()
    fetchRecentDetections()
  }, [])

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/statistics`)
      const data = await response.json()
      if (data.success) {
        setStatistics(data.statistics)
      }
    } catch (error) {
      console.error('載入統計資料失敗:', error)
    }
  }

  const fetchRecentDetections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recent-detections?limit=10`)
      const data = await response.json()
      setRecentDetections(data)
    } catch (error) {
      console.error('載入最近偵測記錄失敗:', error)
      // 如果 API 失敗，使用模擬資料
      const mockDetections = [
        {
          id: 1,
          location: '台東縣海端鄉',
          detected_at: '2025-06-18T10:30:00',
          confidence: 0.85,
          bear_detected: true
        },
        {
          id: 2,
          location: '台東縣延平鄉',
          detected_at: '2025-06-18T08:15:00',
          confidence: 0.92,
          bear_detected: true
        },
        {
          id: 3,
          location: '台東縣卑南鄉',
          detected_at: '2025-06-17T16:45:00',
          confidence: 0.78,
          bear_detected: true
        }
      ]
      setRecentDetections(mockDetections)
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      setDetectionResult(null)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('image', selectedFile)
    formData.append('location', '台東縣')

    try {
      const response = await fetch(`${API_BASE_URL}/detect`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success === false) {
        throw new Error(data.error || '檢測失敗')
      }

      setDetectionResult({
        bear_detected: data.bear_detected,
        confidence: data.confidence,
        message: data.bear_detected 
          ? `在圖片中偵測到台灣黑熊！信心度: ${Math.round(data.confidence * 100)}%`
          : '未在圖片中偵測到台灣黑熊'
      })

      // 重新載入統計資料和最近記錄
      fetchStatistics()
      fetchRecentDetections()

    } catch (error) {
      console.error('檢測失敗:', error)
      setError(`檢測失敗: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('zh-TW')
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 標題列 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Camera className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">台灣黑熊偵測系統</h1>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              MVP版本
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="detection" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="detection">影像偵測</TabsTrigger>
            <TabsTrigger value="statistics">統計分析</TabsTrigger>
            <TabsTrigger value="history">偵測記錄</TabsTrigger>
          </TabsList>

          {/* 影像偵測頁面 */}
          <TabsContent value="detection" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  上傳影像進行偵測
                </CardTitle>
                <CardDescription>
                  請上傳相機拍攝的影像，系統將自動偵測是否有台灣黑熊出沒
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">點擊上傳</span> 或拖拽檔案到此處
                      </p>
                      <p className="text-xs text-gray-500">支援 PNG, JPG, JPEG 格式</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>

                {selectedFile && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-700">
                      已選擇檔案: {selectedFile.name}
                    </span>
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isUploading ? '偵測中...' : '開始偵測'}
                    </Button>
                  </div>
                )}

                {error && (
                  <Alert className="border-red-500 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertTitle>錯誤</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {detectionResult && (
                  <Alert className={detectionResult.bear_detected ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
                    <AlertTriangle className={`h-4 w-4 ${detectionResult.bear_detected ? 'text-red-500' : 'text-green-500'}`} />
                    <AlertTitle>
                      {detectionResult.bear_detected ? '⚠️ 偵測到台灣黑熊！' : '✅ 未偵測到黑熊'}
                    </AlertTitle>
                    <AlertDescription>
                      {detectionResult.message}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 統計分析頁面 */}
          <TabsContent value="statistics" className="space-y-6">
            {statistics && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">總偵測次數</CardTitle>
                      <Camera className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{statistics.total_detections}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">黑熊偵測次數</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{statistics.bear_detections}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">偵測成功率</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {statistics.total_detections > 0 
                          ? Math.round((statistics.bear_detections / statistics.total_detections) * 100)
                          : 0}%
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {statistics.daily_stats && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>每日偵測統計</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={statistics.daily_stats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>地點分佈統計</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={statistics.location_stats}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ location, percent }) => `${location} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="count"
                            >
                              {statistics.location_stats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* 偵測記錄頁面 */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  最近偵測記錄
                </CardTitle>
                <CardDescription>
                  顯示最近的黑熊偵測記錄
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDetections.map((detection) => (
                    <div key={detection.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${detection.bear_detected ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{detection.location}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDateTime(detection.detected_at)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={detection.bear_detected ? 'destructive' : 'secondary'}>
                          {detection.bear_detected ? '偵測到黑熊' : '無偵測'}
                        </Badge>
                        <div className="text-sm text-gray-500 mt-1">
                          信心度: {Math.round(detection.confidence * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App


