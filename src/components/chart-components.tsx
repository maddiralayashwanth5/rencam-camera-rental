import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Users,
  Camera,
  Calendar,
  MapPin,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

// Fake chart data generator
const generateRevenueData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map(month => ({
    month,
    revenue: Math.floor(Math.random() * 50000) + 20000,
    bookings: Math.floor(Math.random() * 500) + 200,
    growth: (Math.random() * 20) - 10 // -10% to +10%
  }));
};

const generateUserGrowthData = () => {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  return weeks.map(week => ({
    week,
    renters: Math.floor(Math.random() * 100) + 50,
    lenders: Math.floor(Math.random() * 50) + 25,
    total: Math.floor(Math.random() * 150) + 75
  }));
};

export function RevenueChart() {
  const data = generateRevenueData();
  const currentMonth = data[data.length - 1];
  const previousMonth = data[data.length - 2];
  const growth = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue * 100).toFixed(1);
  const isPositive = parseFloat(growth) > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Revenue Trend
          </div>
          <Badge className={isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
            {isPositive ? '+' : ''}{growth}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Fake bar chart visualization */}
          <div className="grid grid-cols-12 gap-1 h-32 items-end">
            {data.map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-sm"
                  style={{ height: `${(item.revenue / 70000) * 100}%` }}
                ></div>
                <span className="text-xs text-muted-foreground mt-1 rotate-45 origin-left">
                  {item.month}
                </span>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl">₹{currentMonth.revenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">This Month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl">{currentMonth.bookings}</p>
              <p className="text-sm text-muted-foreground">Bookings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl flex items-center justify-center">
                {isPositive ? (
                  <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500 mr-1" />
                )}
                {Math.abs(parseFloat(growth))}%
              </p>
              <p className="text-sm text-muted-foreground">Growth</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function UserGrowthChart() {
  const data = generateUserGrowthData();
  const totalUsers = data.reduce((sum, week) => sum + week.total, 0);
  const avgGrowth = (totalUsers / 4 / data[0].total * 100 - 100).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            User Growth
          </div>
          <Badge className="bg-blue-100 text-blue-700">
            Weekly Trend
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Fake area chart */}
          <div className="relative h-32">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-100 to-transparent rounded">
              <div className="flex items-end h-full justify-between px-2">
                {data.map((week, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="flex space-x-1 mb-1">
                      <div 
                        className="w-2 bg-blue-500 rounded-sm"
                        style={{ height: `${(week.renters / 150) * 80}px` }}
                      ></div>
                      <div 
                        className="w-2 bg-green-500 rounded-sm"
                        style={{ height: `${(week.lenders / 150) * 80}px` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground">{week.week}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm">Renters</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm">Lenders</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg">{totalUsers}</p>
              <p className="text-sm text-muted-foreground">Total New Users</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BookingTrendsChart() {
  const categories = [
    { name: 'Cameras', bookings: 342, growth: 12, color: 'bg-blue-500' },
    { name: 'Lenses', bookings: 289, growth: 8, color: 'bg-green-500' },
    { name: 'Video', bookings: 167, growth: 15, color: 'bg-purple-500' },
    { name: 'Audio', bookings: 134, growth: -3, color: 'bg-orange-500' },
    { name: 'Lighting', bookings: 98, growth: 22, color: 'bg-red-500' },
    { name: 'Accessories', bookings: 76, growth: 5, color: 'bg-yellow-500' }
  ];

  const maxBookings = Math.max(...categories.map(c => c.bookings));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Camera className="mr-2 h-5 w-5" />
          Category Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categories.map((category, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded ${category.color}`}></div>
                  <span className="text-sm">{category.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{category.bookings} bookings</span>
                  <Badge className={category.growth > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {category.growth > 0 ? '+' : ''}{category.growth}%
                  </Badge>
                </div>
              </div>
              <Progress value={(category.bookings / maxBookings) * 100} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function GeographicChart() {
  const locations = [
    { city: 'New York', users: 1247, bookings: 3421, revenue: 125000, growth: 15 },
    { city: 'Los Angeles', users: 1089, bookings: 2876, revenue: 98000, growth: 12 },
    { city: 'Chicago', users: 756, bookings: 1987, revenue: 76000, growth: 8 },
    { city: 'San Francisco', users: 634, bookings: 1654, revenue: 89000, growth: 18 },
    { city: 'Miami', users: 523, bookings: 1432, revenue: 67000, growth: 25 },
    { city: 'Austin', users: 445, bookings: 1234, revenue: 54000, growth: 32 }
  ];

  const maxRevenue = Math.max(...locations.map(l => l.revenue));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          Geographic Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {locations.map((location, i) => (
            <div key={i} className="p-3 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4>{location.city}</h4>
                  <p className="text-sm text-muted-foreground">{location.users} users</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700">
                  +{location.growth}%
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Bookings:</span>
                  <span className="ml-2">{location.bookings.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Revenue:</span>
                  <span className="ml-2">₹{(location.revenue / 1000).toFixed(0)}k</span>
                </div>
              </div>
              
              <Progress 
                value={(location.revenue / maxRevenue) * 100} 
                className="h-2 mt-2" 
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RealTimeActivityChart() {
  const activities = [
    { type: 'booking', user: 'Alex J.', item: 'Canon EOS R5', time: '2 min ago', icon: CheckCircle, color: 'text-green-500' },
    { type: 'listing', user: 'Sarah M.', item: 'Sony FX6', time: '5 min ago', icon: Camera, color: 'text-blue-500' },
    { type: 'return', user: 'Mike R.', item: 'Canon 24-70mm', time: '8 min ago', icon: Clock, color: 'text-orange-500' },
    { type: 'signup', user: 'Emma K.', item: 'New lender account', time: '12 min ago', icon: Users, color: 'text-purple-500' },
    { type: 'dispute', user: 'John D.', item: 'Damage claim', time: '15 min ago', icon: AlertTriangle, color: 'text-red-500' },
    { type: 'payment', user: 'Lisa W.', item: '₹245 payment', time: '18 min ago', icon: DollarSign, color: 'text-green-500' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Zap className="mr-2 h-5 w-5" />
            Real-Time Activity
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {activities.map((activity, i) => {
            const Icon = activity.icon;
            return (
              <div key={i} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg transition-colors">
                <Icon className={`h-4 w-4 ${activity.color}`} />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span> 
                    <span className="text-muted-foreground"> {activity.item}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function PredictiveAnalyticsChart() {
  const predictions = [
    {
      title: 'Weekend Demand',
      prediction: 'High booking volume expected',
      confidence: 89,
      impact: '+35% bookings',
      color: 'border-green-200 bg-green-50'
    },
    {
      title: 'Video Equipment Trend',
      prediction: 'Cinema cameras will peak next month',
      confidence: 76,
      impact: '+28% video rentals',
      color: 'border-blue-200 bg-blue-50'
    },
    {
      title: 'Pricing Opportunity',
      prediction: 'Canon lenses underpriced by 12%',
      confidence: 94,
      impact: '+₹15k potential revenue',
      color: 'border-purple-200 bg-purple-50'
    },
    {
      title: 'Seasonal Shift',
      prediction: 'Wedding season starting early',
      confidence: 82,
      impact: '+42% portrait gear demand',
      color: 'border-orange-200 bg-orange-50'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          AI Predictions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {predictions.map((pred, i) => (
            <div key={i} className={`p-3 border-l-4 rounded ${pred.color}`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm">{pred.title}</h4>
                <Badge variant="outline" className="text-xs">
                  {pred.confidence}% confidence
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{pred.prediction}</p>
              <p className="text-xs font-medium">{pred.impact}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}