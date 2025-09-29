import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, IndianRupee, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { generateDailySummaryPDF, generateWeeklySummaryPDF, generateMonthlySummaryPDF } from "@/lib/pdf";
import type { DailySummary, WeeklySummary, MonthlySummary } from "@shared/schema";

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today");

  const { data: dailySummaries = [] } = useQuery<DailySummary[]>({
    queryKey: ["/api/summaries/daily"],
  });

  const { data: weeklySummaries = [] } = useQuery<WeeklySummary[]>({
    queryKey: ["/api/summaries/weekly"],
  });

  const { data: monthlySummaries = [] } = useQuery<MonthlySummary[]>({
    queryKey: ["/api/summaries/monthly"],
  });

  const today = new Date().toISOString().split('T')[0];
  const todaySummary = dailySummaries.find(s => s.date === today);

  const currentWeek = weeklySummaries[0];
  const currentMonth = monthlySummaries[0];

  const handleDownloadDaily = async () => {
    if (!todaySummary) return;
    
    try {
      await generateDailySummaryPDF(todaySummary, []);
    } catch (error) {
      console.error("Failed to generate daily PDF:", error);
    }
  };

  const handleDownloadWeekly = async () => {
    if (!currentWeek) return;
    
    try {
      await generateWeeklySummaryPDF(currentWeek, []);
    } catch (error) {
      console.error("Failed to generate weekly PDF:", error);
    }
  };

  const handleDownloadMonthly = async () => {
    if (!currentMonth) return;
    
    try {
      await generateMonthlySummaryPDF(currentMonth, []);
    } catch (error) {
      console.error("Failed to generate monthly PDF:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary" data-testid="dashboard-title">Dashboard</h1>
            <p className="text-muted-foreground" data-testid="dashboard-subtitle">Transaction summaries and analytics</p>
          </div>
          <div className="flex space-x-4">
            <Button 
              variant={selectedPeriod === "today" ? "default" : "secondary"}
              onClick={() => setSelectedPeriod("today")}
              data-testid="button-period-today"
            >
              Today
            </Button>
            <Button 
              variant={selectedPeriod === "week" ? "default" : "secondary"}
              onClick={() => setSelectedPeriod("week")}
              data-testid="button-period-week"
            >
              Week
            </Button>
            <Button 
              variant={selectedPeriod === "month" ? "default" : "secondary"}
              onClick={() => setSelectedPeriod("month")}
              data-testid="button-period-month"
            >
              Month
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <IndianRupee className="text-primary text-xl" />
                </div>
                <span className="text-sm text-muted-foreground" data-testid="text-today-label">Today</span>
              </div>
              <div className="text-2xl font-bold text-secondary mb-1" data-testid="text-daily-total">
                ₹{todaySummary?.totalAmount || "0.00"}
              </div>
              <div className="text-sm text-green-600" data-testid="text-daily-growth">+0% from yesterday</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xl font-bold">G</span>
                </div>
                <span className="text-sm text-muted-foreground" data-testid="text-gpay-label">GPay</span>
              </div>
              <div className="text-2xl font-bold text-secondary mb-1" data-testid="text-gpay-total">
                ₹{todaySummary?.gpayAmount || "0.00"}
              </div>
              <div className="text-sm text-muted-foreground" data-testid="text-gpay-percentage">
                {todaySummary ? Math.round((parseFloat(todaySummary.gpayAmount) / parseFloat(todaySummary.totalAmount)) * 100) : 0}% of total
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-500/10 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 text-xl">₹</span>
                </div>
                <span className="text-sm text-muted-foreground" data-testid="text-cash-label">Cash</span>
              </div>
              <div className="text-2xl font-bold text-secondary mb-1" data-testid="text-cash-total">
                ₹{todaySummary?.cashAmount || "0.00"}
              </div>
              <div className="text-sm text-muted-foreground" data-testid="text-cash-percentage">
                {todaySummary ? Math.round((parseFloat(todaySummary.cashAmount) / parseFloat(todaySummary.totalAmount)) * 100) : 0}% of total
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Receipt className="text-blue-600 text-xl" />
                </div>
                <span className="text-sm text-muted-foreground" data-testid="text-orders-label">Orders</span>
              </div>
              <div className="text-2xl font-bold text-secondary mb-1" data-testid="text-order-count">
                {todaySummary?.orderCount || 0}
              </div>
              <div className="text-sm text-green-600" data-testid="text-order-growth">+0 from yesterday</div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Summary */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-secondary" data-testid="daily-summary-title">Daily Summary</h2>
                <Button 
                  onClick={handleDownloadDaily}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                  disabled={!todaySummary}
                  data-testid="button-download-daily"
                >
                  <Download className="mr-2" size={16} />
                  Download
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium text-secondary" data-testid="text-total-sales">Total Sales</div>
                    <div className="text-sm text-muted-foreground" data-testid="text-today-orders">
                      Today • {todaySummary?.orderCount || 0} orders
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary" data-testid="text-today-total">
                      ₹{todaySummary?.totalAmount || "0.00"}
                    </div>
                    <div className="text-sm text-green-600" data-testid="text-today-change">+0%</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm text-green-700 mb-1" data-testid="text-gpay-payments">GPay Payments</div>
                    <div className="text-lg font-bold text-green-800" data-testid="text-gpay-amount">
                      ₹{todaySummary?.gpayAmount || "0.00"}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-700 mb-1" data-testid="text-cash-payments">Cash Payments</div>
                    <div className="text-lg font-bold text-gray-800" data-testid="text-cash-amount">
                      ₹{todaySummary?.cashAmount || "0.00"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-secondary" data-testid="weekly-summary-title">Weekly Summary</h2>
                <Button 
                  onClick={handleDownloadWeekly}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                  disabled={!currentWeek}
                  data-testid="button-download-weekly"
                >
                  <Download className="mr-2" size={16} />
                  Download
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium text-secondary" data-testid="text-week-total">Week Total</div>
                    <div className="text-sm text-muted-foreground" data-testid="text-week-orders">
                      {currentWeek ? `${currentWeek.weekStart} to ${currentWeek.weekEnd} • ${currentWeek.orderCount} orders` : "No data"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary" data-testid="text-week-amount">
                      ₹{currentWeek?.totalAmount || "0.00"}
                    </div>
                    <div className="text-sm text-green-600" data-testid="text-week-change">+0%</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm text-green-700 mb-1" data-testid="text-week-gpay">GPay Total</div>
                    <div className="text-lg font-bold text-green-800" data-testid="text-week-gpay-amount">
                      ₹{currentWeek?.gpayAmount || "0.00"}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-700 mb-1" data-testid="text-week-cash">Cash Total</div>
                    <div className="text-lg font-bold text-gray-800" data-testid="text-week-cash-amount">
                      ₹{currentWeek?.cashAmount || "0.00"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-secondary" data-testid="monthly-summary-title">Monthly Summary</h2>
              <Button 
                onClick={handleDownloadMonthly}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                disabled={!currentMonth}
                data-testid="button-download-monthly"
              >
                <Download className="mr-2" size={16} />
                Download
              </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 invoice-gradient text-white rounded-xl">
                <div className="mb-4">
                  <div className="text-sm opacity-90" data-testid="text-month-period">
                    {currentMonth ? new Date(currentMonth.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "No data"}
                  </div>
                  <div className="text-2xl font-bold" data-testid="text-month-total">
                    ₹{currentMonth?.totalAmount || "0.00"}
                  </div>
                </div>
                <div className="text-sm opacity-90" data-testid="text-month-orders">
                  {currentMonth?.orderCount || 0} total orders
                </div>
              </div>
              
              <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                <div className="mb-4">
                  <div className="text-sm text-green-700" data-testid="text-month-gpay-label">GPay Payments</div>
                  <div className="text-2xl font-bold text-green-800" data-testid="text-month-gpay-total">
                    ₹{currentMonth?.gpayAmount || "0.00"}
                  </div>
                </div>
                <div className="text-sm text-green-600" data-testid="text-month-gpay-percentage">
                  {currentMonth ? ((parseFloat(currentMonth.gpayAmount) / parseFloat(currentMonth.totalAmount)) * 100).toFixed(1) : 0}% of total
                </div>
              </div>
              
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="mb-4">
                  <div className="text-sm text-gray-700" data-testid="text-month-cash-label">Cash Payments</div>
                  <div className="text-2xl font-bold text-gray-800" data-testid="text-month-cash-total">
                    ₹{currentMonth?.cashAmount || "0.00"}
                  </div>
                </div>
                <div className="text-sm text-gray-600" data-testid="text-month-cash-percentage">
                  {currentMonth ? ((parseFloat(currentMonth.cashAmount) / parseFloat(currentMonth.totalAmount)) * 100).toFixed(1) : 0}% of total
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MongoDB Connection Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold">DB</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2" data-testid="mongodb-title">MongoDB Atlas Integration</h3>
              <p className="text-blue-800 text-sm mb-3" data-testid="mongodb-description">
                All transactions are automatically stored in MongoDB Atlas for reliable data persistence and analytics.
              </p>
              <div className="text-xs text-blue-700" data-testid="mongodb-instructions">
                <strong>Setup Instructions:</strong> Configure your MongoDB Atlas connection string in the environment variables. 
                All daily, weekly, and monthly summaries are generated from real transaction data.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
