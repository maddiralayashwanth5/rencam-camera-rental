import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Sparkles, 
  Bot, 
  Brain, 
  TrendingUp, 
  Zap, 
  MessageCircle,
  ChevronRight,
  Search,
  Star,
  MapPin,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface AISearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function AISearch({ onSearch, placeholder = "Search with AI..." }: AISearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isAIActive, setIsAIActive] = useState(false);

  const aiSuggestions = [
    "Canon cameras for wedding photography",
    "Affordable lenses under $50/day in NYC",
    "Professional video equipment this weekend",
    "Vintage film cameras near me",
    "Drone equipment for outdoor shoot",
    "Studio lighting kit for portraits"
  ];

  useEffect(() => {
    if (query.length > 2) {
      setIsAIActive(true);
      // Simulate AI processing
      setTimeout(() => {
        const filtered = aiSuggestions.filter(s => 
          s.toLowerCase().includes(query.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 4));
      }, 300);
    } else {
      setIsAIActive(false);
      setSuggestions([]);
    }
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    onSearch(searchQuery);
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            {isAIActive && (
              <Sparkles className="h-3 w-3 text-blue-500 animate-pulse" />
            )}
          </div>
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
            className="pl-12"
          />
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          onClick={() => handleSearch(query)}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          AI Search
        </Button>
      </div>
      
      {suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
          <CardContent className="p-2">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 px-2 py-1 text-xs text-muted-foreground">
                <Bot className="h-3 w-3" />
                <span>AI Suggestions</span>
              </div>
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  className="w-full text-left px-2 py-2 hover:bg-muted rounded text-sm"
                  onClick={() => handleSearch(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface AIRecommendationsProps {
  userRole: 'renter' | 'lender';
  userHistory?: any[];
  onItemClick: (item: any) => void;
}

export function AIRecommendations({ userRole, userHistory = [], onItemClick }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mockRecommendations = [
    {
      id: 1,
      name: 'Canon EOS R6 Mark II',
      category: 'Camera Body',
      price: 85,
      aiScore: 95,
      reason: 'Perfect for your portrait photography style',
      location: 'New York, NY',
      rating: 4.9,
      reviews: 87,
      tags: ['Popular', 'AI Match']
    },
    {
      id: 2,
      name: 'Sony FX30',
      category: 'Video Camera',
      price: 120,
      aiScore: 89,
      reason: 'Trending in your area for documentary work',
      location: 'Brooklyn, NY',
      rating: 4.7,
      reviews: 43,
      tags: ['Trending', 'Location Match']
    },
    {
      id: 3,
      name: 'DJI Mavic 3 Pro',
      category: 'Drone',
      price: 200,
      aiScore: 88,
      reason: 'High demand this season',
      location: 'Manhattan, NY',
      rating: 4.8,
      reviews: 156,
      tags: ['High Demand', 'Premium']
    }
  ];

  useEffect(() => {
    // Simulate AI processing
    setTimeout(() => {
      setRecommendations(mockRecommendations);
      setIsLoading(false);
    }, 1500);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5 text-blue-500 animate-pulse" />
            AI is analyzing your preferences...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-4">
                  <div className="w-16 h-16 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-blue-500" />
            AI Recommendations
          </div>
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            Powered by AI
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onItemClick(item)}
            >
              <div className="flex space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="mb-1">{item.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{item.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{item.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          <Brain className="mr-1 h-2 w-2" />
                          {item.aiScore}% match
                        </Badge>
                        {item.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg">${item.price}/day</span>
                    </div>
                  </div>
                  <Alert className="mt-3 bg-blue-50 border-blue-200">
                    <Zap className="h-3 w-3 text-blue-600" />
                    <AlertDescription className="text-xs text-blue-700">
                      {item.reason}
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface AIPricingSuggestionProps {
  itemCategory: string;
  itemCondition: string;
  location: string;
  onPriceSelect: (price: number) => void;
}

export function AIPricingSuggestion({ itemCategory, itemCondition, location, onPriceSelect }: AIPricingSuggestionProps) {
  const [suggestion, setSuggestion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate AI pricing analysis
    setTimeout(() => {
      setSuggestion({
        recommendedPrice: 75,
        priceRange: { min: 65, max: 85 },
        confidence: 94,
        factors: [
          { factor: 'Local market demand', impact: '+$10', positive: true },
          { factor: 'Equipment condition', impact: '+$5', positive: true },
          { factor: 'Seasonal trends', impact: '-$2', positive: false },
          { factor: 'Competition analysis', impact: '+$3', positive: true }
        ],
        marketInsights: 'Similar items in your area rent for $65-85/day. High demand expected this month.'
      });
      setIsLoading(false);
    }, 2000);
  }, [itemCategory, itemCondition, location]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="mr-2 h-5 w-5 text-green-500 animate-pulse" />
            AI is analyzing market data...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-green-500" />
            AI Pricing Suggestion
          </div>
          <Badge className="bg-green-500 text-white">
            {suggestion.confidence}% confidence
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl text-green-600 mb-2">
            ${suggestion.recommendedPrice}/day
          </div>
          <p className="text-sm text-muted-foreground">
            Optimal price range: ${suggestion.priceRange.min} - ${suggestion.priceRange.max}
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm">Price Factors:</h4>
          {suggestion.factors.map((factor: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{factor.factor}</span>
              <span className={factor.positive ? 'text-green-600' : 'text-red-600'}>
                {factor.impact}
              </span>
            </div>
          ))}
        </div>

        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {suggestion.marketInsights}
          </AlertDescription>
        </Alert>

        <div className="flex space-x-2">
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => onPriceSelect(suggestion.recommendedPrice)}
          >
            Use AI Price
          </Button>
          <Button variant="outline" className="flex-1">
            Set Custom Price
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'renter' | 'lender' | 'admin';
}

export function AIChatbot({ isOpen, onClose, userRole }: AIChatbotProps) {
  const [messages, setMessages] = useState<any[]>([
    {
      id: 1,
      type: 'ai',
      content: `Hi! I'm Rencam AI, your intelligent ${userRole} assistant. How can I help you today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');

  const quickActions = {
    renter: [
      'Find cameras for wedding photography',
      'Check availability this weekend',
      'What are popular lenses in my area?',
      'Help with booking process'
    ],
    lender: [
      'Optimize my pricing strategy',
      'Tips for better listings',
      'Market demand insights',
      'Rental income projections'
    ],
    admin: [
      'Platform usage statistics',
      'Fraud detection alerts',
      'User behavior analysis',
      'Revenue optimization tips'
    ]
  };

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: generateAIResponse(message, userRole),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const generateAIResponse = (message: string, role: string) => {
    const responses = {
      renter: [
        "Based on your location and preferences, I found 12 cameras perfect for wedding photography. Would you like me to show you the top-rated options?",
        "This weekend has great availability! I see 8 cameras and 15 lenses available in your area. What type of shoot are you planning?",
        "The Canon 85mm f/1.4 and Sony 24-70mm f/2.8 are trending in your area. Both have excellent reviews for portraits."
      ],
      lender: [
        "Your current pricing is 15% below market average. I recommend increasing your Canon EOS R5 to $85/day for optimal revenue.",
        "Adding more photos and detailed descriptions can increase booking rates by 40%. Would you like tips on photography?",
        "Camera bodies are in high demand this month. Consider adding more DSLR options to your inventory."
      ],
      admin: [
        "Platform usage increased 23% this month. Video equipment rentals are driving the most growth.",
        "I detected 3 potentially fraudulent accounts based on booking patterns. Would you like me to flag them for review?",
        "Users spend 65% more when they see AI recommendations. Consider featuring this on the homepage."
      ]
    };

    const roleResponses = responses[role as keyof typeof responses];
    return roleResponses[Math.floor(Math.random() * roleResponses.length)];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-white border rounded-lg shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <span>Rencam AI Assistant</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
          ×
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              message.type === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-muted'
            }`}>
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-t">
        <div className="flex flex-wrap gap-1 mb-2">
          {quickActions[userRole].slice(0, 2).map((action, i) => (
            <button
              key={i}
              className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted/80"
              onClick={() => handleSendMessage(action)}
            >
              {action}
            </button>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <Input
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(input)}
            className="text-sm"
          />
          <Button size="sm" onClick={() => handleSendMessage(input)}>
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface AIInsightCardProps {
  title: string;
  insight: string;
  trend: 'up' | 'down' | 'neutral';
  value?: string;
  confidence?: number;
}

export function AIInsightCard({ title, insight, trend, value, confidence }: AIInsightCardProps) {
  const trendIcons = {
    up: <TrendingUp className="h-4 w-4 text-green-500" />,
    down: <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />,
    neutral: <TrendingUp className="h-4 w-4 text-blue-500 rotate-90" />
  };

  const trendColors = {
    up: 'border-green-200 bg-green-50',
    down: 'border-red-200 bg-red-50',
    neutral: 'border-blue-200 bg-blue-50'
  };

  return (
    <Card className={`${trendColors[trend]} border-l-4`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <h4 className="text-sm">{title}</h4>
              {trendIcons[trend]}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{insight}</p>
            {value && (
              <div className="text-lg">{value}</div>
            )}
            {confidence && (
              <Badge variant="outline" className="text-xs">
                {confidence}% confidence
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}