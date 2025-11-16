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
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AIPricingSuggestion, AIChatbot, AIInsightCard } from './ai-components';
import { RevenueChart } from './chart-components';
import { 
  Camera, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Plus,
  Edit,
  Trash2,
  Eye,
  Check,
  X,
  Upload,
  AlertTriangle,
  BarChart3,
  Clock,
  Sparkles,
  Bot,
  Brain
} from 'lucide-react';

interface LenderScreensProps {
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
}

export function LenderScreens({ currentScreen, setCurrentScreen }: LenderScreensProps) {
  const [isAddingGear, setIsAddingGear] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [showAIPricing, setShowAIPricing] = useState(false);

  const mockInventory = [
    {
      id: 1,
      name: 'Canon EOS R5',
      category: 'Camera Body',
      dailyRate: 75,
      status: 'active',
      totalBookings: 23,
      revenue: 1725,
      rating: 4.8,
      condition: 'excellent'
    },
    {
      id: 2,
      name: 'Sony FX6',
      category: 'Video Camera',
      dailyRate: 150,
      status: 'rented',
      totalBookings: 15,
      revenue: 2250,
      rating: 4.9,
      condition: 'good'
    },
    {
      id: 3,
      name: 'Canon 24-70mm f/2.8',
      category: 'Lens',
      dailyRate: 45,
      status: 'pending',
      totalBookings: 0,
      revenue: 0,
      rating: 0,
      condition: 'excellent'
    }
  ];

  const mockRequests = [
    {
      id: 1,
      renter: 'Alex Johnson',
      item: 'Canon EOS R5',
      dates: 'Dec 20-22, 2024',
      amount: 225,
      renterRating: 4.9,
      message: 'Need this for a wedding shoot. Will take excellent care of it.',
      requestedAt: '2 hours ago'
    },
    {
      id: 2,
      renter: 'Sarah Miller',
      item: 'Sony FX6',
      dates: 'Dec 25-27, 2024',
      amount: 450,
      renterRating: 4.7,
      message: 'Documentary project, very experienced with Sony cameras.',
      requestedAt: '5 hours ago'
    }
  ];

  const renderDashboard = () => (
    <div className="container px-4 py-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl">Lender Dashboard</h1>
          <p className="text-muted-foreground">Manage your gear and earnings</p>
        </div>
        <div className="flex space-x-2">
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => setCurrentScreen('add-gear')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Gear
          </Button>
          <Button variant="outline" onClick={() => setIsChatbotOpen(true)}>
            <Brain className="mr-2 h-4 w-4" />
            AI Insights
          </Button>
        </div>
      </div>

      {/* AI Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <AIInsightCard
          title="Demand Forecast"
          insight="Video equipment demand will spike 35% this weekend"
          trend="up"
          value="Weekend Rush"
          confidence={87}
        />
        <AIInsightCard
          title="Pricing Optimization"
          insight="Your Canon EOS R5 is priced 12% below market average"
          trend="up"
          value="+₹10/day potential"
          confidence={94}
        />
        <AIInsightCard
          title="Booking Pattern"
          insight="Thursday-Sunday bookings increased 23% this month"
          trend="up"
          value="Peak Season"
          confidence={76}
        />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Camera className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Listed Items</p>
                <p className="text-xl">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Rentals</p>
                <p className="text-xl">3</p>
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
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-xl">₹1,245</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-xl">4.8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Pending Requests
            <Badge className="bg-orange-100 text-orange-700">2 new</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRequests.slice(0, 2).map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>{request.renter.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4>{request.renter} wants to rent {request.item}</h4>
                    <p className="text-sm text-muted-foreground">{request.dates} • ₹{request.amount}</p>
                    <p className="text-sm text-muted-foreground">⭐ {request.renterRating} renter rating</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    <X className="mr-1 h-3 w-3" />
                    Decline
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <Check className="mr-1 h-3 w-3" />
                    Accept
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-4" onClick={() => setCurrentScreen('requests')}>
            View All Requests
          </Button>
        </CardContent>
      </Card>

      {/* Quick Inventory Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Your Gear
            <Button variant="ghost" size="sm" onClick={() => setCurrentScreen('inventory')}>
              Manage All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockInventory.slice(0, 3).map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <Camera className="h-12 w-12 text-gray-400" />
                </div>
                <h4 className="mb-1">{item.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
                <div className="flex items-center justify-between">
                  <span>₹{item.dailyRate}/day</span>
                  <Badge className={
                    item.status === 'active' ? 'bg-green-100 text-green-700' :
                    item.status === 'rented' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }>
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInventory = () => (
    <div className="container px-4 py-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl">My Gear</h1>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => setCurrentScreen('add-gear')}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockInventory.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative">
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <Camera className="h-16 w-16 text-gray-400" />
              </div>
              <Badge className={`absolute top-2 right-2 ${
                item.status === 'active' ? 'bg-green-100 text-green-700' :
                item.status === 'rented' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {item.status}
              </Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="mb-2">{item.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Daily Rate:</span>
                  <span>₹{item.dailyRate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Bookings:</span>
                  <span>{item.totalBookings}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Revenue:</span>
                  <span>₹{item.revenue}</span>
                </div>
                {item.rating > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Rating:</span>
                    <span>⭐ {item.rating}</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="mr-1 h-3 w-3" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAddGear = () => (
    <div className="container px-4 py-6 pb-20 md:pb-6 max-w-2xl">
      <h1 className="text-2xl mb-6">Add New Gear</h1>

      <form className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input id="name" placeholder="e.g., Canon EOS R5" />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="camera">Camera Bodies</SelectItem>
                  <SelectItem value="lens">Lenses</SelectItem>
                  <SelectItem value="video">Video Equipment</SelectItem>
                  <SelectItem value="lighting">Lighting</SelectItem>
                  <SelectItem value="audio">Audio Equipment</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe your item's features and condition..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-muted-foreground mb-2">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB (max 10 photos)</p>
              <Button variant="outline" className="mt-4">
                Choose Files
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="daily-rate">Daily Rate (₹)</Label>
                <div className="flex space-x-2">
                  <Input id="daily-rate" type="number" placeholder="75" />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAIPricing(!showAIPricing)}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="deposit">Security Deposit (₹)</Label>
                <Input id="deposit" type="number" placeholder="500" />
              </div>
            </div>

            {showAIPricing && (
              <AIPricingSuggestion
                itemCategory="Camera Body"
                itemCondition="excellent"
                location="New York, NY"
                onPriceSelect={(price) => {
                  // Handle price selection
                  setShowAIPricing(false);
                }}
              />
            )}

            <div>
              <Label htmlFor="condition">Condition</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="very-good">Very Good</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Delivery Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="pickup" />
                  <Label htmlFor="pickup">Pickup available</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="delivery" />
                  <Label htmlFor="delivery">Local delivery (additional fee)</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-4">
          <Button variant="outline" className="flex-1" onClick={() => setCurrentScreen('inventory')}>
            Cancel
          </Button>
          <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => setCurrentScreen('inventory')}>
            List Item
          </Button>
        </div>
      </form>
    </div>
  );

  const renderRequests = () => (
    <div className="container px-4 py-6 pb-20 md:pb-6">
      <h1 className="text-2xl mb-6">Booking Requests</h1>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          {mockRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>{request.renter.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div>
                        <h3>{request.renter}</h3>
                        <p className="text-sm text-muted-foreground">⭐ {request.renterRating} rating • {request.requestedAt}</p>
                      </div>
                      <div>
                        <h4>Wants to rent: {request.item}</h4>
                        <p className="text-sm text-muted-foreground">{request.dates}</p>
                        <p className="text-lg">₹{request.amount} total</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm">"{request.message}"</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Check className="mr-1 h-3 w-3" />
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                      <X className="mr-1 h-3 w-3" />
                      Decline
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Eye className="mr-1 h-3 w-3" />
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="approved">
          <p className="text-center text-muted-foreground py-8">No approved requests yet</p>
        </TabsContent>
        
        <TabsContent value="declined">
          <p className="text-center text-muted-foreground py-8">No declined requests yet</p>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderEarnings = () => (
    <div className="container px-4 py-6 pb-20 md:pb-6">
      <h1 className="text-2xl mb-6">Earnings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl">₹1,245</p>
              <p className="text-sm text-green-600">+15% from last month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Earned</p>
              <p className="text-2xl">₹8,950</p>
              <p className="text-sm text-muted-foreground">Since joining</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-2xl">₹745</p>
              <p className="text-sm text-muted-foreground">Ready for payout</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <RevenueChart />

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { item: 'Canon EOS R5', amount: 225, date: 'Dec 15, 2024', renter: 'Alex J.' },
              { item: 'Sony FX6', amount: 450, date: 'Dec 12, 2024', renter: 'Sarah M.' },
              { item: 'Canon 24-70mm', amount: 135, date: 'Dec 10, 2024', renter: 'Mike R.' }
            ].map((transaction, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4>{transaction.item}</h4>
                  <p className="text-sm text-muted-foreground">Rented by {transaction.renter}</p>
                  <p className="text-sm text-muted-foreground">{transaction.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg text-green-600">+₹{transaction.amount}</p>
                  <Badge className="bg-green-100 text-green-700">Completed</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  switch (currentScreen) {
    case 'dashboard':
      return renderDashboard();
    case 'inventory':
      return renderInventory();
    case 'add-gear':
      return renderAddGear();
    case 'requests':
      return renderRequests();
    case 'earnings':
      return (
        <>
          {renderEarnings()}
          <AIChatbot 
            isOpen={isChatbotOpen} 
            onClose={() => setIsChatbotOpen(false)} 
            userRole="lender" 
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
            userRole="lender" 
          />
        </>
      );
  }
}