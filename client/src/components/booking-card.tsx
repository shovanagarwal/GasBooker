import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Truck, Building2, Flame, Clock, CheckCircle2, XCircle, Package } from "lucide-react";

interface BookingCardProps {
  booking: {
    id: string;
    bookingDate: Date;
    deliveryDate: Date | null;
    status: "pending" | "confirmed" | "in_transit" | "delivered" | "cancelled";
    bookingType: "regular" | "emergency" | "subscription";
    quantity: number;
    cylinder?: {
      capacity: string;
      cylinderType: string;
      price: string;
    };
    agency?: {
      agencyName: string;
    };
  };
  onViewDetails?: () => void;
  onCancel?: () => void;
}

const statusConfig = {
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  in_transit: { label: "In Transit", icon: Truck, color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  delivered: { label: "Delivered", icon: CheckCircle2, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

const typeConfig = {
  regular: { label: "Regular", color: "bg-secondary text-secondary-foreground" },
  emergency: { label: "Emergency", color: "bg-destructive/10 text-destructive" },
  subscription: { label: "Subscription", color: "bg-primary/10 text-primary" },
};

export function BookingCard({ booking, onViewDetails, onCancel }: BookingCardProps) {
  const status = statusConfig[booking.status];
  const type = typeConfig[booking.bookingType];
  const StatusIcon = status.icon;

  return (
    <Card className="transition-shadow duration-200 hover:shadow-md" data-testid={`card-booking-${booking.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base">
                {booking.cylinder?.capacity}kg {booking.cylinder?.cylinderType} Cylinder
              </h3>
              <p className="text-sm text-muted-foreground">
                Qty: {booking.quantity}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className={type.color}>
              {type.label}
            </Badge>
            <Badge variant="outline" className={status.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Booked: {format(booking.bookingDate, "MMM d, yyyy")}</span>
          </div>
          {booking.deliveryDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Truck className="h-4 w-4" />
              <span>Delivery: {format(booking.deliveryDate, "MMM d, yyyy")}</span>
            </div>
          )}
          {booking.agency && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{booking.agency.agencyName}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2 pt-3 border-t flex-wrap">
        <div className="font-semibold">
          Total: Rs. {(parseFloat(booking.cylinder?.price || "0") * booking.quantity).toFixed(2)}
        </div>
        <div className="flex gap-2">
          {booking.status === "pending" && onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel} data-testid={`button-cancel-${booking.id}`}>
              Cancel
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onViewDetails} data-testid={`button-view-${booking.id}`}>
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
