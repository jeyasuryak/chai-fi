import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { CartItem } from "@shared/schema";

export default function PaymentPage() {
  const [, navigate] = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [manualTotal, setManualTotal] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"gpay" | "cash" | "split" | null>(null);
  const [splitGpayAmount, setSplitGpayAmount] = useState("");
  const [splitCashAmount, setSplitCashAmount] = useState("");
  const [extras, setExtras] = useState([
    { name: "extras", amount: "" },
    { name: "cooldrinks", amount: "" },
    { name: "chocolate", amount: "" }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const cartItems: CartItem[] = JSON.parse(savedCart);
      setCart(cartItems);
      const calculatedTotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
      setTotal(calculatedTotal);
      setManualTotal(calculatedTotal.toString());
    } else {
      navigate("/menu");
    }
  }, [navigate]);

  // Keep manualTotal as base amount, calculate final total separately
  const extrasTotal = extras.reduce((sum, extra) => sum + (parseFloat(extra.amount) || 0), 0);
  const finalTotal = (parseFloat(manualTotal) || 0) + extrasTotal;

  const updateExtraField = (index: number, field: string, value: string) => {
    setExtras(prev => prev.map((extra, i) => 
      i === index ? { ...extra, [field]: value } : extra
    ));
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast({
        title: "Payment method required",
        description: "Please select a payment method.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "split") {
      const gpay = parseFloat(splitGpayAmount) || 0;
      const cash = parseFloat(splitCashAmount) || 0;
      const total = parseFloat(manualTotal) || 0;
      
      if (Math.abs((gpay + cash) - total) > 0.01) {
        toast({
          title: "Split payment mismatch",
          description: "GPay + Cash amounts must equal the total amount.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessing(true);

    try {
      const now = new Date();
      const transactionData = {
        items: cart,
        totalAmount: finalTotal.toFixed(2),
        paymentMethod,
        billerName: "Sriram",
        date: now.toISOString().split('T')[0],
        dayName: now.toLocaleDateString('en-US', { weekday: 'long' }),
        time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        ...(paymentMethod === "split" && {
          splitPayment: {
            gpayAmount: parseFloat(splitGpayAmount) || 0,
            cashAmount: parseFloat(splitCashAmount) || 0
          }
        }),
        extras: extras.filter(extra => extra.name && parseFloat(extra.amount) > 0)
      };

      const response = await apiRequest("POST", "/api/transactions", transactionData);
      const transaction = await response.json();

      localStorage.setItem("currentTransaction", JSON.stringify(transaction));
      localStorage.removeItem("cart");

      toast({
        title: "Payment successful",
        description: "Your order has been processed.",
      });

      navigate("/invoice");
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment.",
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
            onClick={() => navigate("/menu")}
            className="mr-4 p-2 hover:bg-muted rounded-lg transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="text-secondary" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-secondary" data-testid="payment-title">Payment</h1>
            <p className="text-muted-foreground" data-testid="payment-subtitle">Review your order and complete payment</p>
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

              {/* Manual Total Adjustment */}
              <div className="mb-6">
                <Label htmlFor="manual-total" className="block text-sm font-medium text-secondary mb-2">
                  Adjust Total Amount
                </Label>
                <Input
                  id="manual-total"
                  type="number"
                  step="0.01"
                  value={manualTotal}
                  onChange={(e) => setManualTotal(e.target.value)}
                  className="w-full"
                  data-testid="input-manual-total"
                />
              </div>

              {/* Extra Items */}
              <div className="mb-6">
                <Label className="block text-sm font-medium text-secondary mb-3">
                  Additional Items
                </Label>
                <div className="space-y-3">
                  {extras.map((extra, index) => (
                    <div key={index} className="grid grid-cols-2 gap-3">
                      <Input
                        type="text"
                        value={extra.name}
                        onChange={(e) => updateExtraField(index, 'name', e.target.value)}
                        placeholder="Item name"
                        className="capitalize"
                        data-testid={`input-extra-name-${index}`}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={extra.amount}
                        onChange={(e) => updateExtraField(index, 'amount', e.target.value)}
                        placeholder="Amount"
                        data-testid={`input-extra-amount-${index}`}
                      />
                    </div>
                  ))}
                </div>
                {extrasTotal > 0 && (
                  <div className="mt-3 text-sm font-medium text-primary">
                    Extras Total: ₹{extrasTotal.toFixed(2)}
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-secondary">Total</span>
                  <span className="text-primary" data-testid="text-final-total">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Options */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-secondary mb-4" data-testid="payment-method-title">Payment Method</h2>
              
              <div className="space-y-4 mb-6">
                <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                  <Checkbox 
                    checked={paymentMethod === "gpay"}
                    onCheckedChange={(checked) => setPaymentMethod(checked ? "gpay" : null)}
                    className="w-5 h-5"
                    data-testid="checkbox-gpay"
                  />
                  <div className="ml-4 flex items-center">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                      <span className="text-primary-foreground font-bold">G</span>
                    </div>
                    <div>
                      <div className="font-medium text-secondary" data-testid="text-gpay-title">Google Pay</div>
                      <div className="text-sm text-muted-foreground" data-testid="text-gpay-description">Pay securely with GPay</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                  <Checkbox 
                    checked={paymentMethod === "cash"}
                    onCheckedChange={(checked) => setPaymentMethod(checked ? "cash" : null)}
                    className="w-5 h-5"
                    data-testid="checkbox-cash"
                  />
                  <div className="ml-4 flex items-center">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white">₹</span>
                    </div>
                    <div>
                      <div className="font-medium text-secondary" data-testid="text-cash-title">Cash</div>
                      <div className="text-sm text-muted-foreground" data-testid="text-cash-description">Pay with cash</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                  <Checkbox 
                    checked={paymentMethod === "split"}
                    onCheckedChange={(checked) => setPaymentMethod(checked ? "split" : null)}
                    className="w-5 h-5"
                    data-testid="checkbox-split"
                  />
                  <div className="ml-4 flex items-center">
                    <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mr-3">
                      <span className="text-accent-foreground font-bold">G₹</span>
                    </div>
                    <div>
                      <div className="font-medium text-secondary" data-testid="text-split-title">Cash + GPay</div>
                      <div className="text-sm text-muted-foreground" data-testid="text-split-description">Split payment between cash and GPay</div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Split Payment Details */}
              {paymentMethod === "split" && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-medium text-secondary mb-3">Split Payment Details</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="gpay-amount" className="block text-sm font-medium text-secondary mb-1">
                        GPay Amount
                      </Label>
                      <Input
                        id="gpay-amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={splitGpayAmount}
                        onChange={(e) => setSplitGpayAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full"
                        data-testid="input-split-gpay"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cash-amount" className="block text-sm font-medium text-secondary mb-1">
                        Cash Amount
                      </Label>
                      <Input
                        id="cash-amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={splitCashAmount}
                        onChange={(e) => setSplitCashAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full"
                        data-testid="input-split-cash"
                      />
                    </div>
                  </div>
                  
                  {/* Split Payment Summary */}
                  <div className="mt-4 p-3 bg-background rounded border">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Expected Total:</span>
                        <span className="font-medium">₹{finalTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GPay + Cash:</span>
                        <span className="font-medium">₹{((parseFloat(splitGpayAmount) || 0) + (parseFloat(splitCashAmount) || 0)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Difference:</span>
                        <span className={`font-medium ${
                          Math.abs(finalTotal - ((parseFloat(splitGpayAmount) || 0) + (parseFloat(splitCashAmount) || 0))) < 0.01 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          ₹{(finalTotal - ((parseFloat(splitGpayAmount) || 0) + (parseFloat(splitCashAmount) || 0))).toFixed(2)}
                        </span>
                      </div>
                      {Math.abs(finalTotal - ((parseFloat(splitGpayAmount) || 0) + (parseFloat(splitCashAmount) || 0))) < 0.01 && (
                        <div className="text-green-600 text-xs text-center font-medium">✓ Split amounts match total</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  onClick={handlePayment}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-semibold text-lg hover:bg-accent transition-colors"
                  disabled={!paymentMethod || isProcessing}
                  data-testid="button-complete-payment"
                >
                  <Check className="mr-2" size={20} />
                  {isProcessing ? "Processing..." : "Complete Payment"}
                </Button>

                <Button 
                  onClick={() => navigate("/creditor")}
                  variant="outline"
                  className="w-full py-4 rounded-lg font-semibold text-lg border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  data-testid="button-creditor"
                >
                  Record as Creditor Sale
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
