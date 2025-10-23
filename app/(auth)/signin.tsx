import React, { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useAuth } from '../../hooks/useAuth';
import { FloatingLabelInput } from '../../components/auth/FloatingLabelInput';
import { AuthTabs } from '../../components/auth/AuthTabs';
import { SocialLogin } from '../../components/auth/SocialLogin';
import { GradientButton } from '../../components/auth/GradientButton';
import { AuthError } from '../../types/auth';

interface ValidationErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function SignIn() {
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const { signIn: authSignIn, signUp: authSignUp } = useAuth();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSignupStep(1);
    setErrors({});
    if (tab === 'signin') {
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    }
  };

  const handleNextStep = useCallback(() => {
    const newErrors: ValidationErrors = {};

    if (signupStep === 1) {
      if (username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters long';
      }
    } else if (signupStep === 2) {
      if (!email) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      if (signupStep === 1 && username.length >= 3) {
        setSignupStep(2);
      } else if (signupStep === 2 && email) {
        setSignupStep(3);
      }
    }
  }, [signupStep, username, email]);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      const error = await authSignIn({ email, password });
      if (error) {
        setErrors({ [error.field || 'email']: error.message });
        return;
      }

      router.push('/(main)/home');
    } catch (error) {
      setErrors({ email: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      if (password !== confirmPassword) {
        setErrors({ confirmPassword: 'Passwords do not match' });
        return;
      }

      const error = await authSignUp({ email, password, username });
      if (error) {
        setErrors({ [error.field || 'email']: error.message });
        return;
      }

      router.push('/(auth)/onboarding/expertise');
    } catch (error) {
      setErrors({ email: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'signin') {
      await handleSignIn();
    } else {
      await handleSignUp();
    }
  };

  const togglePasswordVisibility = useCallback((field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  }, [showPassword, showConfirmPassword]);

  return (
    <View className="flex-1">
      <BlurView intensity={80} tint="dark" className="flex-1">
        <Animated.View 
          entering={FadeInDown.springify().damping(11)}
          className="items-center mt-20 mb-12"
        >
          <Image
            source={require('../../assets/images/app-icon/plate-icon.png')}
            className="h-20 w-20 mb-4"
            resizeMode="contain"
          />
          <Text className="text-[#4ADE80] text-2xl font-bold tracking-wide">
            Welcome Back
          </Text>
        </Animated.View>

        <Animated.View 
          entering={FadeIn.delay(200).springify()}
          className="flex-1 px-8"
        >
          <AuthTabs activeTab={activeTab} onTabChange={handleTabChange} />

          <View>
            {activeTab === 'signup' ? (
              <Animated.View entering={FadeIn} className="space-y-4">
                {signupStep === 1 ? (
                  <>
                    <FloatingLabelInput
                      label="Username"
                      helperText="Choose your username"
                      value={username}
                      onChangeText={(text) => {
                        setUsername(text);
                        if (errors.username) {
                          setErrors(prev => ({ ...prev, username: undefined }));
                        }
                      }}
                      autoCapitalize="none"
                      placeholder="johndoe"
                      error={errors.username}
                    />
                    <GradientButton onPress={handleNextStep} title="Continue" />
                  </>
                ) : signupStep === 2 ? (
                  <>
                    <FloatingLabelInput
                      label="Email Address"
                      helperText="Enter your email address"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email) {
                          setErrors(prev => ({ ...prev, email: undefined }));
                        }
                      }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      placeholder="example@email.com"
                      error={errors.email}
                    />
                    <GradientButton onPress={handleNextStep} title="Continue" />
                  </>
                ) : (
                  <>
                    <FloatingLabelInput
                      label="Password"
                      helperText="Create a strong password"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password) {
                          setErrors(prev => ({ ...prev, password: undefined }));
                        }
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      placeholder="••••••••"
                      error={errors.password}
                      rightIcon={
                        <TouchableOpacity 
                          onPress={() => togglePasswordVisibility('password')}
                          className="absolute right-4 top-4"
                        >
                          {showPassword ? (
                            <EyeOff size={22} color="#4ADE80" />
                          ) : (
                            <Eye size={22} color="#4ADE80" />
                          )}
                        </TouchableOpacity>
                      }
                    />
                    <FloatingLabelInput
                      label="Confirm Password"
                      helperText="Repeat your password"
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (errors.confirmPassword) {
                          setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                        }
                      }}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      placeholder="••••••••"
                      error={errors.confirmPassword}
                      rightIcon={
                        <TouchableOpacity 
                          onPress={() => togglePasswordVisibility('confirmPassword')}
                          className="absolute right-4 top-4"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={22} color="#4ADE80" />
                          ) : (
                            <Eye size={22} color="#4ADE80" />
                          )}
                        </TouchableOpacity>
                      }
                    />
                    <GradientButton 
                      onPress={handleSubmit} 
                      title={isLoading ? "Creating Account..." : "Create Account"}
                      disabled={isLoading}
                    />
                  </>
                )}
              </Animated.View>
            ) : (
              <>
                <FloatingLabelInput
                  label="Email Address"
                  helperText="Enter your email address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: undefined }));
                    }
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="example@email.com"
                  error={errors.email}
                />
                <FloatingLabelInput
                  label="Password"
                  helperText="Enter your password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: undefined }));
                    }
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  placeholder="••••••••"
                  error={errors.password}
                  rightIcon={
                    <TouchableOpacity 
                      onPress={() => togglePasswordVisibility('password')}
                      className="absolute right-4 top-4"
                    >
                      {showPassword ? (
                        <EyeOff size={22} color="#4ADE80" />
                      ) : (
                        <Eye size={22} color="#4ADE80" />
                      )}
                    </TouchableOpacity>
                  }
                />
                <TouchableOpacity className="mb-8">
                  <Text className="text-[#4ADE80] text-sm text-right">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
                <GradientButton 
                  onPress={handleSubmit} 
                  title={isLoading ? "Signing in..." : "Sign In"}
                  disabled={isLoading}
                />
              </>
            )}

            <SocialLogin />
          </View>
        </Animated.View>
      </BlurView>
    </View>
  );
}

export default SignIn;