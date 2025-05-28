// src/app/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Github } from 'lucide-react';
import type { Provider } from '@supabase/supabase-js';

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const redirectedFrom = searchParams.get('redirectedFrom') || '/';
  const initialError = searchParams.get('error');

  useEffect(() => {
    if (initialError === 'auth_failed') {
        setAuthError("Authentication failed. Please try again.");
    }
    // This effect checks if a user is already logged in when the page loads.
    // The Header's onAuthStateChange also handles global session state and redirection from /login.
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && pathname === '/login') { // Added pathname check for clarity
        // If already logged in AND on the login page, redirect.
        // Header component's onAuthStateChange will also attempt this.
        console.log('[Login Page] User already has session, redirecting from /login.');
        router.replace(redirectedFrom);
      }
    };
    const pathname = window.location.pathname; // Get current pathname
    checkUser();
  }, [supabase, router, redirectedFrom, initialError]);


  const handleSignInWithProvider = async (provider: Provider) => {
    setIsLoading(true);
    setAuthError(null);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectedFrom)}`,
      },
    });
    if (error) {
      setAuthError(error.message);
    }
    // On success, Supabase redirects, so no need to setIsLoading(false) here
    // setIsLoading(false) will be called only if there's an error.
    setIsLoading(false); 
  };

  const handleSignInWithEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setAuthError(error.message);
    } else {
      // Sign-in successful.
      // The Header component's onAuthStateChange listener will detect 'SIGNED_IN',
      // call router.refresh(), and handle redirection from /login if necessary.
      // No explicit navigation here needed, let Header handle it.
      console.log('[Login Page] signInWithPassword successful. Header will handle refresh and redirect.');
      // router.replace(redirectedFrom); // Removed: Let Header handle this
    }
    setIsLoading(false);
  };
  
  const handleSignUpWithEmail = async () => {
    setIsLoading(true);
    setAuthError(null);
    setMessage(null);

    let generatedUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!generatedUsername) {
      generatedUsername = 'user' + Math.random().toString(36).substring(2, 7);
    }
    if (generatedUsername.length < 3) {
      const neededChars = 3 - generatedUsername.length;
      generatedUsername += Math.random().toString(36).substring(2, 2 + neededChars + 2); // Ensure enough length
    }
    generatedUsername = generatedUsername.substring(0, 24); // Max length

    const signUpOptions = {
      emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectedFrom)}`,
      data: { user_name: generatedUsername } 
    };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: signUpOptions,
    });

    if (error) {
      setAuthError(error.message);
    } else if (data.user && data.user.identities?.length === 0) {
       setAuthError("User may already exist or email needs confirmation. Try signing in or check your email.");
    } else if (data.session === null && data.user) {
      setMessage('Check your email for the confirmation link!');
    } else if (data.session) {
       // Sign-up successful and session created (e.g. if auto-confirm is on)
       // Header's onAuthStateChange will handle router.refresh() and redirect.
       console.log('[Login Page] signUp successful with session. Header will handle refresh and redirect.');
       // router.replace(redirectedFrom); // Removed: Let Header handle this
    }
    setIsLoading(false);
  };


  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] py-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome!</CardTitle>
          <CardDescription>
            Sign in or create an account to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSignInWithEmail} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
            {authError && <p className="text-sm text-destructive">{authError}</p>}
            {message && <p className="text-sm text-primary">{message}</p>}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button type="submit" className="w-full" disabled={isLoading || !email || !password}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
                 <Button type="button" variant="outline" onClick={handleSignUpWithEmail} className="w-full" disabled={isLoading || !email || !password}>
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Button>
            </div>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleSignInWithProvider('github')}
            disabled={isLoading}
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </CardContent>
        <CardFooter className="text-xs text-center text-muted-foreground">
            By signing up, you agree to our imaginary Terms of Service.
        </CardFooter>
      </Card>
    </div>
  );
}

