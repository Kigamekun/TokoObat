import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertCircle, Shield, User } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    role: 'staff'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication
    setTimeout(() => {
      if (credentials.username && credentials.password) {
        const userData = {
          id: 1,
          username: credentials.username,
          role: credentials.role,
          fullName: credentials.role === 'admin' ? 'Admin User' : 'Staff User'
        };
        onLogin(userData);
        toast.success(`Welcome, ${userData.fullName}!`);
      } else {
        toast.error('Please fill in all fields');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8 fade-in">
          <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-teal-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mitra Toko Obat</h1>
          <p className="text-lg font-medium text-teal-600 mb-1">JGroup</p>
          <p className="text-sm text-gray-600">Pharmacy Management System</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white shadow-xl border-0 fade-in">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-center text-gray-900">Sign In</h2>
              <p className="text-sm text-gray-600 text-center">Access your pharmacy dashboard</p>
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="username"
                  data-testid="username-input"
                  type="text"
                  placeholder="Enter your username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="pl-10 h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  data-testid="password-input"
                  type="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="pl-10 h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Role</Label>
              <Select value={credentials.role} onValueChange={(value) => setCredentials({ ...credentials, role: value })}>
                <SelectTrigger className="h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500" data-testid="role-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin (Owner)</SelectItem>
                  <SelectItem value="staff">Staff (Cashier)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              data-testid="login-button"
              disabled={isLoading}
              className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Demo Credentials */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-teal-600 mt-0.5" />
                <div className="text-sm text-teal-800">
                  <p className="font-medium mb-1">Demo Credentials:</p>
                  <p className="text-xs">Username: <code className="bg-white px-1 rounded">admin</code> | Password: <code className="bg-white px-1 rounded">password</code></p>
                  <p className="text-xs">Username: <code className="bg-white px-1 rounded">staff</code> | Password: <code className="bg-white px-1 rounded">password</code></p>
                </div>
              </div>
            </div>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600 fade-in">
          <p>&copy; 2024 Mitra Toko Obat JGroup. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
