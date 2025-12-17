import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingCard } from "@/components/booking-card";
import { mockBookings } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { Search, Package, Clock, Truck, CheckCircle2, XCircle } from "lucide-react";

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const filteredBookings = mockBookings.filter((booking) => {
    const matchesSearch = booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.cylinder?.cylinderType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingBookings = mockBookings.filter(b => b.status === "pending");
  const confirmedBookings = mockBookings.filter(b => b.status === "confirmed");
  const inTransitBookings = mockBookings.filter(b => b.status === "in_transit");
  const deliveredBookings = mockBookings.filter(b => b.status === "delivered");
  const cancelledBookings = mockBookings.filter(b => b.status === "cancelled");

  const handleCancel = (bookingId: string) => {
    toast({
      title: "Booking Cancelled",
      description: `Booking ${bookingId.slice(0, 8).toUpperCase()} has been cancelled.`,
    });
  };

  const handleViewDetails = (bookingId: string) => {
    toast({
      title: "View Details",
      description: `Opening details for booking ${bookingId.slice(0, 8).toUpperCase()}`,
    });
  };

  const renderBookingList = (bookings: typeof mockBookings) => {
    if (bookings.length === 0) {
      return (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No bookings found</h3>
          <p className="text-muted-foreground">You don't have any bookings in this category yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onViewDetails={() => handleViewDetails(booking.id)}
            onCancel={booking.status === "pending" ? () => handleCancel(booking.id) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container px-4 md:px-6 py-8 mx-auto">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">Track and manage all your gas cylinder bookings</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{pendingBookings.length}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{confirmedBookings.length}</div>
              <div className="text-xs text-muted-foreground">Confirmed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Truck className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{inTransitBookings.length}</div>
              <div className="text-xs text-muted-foreground">In Transit</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{deliveredBookings.length}</div>
              <div className="text-xs text-muted-foreground">Delivered</div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="p-4 text-center">
              <XCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{cancelledBookings.length}</div>
              <div className="text-xs text-muted-foreground">Cancelled</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by booking ID or cylinder type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-bookings"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending</TabsTrigger>
            <TabsTrigger value="confirmed" className="text-xs sm:text-sm">Confirmed</TabsTrigger>
            <TabsTrigger value="in_transit" className="text-xs sm:text-sm">In Transit</TabsTrigger>
            <TabsTrigger value="delivered" className="text-xs sm:text-sm">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled" className="text-xs sm:text-sm">Cancelled</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            {renderBookingList(filteredBookings)}
          </TabsContent>
          <TabsContent value="pending" className="mt-6">
            {renderBookingList(pendingBookings)}
          </TabsContent>
          <TabsContent value="confirmed" className="mt-6">
            {renderBookingList(confirmedBookings)}
          </TabsContent>
          <TabsContent value="in_transit" className="mt-6">
            {renderBookingList(inTransitBookings)}
          </TabsContent>
          <TabsContent value="delivered" className="mt-6">
            {renderBookingList(deliveredBookings)}
          </TabsContent>
          <TabsContent value="cancelled" className="mt-6">
            {renderBookingList(cancelledBookings)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
