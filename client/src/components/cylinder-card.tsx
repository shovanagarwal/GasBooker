import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Weight, IndianRupee } from "lucide-react";

interface CylinderCardProps {
  cylinder: {
    id: string;
    cylinderType: "domestic" | "commercial" | "industrial";
    capacity: string;
    price: string;
    description?: string | null;
    imageUrl?: string | null;
  };
  onBook?: () => void;
  showBookButton?: boolean;
}

const typeColors = {
  domestic: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  commercial: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  industrial: "bg-chart-1/10 text-chart-1 border-chart-1/20",
};

const typeLabels = {
  domestic: "Domestic",
  commercial: "Commercial",
  industrial: "Industrial",
};

export function CylinderCard({ cylinder, onBook, showBookButton = true }: CylinderCardProps) {
  return (
    <Card className="group transition-shadow duration-200 hover:shadow-md" data-testid={`card-cylinder-${cylinder.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Flame className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base">
                {cylinder.capacity}kg Cylinder
              </h3>
              <Badge variant="outline" className={`text-xs ${typeColors[cylinder.cylinderType]}`}>
                {typeLabels[cylinder.cylinderType]}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {cylinder.description || `Standard ${cylinder.cylinderType} LPG cylinder`}
        </p>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Weight className="h-4 w-4" />
            <span>{cylinder.capacity} kg</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2 pt-3 border-t">
        <div className="flex items-center gap-1 text-lg font-bold">
          <IndianRupee className="h-4 w-4" />
          <span>{parseFloat(cylinder.price).toFixed(2)}</span>
        </div>
        {showBookButton && (
          <Button size="sm" onClick={onBook} data-testid={`button-book-${cylinder.id}`}>
            Book Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
