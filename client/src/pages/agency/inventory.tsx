import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { mockSupplies, mockCylinders } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { Flame, Package, AlertTriangle, Plus, Minus, Edit2, Loader2 } from "lucide-react";

export default function InventoryPage() {
  const [supplies, setSupplies] = useState(mockSupplies);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<typeof mockSupplies[0] | null>(null);
  const [newStock, setNewStock] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const getStockLevel = (stock: number) => {
    if (stock < 20) return { status: "critical", color: "text-red-500", bgColor: "bg-red-500" };
    if (stock < 50) return { status: "low", color: "text-yellow-500", bgColor: "bg-yellow-500" };
    return { status: "healthy", color: "text-green-500", bgColor: "bg-green-500" };
  };

  const getStockPercentage = (stock: number) => {
    const maxStock = 200;
    return Math.min((stock / maxStock) * 100, 100);
  };

  const handleUpdateStock = (supply: typeof mockSupplies[0]) => {
    setSelectedSupply(supply);
    setNewStock(supply.stock.toString());
    setUpdateModalOpen(true);
  };

  const handleQuickUpdate = (supplyId: string, change: number) => {
    setSupplies(prev =>
      prev.map(s =>
        s.id === supplyId
          ? { ...s, stock: Math.max(0, s.stock + change) }
          : s
      )
    );
    toast({
      title: "Stock Updated",
      description: `Stock ${change > 0 ? "increased" : "decreased"} by ${Math.abs(change)}`,
    });
  };

  const handleSubmitUpdate = async () => {
    if (!selectedSupply || !newStock) return;

    setIsUpdating(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    setSupplies(prev =>
      prev.map(s =>
        s.id === selectedSupply.id
          ? { ...s, stock: parseInt(newStock) }
          : s
      )
    );

    setIsUpdating(false);
    setUpdateModalOpen(false);
    toast({
      title: "Inventory Updated",
      description: `${selectedSupply.cylinder?.capacity}kg ${selectedSupply.cylinder?.cylinderType} stock updated to ${newStock}`,
    });
  };

  const totalStock = supplies.reduce((sum, s) => sum + s.stock, 0);
  const lowStockCount = supplies.filter(s => s.stock < 50).length;
  const criticalStockCount = supplies.filter(s => s.stock < 20).length;

  return (
    <div className="container px-4 md:px-6 py-8 mx-auto">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground">Monitor and manage your cylinder stock levels</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Stock</p>
                  <p className="text-2xl font-bold">{totalStock}</p>
                  <p className="text-xs text-muted-foreground">cylinders</p>
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
                  <p className="text-sm text-muted-foreground">Low Stock Items</p>
                  <p className="text-2xl font-bold">{lowStockCount}</p>
                  <p className="text-xs text-muted-foreground">below 50 units</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Stock</p>
                  <p className="text-2xl font-bold">{criticalStockCount}</p>
                  <p className="text-xs text-muted-foreground">below 20 units</p>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {supplies.map((supply) => {
            const stockLevel = getStockLevel(supply.stock);
            const percentage = getStockPercentage(supply.stock);

            return (
              <Card key={supply.id} data-testid={`card-inventory-${supply.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Flame className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{supply.cylinder?.capacity}kg Cylinder</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">{supply.cylinder?.cylinderType}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        stockLevel.status === "critical"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : stockLevel.status === "low"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      }
                    >
                      {stockLevel.status === "critical" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {stockLevel.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Stock Level</span>
                      <span className="text-lg font-bold">{supply.stock}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {percentage.toFixed(0)}% of max capacity (200)
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuickUpdate(supply.id, -10)}
                        data-testid={`button-decrease-${supply.id}`}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuickUpdate(supply.id, 10)}
                        data-testid={`button-increase-${supply.id}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStock(supply)}
                      className="gap-1"
                      data-testid={`button-edit-${supply.id}`}
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </Button>
                  </div>

                  <div className="pt-3 border-t text-sm text-muted-foreground">
                    Price: Rs. {parseFloat(supply.cylinder?.price || "0").toFixed(2)} per unit
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={updateModalOpen} onOpenChange={setUpdateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
          </DialogHeader>

          {selectedSupply && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Flame className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{selectedSupply.cylinder?.capacity}kg Cylinder</p>
                  <p className="text-sm text-muted-foreground capitalize">{selectedSupply.cylinder?.cylinderType}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">New Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  placeholder="Enter new stock quantity"
                  data-testid="input-new-stock"
                />
                <p className="text-xs text-muted-foreground">
                  Current stock: {selectedSupply.stock} units
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitUpdate} disabled={isUpdating} data-testid="button-save-stock">
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
