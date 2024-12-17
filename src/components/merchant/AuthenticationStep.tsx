import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface AuthenticationStepProps {
  onComplete: (userData: any) => void;
  isLoading?: boolean;
}

export function AuthenticationStep({ onComplete, isLoading = false }: AuthenticationStepProps) {
  const [localLoading, setLocalLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleGoogleSignIn = async () => {
    try {
      setLocalLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userData = {
        firstName: result.user.displayName?.split(' ')[0] || '',
        lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
        email: result.user.email || '',
        photoURL: result.user.photoURL,
        uid: result.user.uid,
      };

      onComplete(userData);

      toast({
        title: "Successfully signed in",
        description: "Welcome! Let's continue with your application.",
      });
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "There was a problem signing in with Google",
        variant: "destructive",
      });
    } finally {
      setLocalLoading(false);
    }
  };

  const handleContinueWithCurrentAccount = () => {
    if (!user) return;
    
    const userData = {
      firstName: user.displayName?.split(' ')[0] || '',
      lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
      email: user.email || '',
      photoURL: user.photoURL,
      uid: user.uid,
    };
    
    onComplete(userData);
  };

  const handleSwitchAccount = async () => {
    try {
      await signOut(auth);
      setShowAuthForm(true);
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLocalLoading(true);
      onComplete(formData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "There was a problem creating your account",
        variant: "destructive",
      });
    } finally {
      setLocalLoading(false);
    }
  };

  const isButtonDisabled = localLoading || isLoading;

  if (user && !showAuthForm) {
    return (
      <Card className="w-full max-w-md p-6 space-y-6 bg-white shadow-lg rounded-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Continue Your Application
          </h1>
          <p className="text-sm text-muted-foreground">
            You're signed in as {user.email}
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleContinueWithCurrentAccount}
            className="w-full"
            disabled={isButtonDisabled}
          >
            Continue with current application
          </Button>
          
          <Button
            variant="outline"
            onClick={handleSwitchAccount}
            className="w-full"
            disabled={isButtonDisabled}
          >
            Switch application
          </Button>
        </div>
      </Card>
    );
  }

  // Original authentication form
  return (
    <Card className="w-full max-w-md p-6 space-y-6 bg-white shadow-lg rounded-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Let's get you ready to accept payments
        </h1>
        <p className="text-sm text-muted-foreground">
          Complete your application to start processing payments
        </p>
      </div>

      <Button
        variant="outline"
        type="button"
        className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 transition-colors"
        onClick={handleGoogleSignIn}
        disabled={isButtonDisabled}
      >
        <span className="flex items-center justify-center">
          {isButtonDisabled ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}
          Continue with Google
        </span>
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isButtonDisabled}
        >
          <span className="flex items-center justify-center">
            {isButtonDisabled && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Start my application
          </span>
        </Button>
      </form>
    </Card>
  );
}
