import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { mockAgencyBookings } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Search,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Eye,
  User,
  Phone,
  Mail,
  Flame,
  Calendar,
} from "lucide-react";

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: CheckCircle2 },
  in_transit: { label: "In Transit", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
};

export default function AgencyBookingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<typeof mockAgencyBookings[0] | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const { toast } = useToast();

  const filteredBookings = mockAgencyBookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking as any).customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (bookingId: string, newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `Booking ${bookingId.slice(0, 8).toUpperCase()} status changed to ${newStatus}`,
    });
  };

  const handleViewDetails = (booking: typeof mockAgencyBookings[0]) => {
    setSelectedBooking(booking);
    setDetailsModalOpen(true);
  };

  const pendingCount = mockAgencyBookings.filter(b => b.status === "pending").length;
  const confirmedCount = mockAgencyBookings.filter(b => b.status === "confirmed").length;
  const inTransitCount = mockAgencyBookings.filter(b => b.status === "in_transit").length;
  const deliveredCount = mockAgencyBookings.filter(b => b.status === "delivered").length;

  return (
    <div className="container px-4 md:px-6 py-8 mx-auto">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Manage Bookings</h1>
          <p className="text-muted-foreground">View and manage all customer bookings</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{pendingCount}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{confirmedCount}</div>
              <div className="text-xs text-muted-foreground">Confirmed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Truck className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{inTransitCount}</div>
              <div className="text-xs text-muted-foreground">In Transit</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{deliveredCount}</div>
              <div className="text-xs text-muted-foreground">Delivered</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by booking ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-agency-bookings"
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Cylinder</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Booking Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => {
                    const status = statusConfig[booking.status];
                    const StatusIcon = status.icon;
                    return (
                      <TableRow key={booking.id} data-testid={`row-booking-${booking.id}`}>
                        <TableCell className="font-medium">
                          {booking.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{(booking as any).customer?.name || "Customer"}</p>
                            <p className="text-xs text-muted-foreground">{(booking as any).customer?.phoneNumber || ""}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Flame className="h-4 w-4 text-primary" />
                            <span>{booking.cylinder?.capacity}kg {booking.cylinder?.cylinderType}</span>
                          </div>
                        </TableCell>
                        <TableCell>{booking.quantity}</TableCell>
                        <TableCell>{format(booking.bookingDate, "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(booking)}
                              data-testid={`button-view-${booking.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {booking.status === "pending" && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                                data-testid={`button-confirm-${booking.id}`}
                              >
                                Confirm
                              </Button>
                            )}
                            {booking.status === "confirmed" && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(booking.id, "in_transit")}
                                data-testid={`button-dispatch-${booking.id}`}
                              >
                                Dispatch
                              </Button>
                            )}
                            {booking.status === "in_transit" && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(booking.id, "delivered")}
                                data-testid={`button-deliver-${booking.id}`}
                              >
                                Delivered
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredBookings.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                <p className="text-muted-foreground">No bookings match your search criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Booking ID</p>
                  <p className="font-semibold">{selectedBooking.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <Badge variant="outline" className={statusConfig[selectedBooking.status].color}>
                  {statusConfig[selectedBooking.status].label}
                </Badge>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{(selectedBooking as any).customer?.name || "Customer"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{(selectedBooking as any).customer?.phoneNumber || "N/A"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{(selectedBooking as any).customer?.email || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Flame className="h-4 w-4 text-primary" />
                  Order Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Cylinder</p>
                    <p className="font-medium">{selectedBooking.cylinder?.capacity}kg {selectedBooking.cylinder?.cylinderType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium">{selectedBooking.quantity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Booking Type</p>
                    <p className="font-medium capitalize">{selectedBooking.bookingType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-medium">Rs. {(parseFloat(selectedBooking.cylinder?.price || "0") * selectedBooking.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Dates
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Booking Date</p>
                    <p className="font-medium">{format(selectedBooking.bookingDate, "MMM d, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Delivery Date</p>
                    <p className="font-medium">
                      {selectedBooking.deliveryDate ? format(selectedBooking.deliveryDate, "MMM d, yyyy") : "Not scheduled"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
