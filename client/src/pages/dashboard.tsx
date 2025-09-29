import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, IndianRupee, Receipt, Trash2, Users, TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { generateDailySummaryPDF, generateWeeklySummaryPDF, generateMonthlySummaryPDF, generateMenuSalesPDF } from "@/lib/pdf";
import { useToast } from "@/hooks/use-toast";
import type { DailySummary, WeeklySummary, MonthlySummary } from "@shared/schema";

type CreditorSummary = {
  name: string;
  totalAmount: number;
};

type MenuItemSales = {
  name: string;
  count: number;
};

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today");
  const [clearPeriod, setClearPeriod] = useState<"day" | "week" | "month">("day");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: dailySummaries = [] } = useQuery<DailySummary[]>({
    queryKey: ["/api/summaries/daily"],
  });

  const { data: weeklySummaries = [] } = useQuery<WeeklySummary[]>({
    queryKey: ["/api/summaries/weekly"],
  });

  const { data: monthlySummaries = [] } = useQuery<MonthlySummary[]>({
    queryKey: ["/api/summaries/monthly"],
  });

  const { data: creditorSummary = [], isLoading: creditorSummaryLoading, error: creditorSummaryError } = useQuery<CreditorSummary[]>({
    queryKey: ["/api/creditors/summary"],
  });

  const today = new Date().toISOString().split('T')[0];
  const { data: menuItemSales = [], isLoading: menuItemSalesLoading, error: menuItemSalesError } = useQuery<MenuItemSales[]>({
    queryKey: ["/api/menu-items/sales"],
  });

  const todaySummary = dailySummaries.find(s => s.date === today);
  const currentWeek = weeklySummaries[0];
  const currentMonth = monthlySummaries[0];

  // Calculate total creditor balance
  const totalCreditorBalance = creditorSummary.reduce((sum, creditor) => sum + creditor.totalAmount, 0);

  // Prepare chart data
  const chartData = menuItemSales.slice(0, 10).map(item => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    sales: item.count,
  }));

  const chartConfig = {
    sales: {
      label: "Sales Count",
      color: "hsl(var(--primary))",
    },
  };

  const handleClearData = async () => {
    try {
      let dateParam = today;
      
      if (clearPeriod === 'week') {
        // Get Monday of current week
        const currentDate = new Date();
        const day = currentDate.getDay();
        const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(currentDate.setDate(diff));
        dateParam = monday.toISOString().split('T')[0];
      } else if (clearPeriod === 'month') {
        dateParam = today.substring(0, 7); // YYYY-MM format
      }

      const response = await fetch(`/api/data/clear?period=${clearPeriod}&date=${dateParam}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Data Cleared",
          description: result.message,
        });
        
        // Refresh all queries
        queryClient.invalidateQueries({ queryKey: ["/api/summaries/daily"] });
        queryClient.invalidateQueries({ queryKey: ["/api/summaries/weekly"] });
        queryClient.invalidateQueries({ queryKey: ["/api/summaries/monthly"] });
        queryClient.invalidateQueries({ queryKey: ["/api/creditors/summary"] });
        queryClient.invalidateQueries({ queryKey: ["/api/menu-items/sales"] });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to clear data",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear data",
        variant: "destructive",
      });
    }
  };

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

  const handleDownloadMenuSales = async () => {
    if (!menuItemSales || menuItemSales.length === 0) {
      toast({
        title: "No Data",
        description: "No menu sales data available to download",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await generateMenuSalesPDF(menuItemSales);
      toast({
        title: "PDF Downloaded",
        description: "Menu sales report has been downloaded successfully",
      });
    } catch (error) {
      console.error("Failed to generate menu sales PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate menu sales PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-secondary" data-testid="dashboard-title">Dashboard</h1>
              <p className="text-muted-foreground" data-testid="dashboard-subtitle">Transaction summaries and analytics</p>
            </div>
            
            {/* Clear Data Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete data from both frontend and MongoDB backend. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <label className="text-sm font-medium mb-2 block">Select period to clear:</label>
                  <Select value={clearPeriod} onValueChange={(value: "day" | "week" | "month") => setClearPeriod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Today's Data</SelectItem>
                      <SelectItem value="week">This Week's Data</SelectItem>
                      <SelectItem value="month">This Month's Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearData} className="bg-red-600 hover:bg-red-700">
                    Clear Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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

        {/* Creditor Summary */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-secondary">Creditor Summary</h2>
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <Users className="text-red-600 text-xl" />
                </div>
              </div>
              
              {creditorSummaryLoading ? (
                <div className="text-center py-4">Loading creditor data...</div>
              ) : creditorSummaryError ? (
                <div className="text-center py-4 text-red-600">Error loading creditor data</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <div className="font-medium text-red-700">Total Outstanding</div>
                      <div className="text-sm text-red-600">
                        {creditorSummary?.length || 0} creditors
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-800">
                        ₹{creditorSummary?.reduce((sum, creditor) => sum + creditor.totalAmount, 0).toFixed(2) || "0.00"}
                      </div>
                    </div>
                  </div>
                  
                  {creditorSummary && creditorSummary.length > 0 && (
                    <div className="max-h-48 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Creditor</th>
                            <th className="text-right py-2">Amount Due</th>
                          </tr>
                        </thead>
                        <tbody>
                          {creditorSummary.map((creditor, index) => (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="py-2">{creditor.name}</td>
                              <td className="text-right py-2 font-medium text-red-600">
                                ₹{creditor.totalAmount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
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

        {/* Menu Item Sales Analytics */}
        <div className="mt-8 grid lg:grid-cols-2 gap-8">
          {/* Sales Table */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-secondary">Today's Menu Sales</h2>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={handleDownloadMenuSales}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                    disabled={!menuItemSales || menuItemSales.length === 0}
                    data-testid="button-download-menu-sales"
                  >
                    <Download className="mr-2" size={16} />
                    Download PDF
                  </Button>
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-purple-600 text-xl" />
                  </div>
                </div>
              </div>
              
              {menuItemSalesLoading ? (
                <div className="text-center py-4">Loading sales data...</div>
              ) : menuItemSalesError ? (
                <div className="text-center py-4 text-red-600">Error loading sales data</div>
              ) : (
                <div className="space-y-4">
                  {menuItemSales && menuItemSales.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Menu Item</TableHead>
                            <TableHead className="text-right">Sales Count</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {menuItemSales.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell className="text-right font-bold text-purple-600">
                                {item.count}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No sales data available for today
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sales Chart */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-secondary">Sales Visualization</h2>
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600 text-xl" />
                </div>
              </div>
              
              {menuItemSalesLoading ? (
                <div className="text-center py-4">Loading chart data...</div>
              ) : menuItemSalesError ? (
                <div className="text-center py-4 text-red-600">Error loading chart data</div>
              ) : (
                <div className="h-64">
                  {menuItemSales && menuItemSales.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={menuItemSales} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No data to display
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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
