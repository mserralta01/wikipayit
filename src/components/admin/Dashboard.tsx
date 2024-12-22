import React, { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Users, Store, DollarSign, TrendingUp,
  Phone, Send, FileText, CheckCircle, Bell
} from 'lucide-react'
import { merchantService } from '../../services/merchantService'
import { useQuery } from '@tanstack/react-query'
import { Activity, ActivityType } from '@/types/activity'
import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Timestamp } from 'firebase/firestore'

type MetricCardProps = {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

const MetricCard = ({ title, value, description, icon, trend }: MetricCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-8 w-8 text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
      {trend && (
        <div className={`text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {trend.isPositive ? '↑' : '↓'} {trend.value}% from last month
        </div>
      )}
    </CardContent>
  </Card>
)

const StatusColumn = ({ title, count, icon }: { title: string; count: number; icon: React.ReactNode }) => (
  <div className="rounded-lg bg-white p-4 shadow">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-gray-700">{title}</h3>
      <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
        {icon}
      </div>
    </div>
    <div className="text-2xl font-bold">{count}</div>
  </div>
)

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => merchantService.getDashboardMetrics()
  })

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => merchantService.getRecentActivity()
  })

  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (recentActivity) {
      const activities = recentActivity.map(activity => {
        const timestamp = activity.timestamp instanceof Timestamp
          ? activity.timestamp
          : Timestamp.fromDate(new Date(activity.timestamp));

        return {
          ...activity,
          timestamp,
          userId: activity.userId || '',
          merchantId: activity.merchantId || '',
          merchant: activity.merchant || { businessName: '' }
        } as Activity;
      });

      const sortedActivities = activities
        .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
        .slice(0, 10);

      setRecentActivities(sortedActivities);
    }
  }, [recentActivity]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard Overview</h1>
      
      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard
          title="Total Merchants"
          value={metrics?.totalMerchants || 0}
          description="Active processing accounts"
          icon={<Store className="h-8 w-8" />}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Pending Applications"
          value={metrics?.pendingApplications || 0}
          description="In underwriting or document review"
          icon={<FileText className="h-8 w-8" />}
        />
        <MetricCard
          title="Monthly Revenue"
          value={`$${((metrics?.monthlyRevenue || 0) / 1000).toFixed(1)}k`}
          description="Processing revenue this month"
          icon={<DollarSign className="h-8 w-8" />}
          trend={{ value: 8.2, isPositive: true }}
        />
        <MetricCard
          title="Active Leads"
          value={metrics?.activeLeads || 0}
          description="Leads in pipeline"
          icon={<Users className="h-8 w-8" />}
        />
      </div>

      {/* Pipeline Status */}
      <h2 className="text-xl font-semibold mb-4">Pipeline Status</h2>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mb-8">
        <StatusColumn title="Leads" count={12} icon={<Users className="h-5 w-5 text-blue-600" />} />
        <StatusColumn title="Phone Calls" count={8} icon={<Phone className="h-5 w-5 text-blue-600" />} />
        <StatusColumn title="Offer Sent" count={5} icon={<Send className="h-5 w-5 text-blue-600" />} />
        <StatusColumn title="Underwriting" count={3} icon={<FileText className="h-5 w-5 text-blue-600" />} />
        <StatusColumn title="Documents" count={2} icon={<FileText className="h-5 w-5 text-blue-600" />} />
        <StatusColumn title="Approved" count={1} icon={<CheckCircle className="h-5 w-5 text-green-600" />} />
      </div>

      {/* Recent Activity */}
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      <Card>
        <CardContent className="p-6">
          {activityLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-4">
              {recentActivities?.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {activity.merchant && <span className="font-medium">{activity.merchant.businessName} - </span>}
                      {formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function getActivityIcon(type: ActivityType): ReactNode {
  switch (type) {
    case 'status_change':
      return <TrendingUp className="h-5 w-5 text-blue-600" />
    case 'document_upload':
      return <FileText className="h-5 w-5 text-blue-600" />
    case 'new_application':
      return <Users className="h-5 w-5 text-blue-600" />
    case 'email_sent':
      return <Send className="h-5 w-5 text-blue-600" />
    case 'note':
      return <FileText className="h-5 w-5 text-blue-600" />
    default:
      return <Bell className="h-5 w-5 text-blue-600" />
  }
}     