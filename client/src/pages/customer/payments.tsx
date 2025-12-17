import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatsCard } from "@/components/stats-card";
import { mockPayments } from "@/lib/mock-data";
import { format } from "date-fns";
import { Search, CreditCard, IndianRupee, CheckCircle2, Clock, Wallet, Smartphone } from "lucide-react";

const paymentModeIcons = {
  cash: Wallet,
  card: CreditCard,
  upi: Smartphone,
  net_banking: CreditCard,
};

const paymentModeLabels = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  net_banking: "Net Banking",
};

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [modeFilter, setModeFilter] = useState<string>("all");

  const filteredPayments = mockPayments.filter((payment) => {
    const matchesSearch = payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode = modeFilter === "all" || payment.paymentMode === modeFilter;
    return matchesSearch && matchesMode;
  });

  const totalAmount = mockPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const completedPayments = mockPayments.filter(p => p.status === "completed").length;
  const pendingPayments = mockPayments.filter(p => p.status === "pending").length;

  return (
    <div className="container px-4 md:px-6 py-8 mx-auto">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Payment History</h1>
          <p className="text-muted-foreground">View and manage all your payment transactions</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Spent"
            value={`Rs. ${totalAmount.toFixed(2)}`}
            icon={IndianRupee}
          />
          <StatsCard
            title="Completed Payments"
            value={completedPayments}
            icon={CheckCircle2}
          />
          <StatsCard
            title="Pending Payments"
            value={pendingPayments}
            icon={Clock}
          />
          <StatsCard
            title="Average Transaction"
            value={`Rs. ${(totalAmount / mockPayments.length).toFixed(2)}`}
            icon={CreditCard}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by payment ID or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-payments"
            />
          </div>
          <Select value={modeFilter} onValueChange={setModeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-payment-mode">
              <SelectValue placeholder="Payment mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="net_banking">Net Banking</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => {
                    const ModeIcon = paymentModeIcons[payment.paymentMode];
                    return (
                      <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                        <TableCell className="font-medium">
                          {payment.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          {payment.bookingId.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          {format(payment.paymentDate, "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ModeIcon className="h-4 w-4 text-muted-foreground" />
                            <span>{paymentModeLabels[payment.paymentMode]}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          Rs. {parseFloat(payment.amount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              payment.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }
                          >
                            {payment.status === "completed" ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredPayments.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No payments found</h3>
                <p className="text-muted-foreground">No payment records match your search criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
