import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { CartItem } from "@shared/schema";

export default function CreditorPage() {
  const [, navigate] = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [creditorName, setCreditorName] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [balanceAmount, setBalanceAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const cartItems: CartItem[] = JSON.parse(savedCart);
      setCart(cartItems);
      const calculatedTotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
      setTotal(calculatedTotal);
      setBalanceAmount(calculatedTotal.toString());
    } else {
      navigate("/menu");
    }
  }, [navigate]);

  useEffect(() => {
    const paid = parseFloat(paidAmount) || 0;
    const balance = total - paid;
    setBalanceAmount(balance.toFixed(2));
  }, [paidAmount, total]);

  const handleCreditorSale = async () => {
    if (!creditorName.trim()) {
      toast({
        title: "Creditor name required",
        description: "Please enter the creditor's name.",
        variant: "destructive",
      });
      return;
    }

    const paid = parseFloat(paidAmount) || 0;
    const balance = parseFloat(balanceAmount) || 0;

    if (paid < 0 || balance < 0) {
      toast({
        title: "Invalid amounts",
        description: "Paid and balance amounts cannot be negative.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const now = new Date();
      const transactionData = {
        items: cart,
        totalAmount: total.toFixed(2),
        paymentMethod: "creditor" as const,
        billerName: "Sriram",
        date: now.toISOString().split('T')[0],
        dayName: now.toLocaleDateString('en-US', { weekday: 'long' }),
        time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        creditor: {
          name: creditorName,
          paidAmount: paid,
          balanceAmount: balance,
          totalAmount: total
        }
      };

      const response = await apiRequest("POST", "/api/transactions", transactionData);
      const transaction = await response.json();

      localStorage.setItem("currentTransaction", JSON.stringify(transaction));
      localStorage.removeItem("cart");

      toast({
        title: "Creditor sale recorded",
        description: `Sale recorded for ${creditorName}. Balance: ₹${balance.toFixed(2)}`,
      });

      navigate("/invoice");
    } catch (error) {
      toast({
        title: "Transaction failed",
        description: "There was an error recording the creditor sale.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/payment")}
            className="mr-4 p-2 hover:bg-muted rounded-lg transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="text-secondary" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-secondary" data-testid="creditor-title">Creditor Sale</h1>
            <p className="text-muted-foreground" data-testid="creditor-subtitle">Record sale for a creditor customer</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-secondary mb-4" data-testid="order-summary-title">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex justify-between items-center py-2 border-b border-border"
                    data-testid={`order-item-${item.id}`}
                  >
                    <div>
                      <span className="font-medium text-secondary" data-testid={`text-item-name-${item.id}`}>
                        {item.name}
                      </span>
                      <span className="text-muted-foreground ml-2" data-testid={`text-item-quantity-${item.id}`}>
                        x{item.quantity}
                      </span>
                    </div>
                    <span className="font-semibold text-primary" data-testid={`text-item-total-${item.id}`}>
                      ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-secondary">Total</span>
                  <span className="text-primary" data-testid="text-total-amount">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Creditor Details */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-secondary mb-4" data-testid="creditor-details-title">Creditor Details</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="creditor-name" className="block text-sm font-medium text-secondary mb-2">
                    Creditor Name
                  </Label>
                  <Input
                    id="creditor-name"
                    type="text"
                    value={creditorName}
                    onChange={(e) => setCreditorName(e.target.value)}
                    placeholder="Enter creditor's name"
                    className="w-full"
                    data-testid="input-creditor-name"
                  />
                </div>

                <div>
                  <Label htmlFor="paid-amount" className="block text-sm font-medium text-secondary mb-2">
                    Paid Amount
                  </Label>
                  <Input
                    id="paid-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full"
                    data-testid="input-paid-amount"
                  />
                </div>

                <div>
                  <Label htmlFor="balance-amount" className="block text-sm font-medium text-secondary mb-2">
                    Balance Amount
                  </Label>
                  <Input
                    id="balance-amount"
                    type="number"
                    step="0.01"
                    value={balanceAmount}
                    readOnly
                    className="w-full bg-muted"
                    data-testid="input-balance-amount"
                  />
                </div>
              </div>

              <Button 
                onClick={handleCreditorSale}
                className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-semibold text-lg hover:bg-accent transition-colors"
                disabled={!creditorName.trim() || isProcessing}
                data-testid="button-record-creditor-sale"
              >
                <Save className="mr-2" size={20} />
                {isProcessing ? "Recording..." : "Record Creditor Sale"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}