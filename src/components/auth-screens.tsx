import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Camera, 
  Eye, 
  EyeOff, 
  Upload, 
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Shield,
  FileText,
  Building
} from 'lucide-react';

interface AuthScreensProps {
  currentRole: 'renter' | 'lender' | 'admin';
  onLogin: (userData: any) => void;
  roleColors: {
    renter: string;
    lender: string;
    admin: string;
  };
}

export function AuthScreens({ currentRole, onLogin, roleColors }: AuthScreensProps) {
  const [authStep, setAuthStep] = useState<'welcome' | 'login' | 'signup' | 'kyc' | 'verification'>('welcome');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    bankAccount: '',
    routingNumber: '',
    businessName: '',
    businessType: ''
  });
  const [kycStep, setKycStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: boolean}>({});

  const primaryColor = currentRole === 'renter' ? 'teal' : currentRole === 'lender' ? 'green' : 'orange';
  const gradientClass = roleColors[currentRole];

  const getRoleTitle = () => {
    switch (currentRole) {
      case 'renter': return 'Rent Amazing Gear';
      case 'lender': return 'List Your Equipment';
      case 'admin': return 'Super Admin Access';
      default: return 'Welcome';
    }
  };

  const getRoleDescription = () => {
    switch (currentRole) {
      case 'renter': return 'Access thousands of professional cameras and equipment from verified lenders in your area.';
      case 'lender': return 'Turn your camera equipment into passive income by renting to trusted photographers and creators.';
      case 'admin': return 'Exclusive super admin access with full platform oversight and management capabilities.';
      default: return '';
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (fileType: string) => {
    setUploadedFiles(prev => ({ ...prev, [fileType]: true }));
  };

  const renderWelcome = () => (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${gradientClass} flex items-center justify-center`}>
            <Camera className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl mb-2">Welcome to Rencam</h1>
            <Badge variant="outline" className={`${
              currentRole === 'renter' ? 'border-teal-200 text-teal-700 bg-teal-50' :
              currentRole === 'lender' ? 'border-green-200 text-green-700 bg-green-50' :
              'border-orange-200 text-orange-700 bg-orange-50'
            }`}>
              {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} Portal
            </Badge>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl">{getRoleTitle()}</h2>
            <p className="text-muted-foreground text-sm">{getRoleDescription()}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className={`w-full ${
              currentRole === 'renter' ? 'bg-teal-600 hover:bg-teal-700' :
              currentRole === 'lender' ? 'bg-green-600 hover:bg-green-700' :
              'bg-orange-600 hover:bg-orange-700'
            }`}
            onClick={() => setAuthStep('login')}
          >
            Sign In
          </Button>
          
          {currentRole !== 'admin' && (
            <>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setAuthStep('signup')}
              >
                Create Account
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="w-full">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderLogin = () => (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-4 left-4"
            onClick={() => setAuthStep('welcome')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-r ${gradientClass} flex items-center justify-center`}>
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl">Sign In</h1>
            <p className="text-muted-foreground text-sm">Welcome back to Rencam</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm">Remember me</Label>
            </div>
            <Button variant="link" size="sm" className="px-0 text-sm">
              Forgot password?
            </Button>
          </div>

          <Button 
            className={`w-full ${
              currentRole === 'renter' ? 'bg-teal-600 hover:bg-teal-700' :
              currentRole === 'lender' ? 'bg-green-600 hover:bg-green-700' :
              'bg-orange-600 hover:bg-orange-700'
            }`}
            onClick={() => {
              // Simulate login success
              onLogin({
                email: formData.email,
                role: currentRole,
                name: 'Demo User',
                verified: true
              });
            }}
          >
            Sign In
          </Button>

          {currentRole !== 'admin' && (
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Button 
                variant="link" 
                size="sm" 
                className="px-0 text-sm"
                onClick={() => setAuthStep('signup')}
              >
                Sign up
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSignup = () => (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-4 left-4"
            onClick={() => setAuthStep('welcome')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-r ${gradientClass} flex items-center justify-center`}>
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl">Create Account</h1>
            <p className="text-muted-foreground text-sm">
              {currentRole === 'admin' 
                ? 'Exclusive super admin access to Rencam platform'
                : `Join thousands of ${currentRole}s on Rencam`
              }
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signupEmail">Email</Label>
            <Input
              id="signupEmail"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signupPassword">Password</Label>
            <div className="relative">
              <Input
                id="signupPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms" className="text-sm">
              I agree to the <Button variant="link" size="sm" className="px-0 text-sm h-auto">Terms of Service</Button> and <Button variant="link" size="sm" className="px-0 text-sm h-auto">Privacy Policy</Button>
            </Label>
          </div>

          <Button 
            className={`w-full ${
              currentRole === 'renter' ? 'bg-teal-600 hover:bg-teal-700' :
              'bg-green-600 hover:bg-green-700'
            }`}
            onClick={() => setAuthStep('kyc')}
          >
            Create Account
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Button 
              variant="link" 
              size="sm" 
              className="px-0 text-sm"
              onClick={() => setAuthStep('login')}
            >
              Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderKYC = () => {
    const totalSteps = currentRole === 'lender' ? 4 : 3;
    const progress = (kycStep / totalSteps) * 100;

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${gradientClass} flex items-center justify-center`}>
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Step {kycStep} of {totalSteps}</p>
              </div>
            </div>
            <h1 className="text-2xl mb-2">Identity Verification</h1>
            <p className="text-muted-foreground">We need to verify your identity to ensure platform security and trust.</p>
            <Progress value={progress} className="mt-4" />
          </div>

          {kycStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main St"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ny">New York</SelectItem>
                        <SelectItem value="ca">California</SelectItem>
                        <SelectItem value="tx">Texas</SelectItem>
                        <SelectItem value="fl">Florida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    placeholder="10001"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  />
                </div>

                <Button 
                  className={`w-full ${
                    currentRole === 'renter' ? 'bg-teal-600 hover:bg-teal-700' :
                    'bg-green-600 hover:bg-green-700'
                  }`}
                  onClick={() => setKycStep(2)}
                >
                  Continue
                </Button>
              </CardContent>
            </Card>
          )}

          {kycStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Identity Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please upload clear photos of your government-issued ID. All information will be encrypted and secure.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label className="text-base mb-3 block">Driver's License or Passport (Front)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {uploadedFiles.idFront ? (
                        <div className="flex items-center justify-center space-x-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span>Document uploaded successfully</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-muted-foreground mb-2">Click to upload or drag and drop</p>
                          <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => handleFileUpload('idFront')}
                          >
                            Choose File
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base mb-3 block">Driver's License or Passport (Back)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {uploadedFiles.idBack ? (
                        <div className="flex items-center justify-center space-x-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span>Document uploaded successfully</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-muted-foreground mb-2">Click to upload or drag and drop</p>
                          <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => handleFileUpload('idBack')}
                          >
                            Choose File
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button variant="outline" className="flex-1" onClick={() => setKycStep(1)}>
                    Back
                  </Button>
                  <Button 
                    className={`flex-1 ${
                      currentRole === 'renter' ? 'bg-teal-600 hover:bg-teal-700' :
                      'bg-green-600 hover:bg-green-700'
                    }`}
                    onClick={() => setKycStep(3)}
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {kycStep === 3 && currentRole === 'lender' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name (Optional)</Label>
                  <Input
                    id="businessName"
                    placeholder="Your Business LLC"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="corporation">Corporation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Bank Account Number</Label>
                  <Input
                    id="bankAccount"
                    placeholder="Account number for payouts"
                    value={formData.bankAccount}
                    onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input
                    id="routingNumber"
                    placeholder="Bank routing number"
                    value={formData.routingNumber}
                    onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                  />
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your banking information is encrypted and will only be used for secure payouts.
                  </AlertDescription>
                </Alert>

                <div className="flex space-x-4">
                  <Button variant="outline" className="flex-1" onClick={() => setKycStep(2)}>
                    Back
                  </Button>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => setKycStep(4)}
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {((kycStep === 3 && currentRole === 'renter') || (kycStep === 4 && currentRole === 'lender')) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Verification Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-center">
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${gradientClass} flex items-center justify-center`}>
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <h2 className="text-xl mb-2">Verification Submitted!</h2>
                  <p className="text-muted-foreground">
                    We're reviewing your information. You'll receive an email within 24-48 hours with your verification status.
                  </p>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You can start using Rencam with limited features. Full access will be granted after verification approval.
                  </AlertDescription>
                </Alert>

                <Button 
                  className={`w-full ${
                    currentRole === 'renter' ? 'bg-teal-600 hover:bg-teal-700' :
                    'bg-green-600 hover:bg-green-700'
                  }`}
                  onClick={() => {
                    onLogin({
                      email: formData.email,
                      role: currentRole,
                      name: `${formData.firstName} ${formData.lastName}`,
                      verified: false,
                      kycPending: true
                    });
                  }}
                >
                  Continue to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  switch (authStep) {
    case 'welcome':
      return renderWelcome();
    case 'login':
      return renderLogin();
    case 'signup':
      return renderSignup();
    case 'kyc':
      return renderKYC();
    default:
      return renderWelcome();
  }
}