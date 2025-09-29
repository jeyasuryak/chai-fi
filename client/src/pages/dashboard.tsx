import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, IndianRupee, Receipt, Trash2, TrendingUp, BarChart3, ArrowLeft, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { generateDailySummaryPDF, generateWeeklySummaryPDF, generateMonthlySummaryPDF, generateMenuSalesPDF } from "@/lib/pdf";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { DailySummary, WeeklySummary, MonthlySummary } from "@shared/schema";



type MenuItemSales = {
  name: string;
  count: number;
};

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today");
  const [clearPeriod, setClearPeriod] = useState<"day" | "week" | "month">("day");
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();

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
  const { data: menuItemSales = [], isLoading: menuItemSalesLoading, error: menuItemSalesError } = useQuery<any[]>({
    queryKey: ["/api/menu/sales"],
  });

  const todaySummary = dailySummaries.find(s => s.date === today);
  const currentWeek = weeklySummaries[0];
  const currentMonth = monthlySummaries[0];



  // Prepare chart data with colors
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ff0000', '#0000ff', '#ffff00'];
  
  const chartData = menuItemSales
    .filter(item => item.totalSold > 0) // Only show items with sales
    .slice(0, 10)
    .map((item, index) => ({
      name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
      fullName: item.name,
      count: item.totalSold || 0,
      revenue: item.revenue || 0,
      color: COLORS[index % COLORS.length],
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
        queryClient.invalidateQueries({ queryKey: ["/api/menu/sales"] });
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
      // Transform the data to match the expected format for PDF generation
      const transformedData = menuItemSales.map(item => ({
        name: item.name,
        count: item.totalSold || 0
      }));
      
      await generateMenuSalesPDF(transformedData);
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
            <Button 
              onClick={() => navigate("/menu")}
              variant="outline"
              size="sm"
              className="px-4 py-2 rounded-lg font-semibold hover:bg-secondary hover:text-secondary-foreground transition-colors"
            >
              <ArrowLeft className="mr-2" size={16} />
              Back to Menu
            </Button>
           
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

        {/* Menu Item Sales Analytics */}
        <div className="mt-8 grid lg:grid-cols-2 gap-8">
          {/* Sales Table */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-secondary">Today's Menu Sales</h2>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={() => navigate("/menu")}
                    variant="outline"
                    className="px-4 py-2 rounded-lg text-sm hover:bg-secondary hover:text-secondary-foreground transition-colors"
                  >
                    <Menu className="mr-2" size={16} />
                    View Menu
                  </Button>
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
                                {item.totalSold || 0}
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
                <h2 className="text-xl font-semibold text-secondary">Individual Menu Item Sales</h2>
                <div className="flex items-center gap-3">
                  <Select value={chartType} onValueChange={(value: "bar" | "pie") => setChartType(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-green-600 text-xl" />
                  </div>
                </div>
              </div>
              
              {menuItemSalesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading sales data...</p>
                </div>
              ) : menuItemSalesError ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-600 text-2xl">⚠️</span>
                  </div>
                  <p className="text-red-600 font-medium">Error loading sales data</p>
                  <p className="text-sm text-muted-foreground mt-2">Please try refreshing the page</p>
                </div>
              ) : (
                <div className="h-80">
                  {chartData && chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === "bar" ? (
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={11}
                            interval={0}
                          />
                          <YAxis fontSize={12} />
                          <Tooltip 
                            formatter={(value, name, props) => [
                              `${value} sold`,
                              props.payload.fullName
                            ]}
                            labelFormatter={(label) => `Item: ${label}`}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #ccc',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Bar 
                            dataKey="count" 
                            fill="#8884d8"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      ) : (
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, count, percent }) => 
                              `${name}: ${count} (${(percent * 100).toFixed(1)}%)`
                            }
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name, props) => [
                              `${value} sold`,
                              props.payload.fullName
                            ]}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #ccc',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Legend />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <BarChart3 className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium">No sales data available</p>
                      <p className="text-sm mt-2">Start selling items to see the visualization</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Sales Summary */}
              {chartData && chartData.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{chartData.length}</p>
                      <p className="text-sm text-muted-foreground">Items Sold</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {chartData.reduce((sum, item) => sum + item.count, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Quantity</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        ₹{chartData.reduce((sum, item) => sum + item.revenue, 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        ₹{chartData.length > 0 ? (chartData.reduce((sum, item) => sum + item.revenue, 0) / chartData.reduce((sum, item) => sum + item.count, 0)).toFixed(2) : '0.00'}
                      </p>
                      <p className="text-sm text-muted-foreground">Avg. Price</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

       
        {/* Powered by Innowara */}
        <div className="mt-8 flex justify-center items-center">
          <div className="bg-white rounded-xl shadow-sm border border-border p-4 flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Innowara Logo" 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                // Fallback if image doesn't load
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Powered by</p>
              <p className="font-semibold text-primary">Inowara</p>
              <p className="text-xs text-muted-foreground">IT Solutions - Web & Mobile Apps</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
