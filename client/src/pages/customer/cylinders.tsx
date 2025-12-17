import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CylinderCard } from "@/components/cylinder-card";
import { mockCylinders, mockAgencies } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, Calendar, Building2, Package, Loader2 } from "lucide-react";

export default function CylindersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedCylinder, setSelectedCylinder] = useState<typeof mockCylinders[0] | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<string>("");
  const [quantity, setQuantity] = useState("1");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [bookingType, setBookingType] = useState<string>("regular");
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();

  const filteredCylinders = mockCylinders.filter((cylinder) => {
    const matchesSearch = cylinder.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cylinder.cylinderType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || cylinder.cylinderType === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleBookClick = (cylinder: typeof mockCylinders[0]) => {
    setSelectedCylinder(cylinder);
    setBookingModalOpen(true);
  };

  const handleBookingSubmit = async () => {
    if (!selectedAgency || !deliveryDate) {
      toast({
        title: "Missing Information",
        description: "Please select an agency and delivery date",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsBooking(false);
    setBookingModalOpen(false);
    
    toast({
      title: "Booking Confirmed!",
      description: `Your ${selectedCylinder?.capacity}kg cylinder booking has been placed successfully.`,
    });

    setSelectedCylinder(null);
    setSelectedAgency("");
    setQuantity("1");
    setDeliveryDate("");
    setBookingType("regular");
  };

  return (
    <div className="container px-4 md:px-6 py-8 mx-auto">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Browse Cylinders</h1>
          <p className="text-muted-foreground">Choose from our range of domestic, commercial, and industrial cylinders</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cylinders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-cylinders"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-cylinder-type">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="domestic">Domestic</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="industrial">Industrial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCylinders.map((cylinder) => (
            <CylinderCard
              key={cylinder.id}
              cylinder={cylinder}
              onBook={() => handleBookClick(cylinder)}
            />
          ))}
        </div>

        {filteredCylinders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No cylinders found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Book Cylinder
            </DialogTitle>
          </DialogHeader>

          {selectedCylinder && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{selectedCylinder.capacity}kg Cylinder</h4>
                      <p className="text-sm text-muted-foreground capitalize">{selectedCylinder.cylinderType}</p>
                    </div>
                    <div className="text-lg font-bold">
                      Rs. {parseFloat(selectedCylinder.price).toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agency">Select Agency</Label>
                  <Select value={selectedAgency} onValueChange={setSelectedAgency}>
                    <SelectTrigger id="agency" data-testid="select-agency">
                      <Building2 className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Choose an agency" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAgencies.map((agency) => (
                        <SelectItem key={agency.id} value={agency.id}>
                          {agency.agencyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Select value={quantity} onValueChange={setQuantity}>
                      <SelectTrigger id="quantity" data-testid="select-quantity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="booking-type">Booking Type</Label>
                    <Select value={bookingType} onValueChange={setBookingType}>
                      <SelectTrigger id="booking-type" data-testid="select-booking-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery-date">Delivery Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="delivery-date"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="pl-10"
                      min={new Date().toISOString().split('T')[0]}
                      data-testid="input-delivery-date"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="text-xl font-bold">
                    Rs. {(parseFloat(selectedCylinder.price) * parseInt(quantity)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBookingSubmit} disabled={isBooking} data-testid="button-confirm-booking">
              {isBooking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
