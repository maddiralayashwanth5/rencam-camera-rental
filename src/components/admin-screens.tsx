import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { AIChatbot, AIInsightCard } from './ai-components';
import { 
  RevenueChart, 
  UserGrowthChart, 
  BookingTrendsChart, 
  GeographicChart, 
  RealTimeActivityChart,
  PredictiveAnalyticsChart
} from './chart-components';
import { 
  Users, 
  Camera, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  Eye, 
  Check, 
  X, 
  Ban,
  Shield,
  FileText,
  BarChart3,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Calendar,
  Clock,
  Brain,
  Sparkles,
  Bot,
  Zap
} from 'lucide-react';

interface AdminScreensProps {
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
}

export function AdminScreens({ currentScreen, setCurrentScreen }: AdminScreensProps) {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const mockUsers = [
    {
      id: 1,
      name: 'Alex Johnson',
      email: 'alex@example.com',
      type: 'renter',
      joinDate: '2024-01-15',
      status: 'active',
      rating: 4.9,
      totalBookings: 23,
      kycStatus: 'verified'
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      type: 'lender',
      joinDate: '2024-02-20',
      status: 'active',
      rating: 4.8,
      totalListings: 12,
      kycStatus: 'pending'
    },
    {
      id: 3,
      name: 'Mike Rodriguez',
      email: 'mike@example.com',
      type: 'renter',
      joinDate: '2024-03-10',
      status: 'suspended',
      rating: 3.2,
      totalBookings: 5,
      kycStatus: 'rejected'
    }
  ];

  const mockDisputes = [
    {
      id: 1,
      booking: 'BK-2024-001',
      renter: 'Alex Johnson',
      lender: 'Sarah Wilson',
      item: 'Canon EOS R5',
      issue: 'Damage claim',
      amount: 500,
      status: 'open',
      createdAt: '2024-12-15',
      priority: 'high'
    },
    {
      id: 2,
      booking: 'BK-2024-002',
      renter: 'Mike Rodriguez',
      lender: 'John Smith',
      item: 'Sony FX6',
      issue: 'Late return',
      amount: 150,
      status: 'investigating',
      createdAt: '2024-12-14',
      priority: 'medium'
    }
  ];

  const mockAnalytics = {
    totalUsers: 1250,
    activeRentals: 89,
    monthlyRevenue: 25600,
    pendingDisputes: 12,
    conversionRate: 68,
    avgBookingValue: 287
  };

  const renderDashboard = () => (
    <div className="container px-4 py-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl">Admin Dashboard</h1>
          <p className="text-muted-foreground">AI-powered platform insights and management</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsChatbotOpen(true)}>
            <Brain className="mr-2 h-4 w-4" />
            AI Analytics
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Alerts (3)
          </Button>
        </div>
      </div>

      {/* AI Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <AIInsightCard
          title="Fraud Detection"
          insight="AI detected 3 suspicious booking patterns requiring review"
          trend="down"
          value="3 flagged accounts"
          confidence={96}
        />
        <AIInsightCard
          title="Revenue Optimization"
          insight="Platform fees could be optimized to increase revenue by 8%"
          trend="up"
          value="+₹12k monthly potential"
          confidence={84}
        />
        <AIInsightCard
          title="User Behavior"
          insight="Mobile bookings increased 45% - optimize mobile experience"
          trend="up"
          value="Mobile-first trend"
          confidence={91}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-xl">{mockAnalytics.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Camera className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Rentals</p>
                <p className="text-xl">{mockAnalytics.activeRentals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-xl">₹{mockAnalytics.monthlyRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Disputes</p>
                <p className="text-xl">{mockAnalytics.pendingDisputes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart />
        <UserGrowthChart />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Disputes
              <Button variant="ghost" size="sm" onClick={() => setCurrentScreen('disputes')}>
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockDisputes.slice(0, 3).map((dispute) => (
                <div key={dispute.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="text-sm">{dispute.item}</h4>
                    <p className="text-xs text-muted-foreground">{dispute.issue} • ₹{dispute.amount}</p>
                  </div>
                  <Badge className={
                    dispute.priority === 'high' ? 'bg-red-100 text-red-700' :
                    dispute.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }>
                    {dispute.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Pending KYC Reviews
              <Button variant="ghost" size="sm" onClick={() => setCurrentScreen('users')}>
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUsers.filter(u => u.kycStatus === 'pending').map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm">{user.name}</h4>
                      <p className="text-xs text-muted-foreground">{user.type}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <RealTimeActivityChart />
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="container px-4 py-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl">User Management</h1>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search users..." className="pl-10 w-64" />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p>{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      user.type === 'lender' ? 'border-green-200 text-green-700' : 'border-blue-200 text-blue-700'
                    }>
                      {user.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      user.status === 'active' ? 'bg-green-100 text-green-700' :
                      user.status === 'suspended' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      user.kycStatus === 'verified' ? 'bg-green-100 text-green-700' :
                      user.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }>
                      {user.kycStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>⭐ {user.rating}</TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                        <Ban className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderDisputes = () => (
    <div className="container px-4 py-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl">Dispute Management</h1>
        <div className="flex space-x-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Disputes</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {mockDisputes.map((dispute) => (
          <Card key={dispute.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-4 flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3>Dispute #{dispute.booking}</h3>
                        <Badge className={
                          dispute.priority === 'high' ? 'bg-red-100 text-red-700' :
                          dispute.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }>
                          {dispute.priority} priority
                        </Badge>
                        <Badge className={
                          dispute.status === 'open' ? 'bg-red-100 text-red-700' :
                          dispute.status === 'investigating' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }>
                          {dispute.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{dispute.issue} • {dispute.item}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Renter:</span>
                          <span className="ml-2">{dispute.renter}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Lender:</span>
                          <span className="ml-2">{dispute.lender}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="ml-2 text-lg">₹{dispute.amount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <span className="ml-2">{dispute.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm mb-2">Evidence & Documentation</h4>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <FileText className="mr-1 h-3 w-3" />
                        View Messages
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-1 h-3 w-3" />
                        View Photos
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <Check className="mr-1 h-3 w-3" />
                    Resolve
                  </Button>
                  <Button size="sm" variant="outline">
                    <Shield className="mr-1 h-3 w-3" />
                    Investigate
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    <X className="mr-1 h-3 w-3" />
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="container px-4 py-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl">Analytics & Reports</h1>
        <div className="flex space-x-2">
          <Select defaultValue="30d">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-3xl">{mockAnalytics.conversionRate}%</p>
              <p className="text-sm text-green-600">+5% from last month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Avg Booking Value</p>
              <p className="text-3xl">₹{mockAnalytics.avgBookingValue}</p>
              <p className="text-sm text-green-600">+12% from last month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Platform Fee</p>
              <p className="text-3xl">12%</p>
              <p className="text-sm text-muted-foreground">Of total transactions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <BookingTrendsChart />
        <PredictiveAnalyticsChart />
      </div>

      {/* Geographic Distribution */}
      <GeographicChart />
    </div>
  );

  switch (currentScreen) {
    case 'dashboard':
      return renderDashboard();
    case 'users':
      return renderUsers();
    case 'disputes':
      return renderDisputes();
    case 'analytics':
      return (
        <>
          {renderAnalytics()}
          <AIChatbot 
            isOpen={isChatbotOpen} 
            onClose={() => setIsChatbotOpen(false)} 
            userRole="admin" 
          />
        </>
      );
    default:
      return (
        <>
          {renderDashboard()}
          <AIChatbot 
            isOpen={isChatbotOpen} 
            onClose={() => setIsChatbotOpen(false)} 
            userRole="admin" 
          />
        </>
      );
  }
}