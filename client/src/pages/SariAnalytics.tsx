/**
 * Sari AI Analytics Dashboard
 * Track AI performance and usage statistics
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Bot,
  MessageSquare,
  Mic,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function SariAnalytics() {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');

  // Mock data - في الإنتاج سيتم جلبها من API
  const stats = {
    totalConversations: 1247,
    totalMessages: 8934,
    voiceMessages: 342,
    avgResponseTime: 2.3,
    successRate: 94.5,
    activeToday: 156,
  };

  const dailyData = [
    { date: '01/12', conversations: 45, messages: 234, voice: 12 },
    { date: '02/12', conversations: 52, messages: 289, voice: 15 },
    { date: '03/12', conversations: 48, messages: 267, voice: 18 },
    { date: '04/12', conversations: 61, messages: 312, voice: 21 },
    { date: '05/12', conversations: 55, messages: 298, voice: 16 },
    { date: '06/12', conversations: 58, messages: 321, voice: 19 },
    { date: '07/12', conversations: 63, messages: 345, voice: 23 },
  ];

  const intentData = [
    { name: 'استفسار منتج', value: 45 },
    { name: 'استفسار سعر', value: 30 },
    { name: 'تحية', value: 15 },
    { name: 'شكر', value: 7 },
    { name: 'أخرى', value: 3 },
  ];

  const performanceData = [
    { metric: 'نسبة النجاح', value: 94.5 },
    { metric: 'رضا العملاء', value: 88.2 },
    { metric: 'دقة الردود', value: 91.7 },
    { metric: 'سرعة الاستجابة', value: 96.3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              إحصائيات ساري AI
            </h1>
            <p className="text-gray-600 mt-1">تحليل شامل لأداء الذكاء الاصطناعي</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">آخر 7 أيام</SelectItem>
                <SelectItem value="30">آخر 30 يوم</SelectItem>
                <SelectItem value="90">آخر 90 يوم</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">إجمالي المحادثات</p>
                <p className="text-3xl font-bold mt-1">{stats.totalConversations.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2 text-blue-100">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">+12% من الشهر الماضي</span>
                </div>
              </div>
              <MessageSquare className="h-12 w-12 text-blue-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">إجمالي الرسائل</p>
                <p className="text-3xl font-bold mt-1">{stats.totalMessages.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2 text-purple-100">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">+18% من الشهر الماضي</span>
                </div>
              </div>
              <Bot className="h-12 w-12 text-purple-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">الرسائل الصوتية</p>
                <p className="text-3xl font-bold mt-1">{stats.voiceMessages.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2 text-green-100">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">+25% من الشهر الماضي</span>
                </div>
              </div>
              <Mic className="h-12 w-12 text-green-200" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">متوسط وقت الاستجابة</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.avgResponseTime}s</p>
                <Badge variant="outline" className="mt-2 text-green-600 border-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  ممتاز
                </Badge>
              </div>
              <Clock className="h-12 w-12 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">نسبة النجاح</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.successRate}%</p>
                <Badge variant="outline" className="mt-2 text-green-600 border-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  عالي جداً
                </Badge>
              </div>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">نشط اليوم</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeToday}</p>
                <Badge variant="outline" className="mt-2 text-blue-600 border-blue-600">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                    مباشر
                  </div>
                </Badge>
              </div>
              <Bot className="h-12 w-12 text-blue-500" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">النشاط اليومي</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="conversations" stroke="#3b82f6" name="المحادثات" strokeWidth={2} />
                <Line type="monotone" dataKey="messages" stroke="#8b5cf6" name="الرسائل" strokeWidth={2} />
                <Line type="monotone" dataKey="voice" stroke="#10b981" name="الصوتيات" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Intent Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع نوايا العملاء</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={intentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {intentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Performance Metrics */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">مقاييس الأداء</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value >= 90 ? '#10b981' : entry.value >= 80 ? '#3b82f6' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">رؤى ذكية من ساري</h3>
              <div className="space-y-2 text-gray-700">
                <p>✨ <strong>أداء ممتاز:</strong> نسبة النجاح 94.5% أعلى من المتوسط بـ 12%</p>
                <p>📈 <strong>نمو مستمر:</strong> زيادة 18% في عدد الرسائل مقارنة بالشهر الماضي</p>
                <p>🎯 <strong>دقة عالية:</strong> 91.7% من الردود كانت دقيقة ومفيدة للعملاء</p>
                <p>⚡ <strong>سرعة فائقة:</strong> متوسط وقت الاستجابة 2.3 ثانية فقط</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
