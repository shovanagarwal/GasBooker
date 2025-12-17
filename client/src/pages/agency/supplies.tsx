import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { mockSupplies, mockCylinders } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { Flame, Package, Plus, Truck, Calendar, Loader2 } from "lucide-react";

export default function SuppliesPage() {
  const [supplies, setSupplies] = useState(mockSupplies);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedCylinder, setSelectedCylinder] = useState<string>("");
  const [orderQuantity, setOrderQuantity] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);
  const { toast } = useToast();

  const recentOrders = [
    { id: "ord-1", cylinder: mockCylinders[0], quantity: 50, status: "delivered", date: new Date("2024-12-10") },
    { id: "ord-2", cylinder: mockCylinders[1], quantity: 30, status: "in_transit", date: new Date("2024-12-14") },
    { id: "ord-3", cylinder: mockCylinders[2], quantity: 20, status: "pending", date: new Date("2024-12-16") },
  ];

  const handlePlaceOrder = async () => {
    if (!selectedCylinder || !orderQuantity || !expectedDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsOrdering(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsOrdering(false);
    setOrderModalOpen(false);

    toast({
      title: "Order Placed",
      description: `Supply order for ${orderQuantity} cylinders has been placed successfully.`,
    });

    setSelectedCylinder("");
    setOrderQuantity("");
    setExpectedDate("");
  };

  const totalSupplyValue = supplies.reduce((sum, s) => sum + s.stock * parseFloat(s.cylinder?.price || "0"), 0);

  return (
    <div className="container px-4 md:px-6 py-8 mx-auto">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Supply Management</h1>
            <p className="text-muted-foreground">Order new supplies and track incoming stock</p>
          </div>
          <Button onClick={() => setOrderModalOpen(true)} className="gap-2" data-testid="button-new-order">
            <Plus className="h-4 w-4" />
            Place New Order
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Inventory Value</p>
                  <p className="text-2xl font-bold">Rs. {(totalSupplyValue / 1000).toFixed(1)}K</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                  <p className="text-2xl font-bold">{recentOrders.filter(o => o.status === "pending").length}</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Calendar className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Transit</p>
                  <p className="text-2xl font-bold">{recentOrders.filter(o => o.status === "in_transit").length}</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Truck className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Stock Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cylinder Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Stock Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplies.map((supply) => {
                    const stockValue = supply.stock * parseFloat(supply.cylinder?.price || "0");
                    const isLow = supply.stock < 50;
                    const isCritical = supply.stock < 20;

                    return (
                      <TableRow key={supply.id} data-testid={`row-supply-${supply.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Flame className="h-4 w-4 text-primary" />
                            <span className="capitalize">{supply.cylinder?.cylinderType}</span>
                          </div>
                        </TableCell>
                        <TableCell>{supply.cylinder?.capacity} kg</TableCell>
                        <TableCell>Rs. {parseFloat(supply.cylinder?.price || "0").toFixed(2)}</TableCell>
                        <TableCell className="font-semibold">{supply.stock}</TableCell>
                        <TableCell>Rs. {stockValue.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              isCritical
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : isLow
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            }
                          >
                            {isCritical ? "Critical" : isLow ? "Low" : "Healthy"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Supply Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Cylinder</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id.toUpperCase()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Flame className="h-4 w-4 text-primary" />
                          <span>{order.cylinder.capacity}kg {order.cylinder.cylinderType}</span>
                        </div>
                      </TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{order.date.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            order.status === "delivered"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : order.status === "in_transit"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }
                        >
                          {order.status === "in_transit" && <Truck className="h-3 w-3 mr-1" />}
                          {order.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Place Supply Order
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cylinder-type">Cylinder Type</Label>
              <Select value={selectedCylinder} onValueChange={setSelectedCylinder}>
                <SelectTrigger id="cylinder-type" data-testid="select-order-cylinder">
                  <SelectValue placeholder="Select cylinder type" />
                </SelectTrigger>
                <SelectContent>
                  {mockCylinders.map((cylinder) => (
                    <SelectItem key={cylinder.id} value={cylinder.id}>
                      {cylinder.capacity}kg {cylinder.cylinderType} - Rs. {parseFloat(cylinder.price).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(e.target.value)}
                placeholder="Enter quantity"
                data-testid="input-order-quantity"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected-date">Expected Delivery Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="expected-date"
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="pl-10"
                  min={new Date().toISOString().split('T')[0]}
                  data-testid="input-expected-date"
                />
              </div>
            </div>

            {selectedCylinder && orderQuantity && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Total</span>
                  <span className="text-lg font-bold">
                    Rs. {(parseFloat(mockCylinders.find(c => c.id === selectedCylinder)?.price || "0") * parseInt(orderQuantity || "0")).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePlaceOrder} disabled={isOrdering} data-testid="button-confirm-order">
              {isOrdering ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
