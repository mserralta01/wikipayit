import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { ScrollArea } from '../../components/ui/scroll-area'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { 
  Users, Store, DollarSign, TrendingUp,
  Phone, Send, FileText, CheckCircle,
  RefreshCw, AlertCircle
} from 'lucide-react'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { 
  DocumentData, 
  QuerySnapshot,
  DocumentSnapshot 
} from 'firebase/firestore'

type MerchantStatus = 'lead' | 'phone' | 'offer' | 'underwriting' | 'documents' | 'approved'

type ActivityItem = {
  id: string
  user: {
    name: string
    email: string
    avatar?: string
  }
  action: string
  target: string
  timestamp: Date
  status: MerchantStatus
}

type DashboardStats = {
  totalMerchants: number
  pendingApplications: number
  monthlyRevenue: number
  totalLeads: number
  loading: boolean
  error: string | null
}

type StatusCount = {
  status: MerchantStatus
  count: number
}

const statusIcons = {
  lead: Users,
  phone: Phone,
  offer: Send,
  underwriting: TrendingUp,
  documents: FileText,
  approved: CheckCircle,
}

const statusColors = {
  lead: 'text-blue-500',
  phone: 'text-yellow-500',
  offer: 'text-purple-500',
  underwriting: 'text-orange-500',
  documents: 'text-indigo-500',
  approved: 'text-green-500',
}

// Add these interfaces for Firestore data
interface MerchantData {
  status: MerchantStatus
  // Add other merchant fields as needed
}

interface TransactionData {
  date: string
  amount: number
  // Add other transaction fields as needed
}

interface ActivityData {
  id: string
  user: {
    name: string
    email: string
    avatar?: string
  }
  action: string
  target: string
  timestamp: {
    toDate: () => Date
  }
  status: MerchantStatus
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMerchants: 0,
    pendingApplications: 0,
    monthlyRevenue: 0,
    totalLeads: 0,
    loading: true,
    error: null,
  })
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const fetchData = () => {
      try {
        // Listen to merchants collection for stats
        const merchantsUnsubscribe = onSnapshot(
          collection(db, 'merchants'),
          (snapshot: QuerySnapshot<DocumentData>) => {
            const merchants = snapshot.docs.map(doc => doc.data() as MerchantData)
            const approved = merchants.filter(m => m.status === 'approved').length
            const pending = merchants.filter(m => m.status !== 'approved').length
            
            setStats(prev => ({
              ...prev,
              totalMerchants: approved,
              pendingApplications: pending,
              loading: false,
              error: null,
            }))

            // Calculate status distribution
            const counts = ['lead', 'phone', 'offer', 'underwriting', 'documents', 'approved']
              .map(status => ({
                status: status as MerchantStatus,
                count: merchants.filter(m => m.status === status).length
              }))
            setStatusCounts(counts)
          }
        )

        // Listen to activities collection
        const activitiesUnsubscribe = onSnapshot(
          query(collection(db, 'activities'), orderBy('timestamp', 'desc'), limit(10)),
          (snapshot: QuerySnapshot<DocumentData>) => {
            const activities = snapshot.docs.map(doc => {
              const data = doc.data() as ActivityData
              const { id: _id, ...rest } = data
              return {
                id: doc.id,
                ...rest,
                timestamp: data.timestamp.toDate(),
              }
            })
            setActivities(activities)
          }
        )

        // Calculate monthly revenue from transactions
        const revenueUnsubscribe = onSnapshot(
          collection(db, 'transactions'),
          (snapshot: QuerySnapshot<DocumentData>) => {
            const currentMonth = new Date().getMonth()
            const transactions = snapshot.docs.map(doc => doc.data() as TransactionData)
            const revenue = transactions
              .filter(tx => new Date(tx.date).getMonth() === currentMonth)
              .reduce((sum, tx) => sum + (tx.amount || 0), 0)

            setStats(prev => ({
              ...prev,
              monthlyRevenue: revenue,
            }))
          }
        )

        return () => {
          merchantsUnsubscribe()
          activitiesUnsubscribe()
          revenueUnsubscribe()
        }
      } catch (error) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch dashboard data',
        }))
      }
    }

    fetchData()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // Trigger a refresh of the Firestore queries
      await Promise.all([
        // Add any additional refresh logic here
      ])
    } finally {
      setRefreshing(false)
    }
  }

  if (stats.error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <p className="text-lg font-medium text-red-500">{stats.error}</p>
      </div>
    )
  }

  const statCards = [
    {
      title: "Active Merchants",
      value: stats.loading ? '-' : stats.totalMerchants.toLocaleString(),
      icon: Store,
      description: "Currently processing",
    },
    {
      title: "Pending Applications",
      value: stats.loading ? '-' : stats.pendingApplications.toLocaleString(),
      icon: FileText,
      description: "Awaiting approval",
    },
    {
      title: "Monthly Revenue",
      value: stats.loading ? '-' : `$${(stats.monthlyRevenue / 1000).toFixed(1)}K`,
      icon: DollarSign,
      description: "Processing volume",
    },
    {
      title: "Total Leads",
      value: stats.loading ? '-' : (stats.totalMerchants + stats.pendingApplications).toLocaleString(),
      icon: Users,
      description: "All time leads",
    },
  ]

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Merchant Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusCounts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {activities.map((activity) => {
                  const StatusIcon = statusIcons[activity.status]
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-4 rounded-lg border p-4"
                    >
                      <Avatar>
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback>
                          {activity.user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user.name}</span>
                          {' '}{activity.action}{' '}
                          <Badge variant="outline" className={statusColors[activity.status]}>
                            {activity.target}
                          </Badge>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp.toLocaleString()}
                        </p>
                      </div>
                      <StatusIcon className={`h-5 w-5 ${statusColors[activity.status]}`} />
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 