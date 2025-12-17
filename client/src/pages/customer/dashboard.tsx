import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/stats-card";
import { BookingCard } from "@/components/booking-card";
import { useAuthContext } from "@/lib/auth-context";
import { mockBookings, mockCylinders, mockAgencies } from "@/lib/mock-data";
import { 
  Flame, 
  Package, 
  Truck, 
  CreditCard, 
  ArrowRight, 
  Plus,
  Clock,
  Building2
} from "lucide-react";

export default function CustomerDashboard() {
  const { user } = useAuthContext();
  
  const pendingBookings = mockBookings.filter(b => b.status === "pending" || b.status === "confirmed");
  const deliveredCount = mockBookings.filter(b => b.status === "delivered").length;

  return (
    <div className="container px-4 md:px-6 py-8 mx-auto">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.name}</h1>
            <p className="text-muted-foreground">Manage your gas bookings and track deliveries</p>
          </div>
          <Link href="/cylinders">
            <Button className="gap-2" data-testid="button-new-booking">
              <Plus className="h-4 w-4" />
              New Booking
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Active Bookings"
            value={pendingBookings.length}
            icon={Package}
            description="Pending and confirmed orders"
          />
          <StatsCard
            title="Pending Deliveries"
            value={mockBookings.filter(b => b.status === "in_transit").length}
            icon={Truck}
            description="On the way to you"
          />
          <StatsCard
            title="Delivered"
            value={deliveredCount}
            icon={Flame}
            description="Total cylinders delivered"
          />
          <StatsCard
            title="Total Spent"
            value={`Rs. ${mockBookings.reduce((sum, b) => sum + parseFloat(b.cylinder?.price || "0") * b.quantity, 0).toFixed(0)}`}
            icon={CreditCard}
          />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
            <CardTitle className="text-lg">Quick Book</CardTitle>
            <Link href="/cylinders">
              <Button variant="ghost" size="sm" className="gap-1" data-testid="link-view-all-cylinders">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockCylinders.slice(0, 3).map((cylinder) => (
                <Card key={cylinder.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Flame className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium">{cylinder.capacity}kg Cylinder</h4>
                        <p className="text-sm text-muted-foreground capitalize">{cylinder.cylinderType}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-semibold">Rs. {parseFloat(cylinder.price).toFixed(0)}</span>
                          <Link href="/cylinders">
                            <Button size="sm" data-testid={`button-quick-book-${cylinder.id}`}>Book</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                <CardTitle className="text-lg">Recent Bookings</CardTitle>
                <Link href="/bookings">
                  <Button variant="ghost" size="sm" className="gap-1" data-testid="link-view-all-bookings">
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockBookings.slice(0, 3).map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Nearby Agencies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockAgencies.slice(0, 3).map((agency) => (
                  <div key={agency.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{agency.agencyName}</h4>
                      <p className="text-xs text-muted-foreground truncate">{agency.address}</p>
                      <Badge variant="outline" className="mt-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Available
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Upcoming Delivery
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingBookings.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Order ID</span>
                      <span className="text-sm font-medium">{pendingBookings[0].id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        {pendingBookings[0].status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Cylinder</span>
                      <span className="text-sm font-medium">{pendingBookings[0].cylinder?.capacity}kg</span>
                    </div>
                    <Link href="/bookings" className="block">
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        Track Order
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming deliveries
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
