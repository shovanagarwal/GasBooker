import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AuthModal } from "@/components/auth-modal";
import { UserRole } from "@/lib/auth-context";
import { 
  Flame, 
  Clock, 
  Shield, 
  Truck, 
  Users, 
  Building2, 
  ArrowRight,
  CheckCircle2,
  Phone,
  MapPin,
  Zap
} from "lucide-react";

export default function LandingPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState<UserRole>("customer");

  const openAuthModal = (role: UserRole) => {
    setAuthRole(role);
    setAuthModalOpen(true);
  };

  const features = [
    {
      icon: Clock,
      title: "Quick Booking",
      description: "Book your gas cylinder in under 60 seconds with our streamlined process",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Get your cylinder delivered to your doorstep within 24-48 hours",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Multiple payment options with bank-grade security for all transactions",
    },
    {
      icon: Zap,
      title: "Real-time Tracking",
      description: "Track your order status from booking to delivery in real-time",
    },
  ];

  const stats = [
    { value: "50K+", label: "Customers Served" },
    { value: "200+", label: "Partner Agencies" },
    { value: "99.5%", label: "Delivery Rate" },
    { value: "24/7", label: "Customer Support" },
  ];

  const steps = [
    { number: "01", title: "Choose Cylinder", description: "Select from domestic, commercial, or industrial cylinders" },
    { number: "02", title: "Select Agency", description: "Pick a nearby gas agency with available stock" },
    { number: "03", title: "Schedule Delivery", description: "Choose your preferred delivery date and time" },
    { number: "04", title: "Make Payment", description: "Pay securely online or cash on delivery" },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container relative px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Flame className="h-4 w-4" />
              Trusted by 50,000+ customers
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Book Your Gas Cylinder{" "}
              <span className="text-primary">in 60 Seconds</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              India's most trusted online gas booking platform. Quick, safe, and reliable 
              LPG cylinder delivery right to your doorstep.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2" onClick={() => openAuthModal("customer")} data-testid="button-hero-customer">
                Book as Customer
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2" onClick={() => openAuthModal("agency")} data-testid="button-hero-agency">
                <Building2 className="h-4 w-4" />
                Agency Portal
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose GasBook?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the convenience of modern gas booking with features designed for your comfort
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group transition-shadow duration-200 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Booking your gas cylinder is simple and straightforward
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-primary/10 mb-2">{step.number}</div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 right-0 w-12 h-0.5 bg-border translate-x-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                For Gas Agencies
              </h2>
              <p className="text-muted-foreground mb-6">
                Join our network of 200+ partner agencies and grow your business with our platform. 
                Manage inventory, track deliveries, and increase your customer base.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Real-time inventory management",
                  "Automated booking notifications",
                  "Analytics and reporting dashboard",
                  "Secure payment processing",
                  "Customer relationship tools",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="gap-2" onClick={() => openAuthModal("agency")} data-testid="button-agency-cta">
                Register Your Agency
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl" />
              <Card className="relative m-4">
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="text-3xl font-bold">156</div>
                      <div className="text-sm text-muted-foreground">Active Bookings</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold">Rs. 1.45L</div>
                      <div className="text-sm text-muted-foreground">Monthly Revenue</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold">89</div>
                      <div className="text-sm text-muted-foreground">Regular Customers</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold">99.2%</div>
                      <div className="text-sm text-muted-foreground">Delivery Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Ready to Get Started?</h2>
              <p className="text-primary-foreground/80">Book your first cylinder today and experience the convenience.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="secondary" className="gap-2" onClick={() => openAuthModal("customer")} data-testid="button-cta-book">
                Book Now
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                <Phone className="h-4 w-4" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-6 w-6 text-primary" />
                <span className="font-semibold text-lg">GasBook</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                India's trusted online gas booking platform for homes and businesses.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Available across India</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Partners</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Join as Agency</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Partner Benefits</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Agency Dashboard</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>support@gasbook.com</li>
                <li>1800-123-4567</li>
                <li>Mon-Sat: 9AM - 8PM</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>2024 GasBook. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultRole={authRole} />
    </div>
  );
}
