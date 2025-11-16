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
import { Calendar } from './ui/calendar';
import { Slider } from './ui/slider';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AISearch, AIRecommendations, AIChatbot } from './ai-components';
import { 
  Camera, 
  Search, 
  Star, 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  CreditCard,
  CheckCircle,
  Upload,
  MessageCircle,
  Filter,
  Heart,
  Share,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  Bot,
  Phone
} from 'lucide-react';

interface RenterScreensProps {
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
}

export function RenterScreens({ currentScreen, setCurrentScreen }: RenterScreensProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [priceRange, setPriceRange] = useState([50, 500]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mockCameras = [
    {
      id: 1,
      name: 'Canon EOS R5',
      category: 'Camera Body',
      price: 75,
      rating: 4.8,
      reviews: 124,
      location: 'New York, NY',
      owner: 'John Smith',
      image: 'camera professional gear',
      available: true
    },
    {
      id: 2,
      name: 'Sony FX6 Cinema Camera',
      category: 'Video Camera',
      price: 150,
      rating: 4.9,
      reviews: 89,
      location: 'Los Angeles, CA',
      owner: 'Sarah Wilson',
      image: 'video camera cinema',
      available: true
    },
    {
      id: 3,
      name: 'DJI Ronin 4D',
      category: 'Gimbal',
      price: 200,
      rating: 4.7,
      reviews: 56,
      location: 'Chicago, IL',
      owner: 'Mike Johnson',
      image: 'camera gimbal stabilizer',
      available: false
    }
  ];

  const mockBookings = [
    {
      id: 1,
      camera: 'Canon EOS R5',
      dates: 'Dec 15-17, 2024',
      status: 'active',
      price: 225,
      pickup: 'Tomorrow 10:00 AM'
    },
    {
      id: 2,
      camera: 'Sony A7S III',
      dates: 'Dec 20-22, 2024',
      status: 'upcoming',
      price: 180,
      pickup: 'Dec 20, 9:00 AM'
    }
  ];

  const renderDashboard = () => (
    <div className="container px-4 py-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl">Welcome back, Alex!</h1>
          <p className="text-muted-foreground">Ready to capture something amazing?</p>
        </div>
        <div className="flex space-x-2">
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setCurrentScreen('search')}>
            <Search className="mr-2 h-4 w-4" />
            Find Gear
          </Button>
          <Button variant="outline" onClick={() => setIsChatbotOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            AI Assistant
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                <Camera className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Rentals</p>
                <p className="text-xl">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Star className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Rating</p>
                <p className="text-xl">4.9</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-xl">18</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Bookings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Active Bookings
            <Button variant="ghost" size="sm" onClick={() => setCurrentScreen('bookings')}>
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockBookings.filter(b => b.status === 'active').map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Camera className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <h4>{booking.camera}</h4>
                    <p className="text-sm text-muted-foreground">{booking.dates}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-teal-100 text-teal-700">Active</Badge>
                  <p className="text-sm text-muted-foreground mt-1">Pickup: {booking.pickup}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <AIRecommendations 
        userRole="renter" 
        userHistory={[]} 
        onItemClick={() => setCurrentScreen('item-detail')} 
      />
    </div>
  );

  const renderSearch = () => (
    <div className="container px-4 py-6 pb-20 md:pb-6">
      <div className="mb-6">
        <h1 className="text-2xl mb-4">Find Your Perfect Gear</h1>
        
        {/* AI Search Bar */}
        <div className="mb-4">
          <AISearch 
            onSearch={(query) => setSearchQuery(query)}
            placeholder="Describe what you need... 'Canon for wedding photography'"
          />
        </div>
        
        {searchQuery && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-700">
                Showing AI-powered results for: "{searchQuery}"
              </span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="camera">Camera Bodies</SelectItem>
              <SelectItem value="lens">Lenses</SelectItem>
              <SelectItem value="video">Video Equipment</SelectItem>
              <SelectItem value="accessories">Accessories</SelectItem>
            </SelectContent>
          </Select>
          
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nyc">New York City</SelectItem>
              <SelectItem value="la">Los Angeles</SelectItem>
              <SelectItem value="chicago">Chicago</SelectItem>
              <SelectItem value="sf">San Francisco</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="justify-start">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Select Dates
          </Button>

          <div className="space-y-2">
            <Label>Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}</Label>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={1000}
              min={10}
              step={10}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCameras.map((camera) => (
          <Card key={camera.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setCurrentScreen('item-detail')}>
            <div className="relative">
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <Camera className="h-16 w-16 text-gray-400" />
              </div>
              <Button variant="ghost" size="sm" className="absolute top-2 right-2 bg-white/80 hover:bg-white">
                <Heart className="h-4 w-4" />
              </Button>
              {!camera.available && (
                <Badge className="absolute top-2 left-2 bg-red-100 text-red-700">Unavailable</Badge>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="mb-2">{camera.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{camera.category}</p>
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{camera.rating}</span>
                <span className="text-sm text-muted-foreground">({camera.reviews} reviews)</span>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{camera.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg">₹{camera.price}/day</span>
                <span className="text-sm text-muted-foreground">by {camera.owner}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderItemDetail = () => (
    <div className="container px-4 py-6 pb-20 md:pb-6">
      <Button variant="ghost" onClick={() => setCurrentScreen('search')} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Search
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <Camera className="h-24 w-24 text-gray-400" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full h-20 bg-gray-100 rounded border-2 border-transparent hover:border-teal-500 cursor-pointer flex items-center justify-center">
                <Camera className="h-6 w-6 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl mb-2">Canon EOS R5</h1>
            <p className="text-muted-foreground mb-4">Professional Mirrorless Camera Body</p>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span>4.8</span>
                <span className="text-muted-foreground">(124 reviews)</span>
              </div>
              <Badge className="bg-green-100 text-green-700">Available</Badge>
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">New York, NY</span>
            </div>
          </div>

          {/* Owner */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <div>
                  <h4>John Smith</h4>
                  <p className="text-sm text-muted-foreground">Professional photographer • 4.9 ⭐</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Resolution:</span>
                  <span className="ml-2">45MP</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Video:</span>
                  <span className="ml-2">8K 30fps</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Mount:</span>
                  <span className="ml-2">Canon RF</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Weight:</span>
                  <span className="ml-2">650g</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <span className="text-3xl">₹75</span>
                <span className="text-muted-foreground">/day</span>
                <p className="text-sm text-muted-foreground mt-1">₹500 security deposit required</p>
              </div>
              <Button className="w-full mt-4 bg-teal-600 hover:bg-teal-700" 
                      onClick={() => setCurrentScreen('booking-dates')}>
                Book Now
              </Button>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" className="flex-1">
                  <Heart className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderBookingDates = () => (
    <div className="container px-4 py-6 pb-20 md:pb-6">
      <Button variant="ghost" onClick={() => setCurrentScreen('item-detail')} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Item
      </Button>

      <h1 className="text-2xl mb-6">Select Rental Dates</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar 
              mode="multiple"
              selected={selectedDates}
              onSelect={setSelectedDates as any}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rental Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                <Camera className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h4>Canon EOS R5</h4>
                <p className="text-sm text-muted-foreground">by John Smith</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Rental period:</span>
                <span>3 days</span>
              </div>
              <div className="flex justify-between">
                <span>Daily rate:</span>
                <span>₹75/day</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹225</span>
              </div>
              <div className="flex justify-between">
                <span>Service fee:</span>
                <span>₹22.50</span>
              </div>
              <div className="flex justify-between">
                <span>Security deposit:</span>
                <span>₹500</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span>Total:</span>
                <span>₹747.50</span>
              </div>
              <p className="text-xs text-muted-foreground">Security deposit will be refunded after safe return</p>
            </div>

            <Button className="w-full bg-teal-600 hover:bg-teal-700"
                    onClick={() => setCurrentScreen('payment')}>
              Continue to Payment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="container px-4 py-6 pb-20 md:pb-6">
      <Button variant="ghost" onClick={() => setCurrentScreen('booking-dates')} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Booking
      </Button>

      <h1 className="text-2xl mb-6">Payment Details</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input id="card-number" placeholder="1234 5678 9012 3456" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name-on-card">Name on Card</Label>
                <Input id="name-on-card" placeholder="John Doe" />
              </div>

              <Separator />

              <div className="space-y-3">
                <h4>Alternative Payment Methods</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="mr-2 h-4 w-4" />
                    PayPal
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Apple Pay
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Google Pay
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                <Camera className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h4>Canon EOS R5</h4>
                <p className="text-sm text-muted-foreground">by John Smith</p>
                <p className="text-sm text-muted-foreground">Dec 15-17, 2024</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Rental (3 days)</span>
                <span>₹225.00</span>
              </div>
              <div className="flex justify-between">
                <span>Service fee</span>
                <span>₹22.50</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹19.80</span>
              </div>
              <div className="flex justify-between">
                <span>Security deposit</span>
                <span>₹500.00</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span>Total</span>
                <span>₹767.30</span>
              </div>
              <p className="text-xs text-muted-foreground">Security deposit will be refunded after safe return</p>
            </div>

            <Button className="w-full bg-teal-600 hover:bg-teal-700" 
                    onClick={() => setCurrentScreen('booking-confirmation')}>
              <CreditCard className="mr-2 h-4 w-4" />
              Complete Payment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderBookingConfirmation = () => (
    <div className="container px-4 py-6 pb-20 md:pb-6">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <div>
          <h1 className="text-2xl mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground">Your rental request has been sent to the lender</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-left space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3>Canon EOS R5</h3>
                  <p className="text-sm text-muted-foreground">by John Smith</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Booking ID:</span>
                  <p>REN-2024-001</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Dates:</span>
                  <p>Dec 15-17, 2024</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Paid:</span>
                  <p>₹767.30</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className="bg-yellow-100 text-yellow-700">Pending Approval</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-sm text-muted-foreground space-y-2">
          <p>Next steps:</p>
          <ul className="text-left list-disc list-inside space-y-1">
            <li>The lender will review your request within 24 hours</li>
            <li>You'll receive an email confirmation once approved</li>
            <li>Pickup details will be shared after approval</li>
          </ul>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" onClick={() => setCurrentScreen('bookings')}>
            View All Bookings
          </Button>
          <Button className="flex-1 bg-teal-600 hover:bg-teal-700" onClick={() => setCurrentScreen('dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );

  const renderReturnFlow = () => (
    <div className="container px-4 py-6 pb-20 md:pb-6">
      <h1 className="text-2xl mb-6">Return Item</h1>

      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
              <Camera className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3>Canon EOS R5</h3>
              <p className="text-sm text-muted-foreground">by John Smith</p>
              <p className="text-sm text-muted-foreground">Rental period: Dec 15-17, 2024</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-base mb-3 block flex items-center">
                Upload Return Photos
                <Badge className="ml-2 bg-blue-100 text-blue-700">
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI Powered
                </Badge>
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                Our AI will automatically scan for any damage and verify the equipment condition
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-muted-foreground">Front view</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Upload Photo
                  </Button>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-muted-foreground">Back view</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Upload Photo
                  </Button>
                </div>
              </div>

              {/* AI Analysis Results (shown after upload simulation) */}
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">AI Analysis Complete</span>
                </div>
                <p className="text-sm text-green-600">
                  ✓ No damage detected • ✓ All components present • ✓ Condition matches original photos
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="return-notes">Return Notes (Optional)</Label>
              <Textarea 
                id="return-notes" 
                placeholder="Any issues or notes about the equipment condition..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Return Method</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="radio" id="pickup" name="return-method" className="text-teal-600" />
                  <Label htmlFor="pickup">Lender pickup (Free)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="radio" id="dropoff" name="return-method" className="text-teal-600" />
                  <Label htmlFor="dropoff">Drop off at agreed location</Label>
                </div>
              </div>
            </div>
          </div>

          <Button className="w-full bg-teal-600 hover:bg-teal-700" 
                  onClick={() => setCurrentScreen('bookings')}>
            Submit Return Request
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderSupport = () => (
    <div className="container px-4 py-6 pb-20 md:pb-6">
      <h1 className="text-2xl mb-6">Support & Help</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="support-subject">Subject</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booking">Booking Issues</SelectItem>
                    <SelectItem value="payment">Payment Problems</SelectItem>
                    <SelectItem value="equipment">Equipment Issues</SelectItem>
                    <SelectItem value="account">Account Problems</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-message">Message</Label>
                <Textarea 
                  id="support-message"
                  placeholder="Describe your issue in detail..."
                  rows={4}
                />
              </div>

              <Button className="w-full bg-teal-600 hover:bg-teal-700">
                <MessageCircle className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Help</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <p className="text-sm">How do I cancel a booking?</p>
                    <p className="text-xs text-muted-foreground">Learn about cancellation policies</p>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <p className="text-sm">What if equipment is damaged?</p>
                    <p className="text-xs text-muted-foreground">Damage claims and insurance</p>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <p className="text-sm">Payment and refund issues</p>
                    <p className="text-xs text-muted-foreground">Billing and refund process</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                For urgent issues during rentals:
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Support: +1 (555) 123-RENT
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setIsChatbotOpen(true)}>
                  <Bot className="mr-2 h-4 w-4" />
                  AI Assistant (24/7)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="container px-4 py-6 pb-20 md:pb-6">
      <h1 className="text-2xl mb-6">My Bookings</h1>

      <div className="space-y-4">
        {mockBookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              <Camera className="h-8 w-8 text-gray-400" />
            </div>
                  <div>
                    <h3>{booking.camera}</h3>
                    <p className="text-muted-foreground">{booking.dates}</p>
                    <p className="text-sm text-muted-foreground">₹{booking.price} total</p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Badge className={
                    booking.status === 'active' 
                      ? 'bg-teal-100 text-teal-700' 
                      : 'bg-blue-100 text-blue-700'
                  }>
                    {booking.status === 'active' ? 'Active' : 'Upcoming'}
                  </Badge>
                  {booking.status === 'active' && (
                    <Button size="sm" onClick={() => setCurrentScreen('return-flow')}>
                      Return Item
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  switch (currentScreen) {
    case 'dashboard':
      return renderDashboard();
    case 'search':
      return renderSearch();
    case 'item-detail':
      return renderItemDetail();
    case 'booking-dates':
      return renderBookingDates();
    case 'payment':
      return renderPayment();
    case 'booking-confirmation':
      return renderBookingConfirmation();
    case 'bookings':
      return renderBookings();
    case 'return-flow':
      return renderReturnFlow();
    case 'support':
      return (
        <>
          {renderSupport()}
          <AIChatbot 
            isOpen={isChatbotOpen} 
            onClose={() => setIsChatbotOpen(false)} 
            userRole="renter" 
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
            userRole="renter" 
          />
        </>
      );
  }
}