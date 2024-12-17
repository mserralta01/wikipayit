import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 as Spinner, LucideProps } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Define Icons object with required components
const Icons = {
  spinner: (props: LucideProps) => <Spinner {...props} />,
  google: (props: LucideProps) => (
    <svg {...props} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
      <path d="M1 1h22v22H1z" fill="none" />
    </svg>
  ),
};

export type AuthenticationStepProps = {
  onComplete: (data: any) => void;
  isLoading?: boolean;
};

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
    
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLocalLoading(true);
      
      // Just pass the form data to parent component
      onComplete({
        ...formData,
        status: "Lead",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentStep: 1,
      });

      toast({
        title: "Information saved",
        description: "Let's continue with your application.",
      });
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: error.message || "There was a problem saving your information",
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
