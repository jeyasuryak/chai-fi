import { useLocation } from "wouter";
import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SplashPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen splash-gradient flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-32 h-32 mx-auto mb-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Coffee className="text-6xl text-white" size={64} />
        </div>
        <h1 className="text-6xl font-bold mb-4" data-testid="app-title">Chai-Fi</h1>
        <p className="text-xl opacity-90 mb-8" data-testid="app-subtitle">Modern Billing Solution</p>
        <Button 
          onClick={() => navigate("/login")} 
          className="bg-white text-secondary px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
          data-testid="button-get-started"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
