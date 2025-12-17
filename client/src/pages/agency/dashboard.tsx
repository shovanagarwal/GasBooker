import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/stats-card";
import { useAuthContext } from "@/lib/auth-context";
import { mockStats, mockChartData, mockAgencyBookings, mockSupplies } from "@/lib/mock-data";
import { Link } from "wouter";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Package,
  TrendingUp,
  Users,
  IndianRupee,
  Truck,
  Flame,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function AgencyDashboard() {
  const { user } = useAuthContext();

  const recentBookings = mockAgencyBookings.slice(0, 5);
  const lowStockItems = mockSupplies.filter(s => s.stock < 30);

  return (
    <div className="container px-4 md:px-6 py-8 mx-auto">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Agency Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/agency/inventory">
              <Button variant="outline" className="gap-2" data-testid="button-manage-inventory">
                <Package className="h-4 w-4" />
                Manage Inventory
              </Button>
            </Link>
            <Link href="/agency/bookings">
              <Button className="gap-2" data-testid="button-view-bookings">
                <Truck className="h-4 w-4" />
                View Bookings
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Bookings"
            value={mockStats.totalBookings}
            icon={Package}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Monthly Revenue"
            value={`Rs. ${(mockStats.monthlyRevenue / 1000).toFixed(1)}K`}
            icon={IndianRupee}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Pending Deliveries"
            value={mockStats.pendingDeliveries}
            icon={Truck}
            description="To be delivered today"
          />
          <StatsCard
            title="Active Customers"
            value={mockStats.activeCustomers}
            icon={Users}
            trend={{ value: 5, isPositive: true }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Booking Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockChartData.bookingTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="bookings"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-primary" />
                Revenue by Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockChartData.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `${value / 1000}K`} />
                    <Tooltip
                      formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, "Revenue"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
              <CardTitle className="text-lg">Recent Bookings</CardTitle>
              <Link href="/agency/bookings">
                <Button variant="ghost" size="sm" className="gap-1" data-testid="link-all-bookings">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50"
                    data-testid={`booking-row-${booking.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Flame className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {booking.cylinder?.capacity}kg {booking.cylinder?.cylinderType} x{booking.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(booking as any).customer?.name || "Customer"} - {format(booking.bookingDate, "MMM d")}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : booking.status === "confirmed"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          : booking.status === "in_transit"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      }
                    >
                      {booking.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                      {booking.status === "confirmed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {booking.status === "in_transit" && <Truck className="h-3 w-3 mr-1" />}
                      {booking.status === "delivered" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {booking.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flame className="h-5 w-5 text-primary" />
                  Cylinder Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockChartData.cylinderDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="count"
                      >
                        {mockChartData.cylinderDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {mockChartData.cylinderDistribution.slice(0, 4).map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="truncate">{item.type.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Low Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lowStockItems.length > 0 ? (
                  <div className="space-y-3">
                    {lowStockItems.map((supply) => (
                      <div key={supply.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Flame className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{supply.cylinder?.capacity}kg {supply.cylinder?.cylinderType}</span>
                        </div>
                        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          {supply.stock} left
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    All stock levels are healthy
                  </p>
                )}
                <Link href="/agency/inventory" className="block mt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Inventory
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
