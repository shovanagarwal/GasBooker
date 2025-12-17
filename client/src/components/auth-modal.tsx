import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext, UserRole } from "@/lib/auth-context";
import { Flame, Building2, User, Mail, Lock, Phone, MapPin, Loader2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
}

export function AuthModal({ isOpen, onClose, defaultRole = "customer" }: AuthModalProps) {
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuthContext();

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
    agencyName: "",
    contactNumber: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(loginForm.email, loginForm.password, role);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      return;
    }
    setIsLoading(true);
    try {
      await register({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        phoneNumber: registerForm.phoneNumber,
        address: registerForm.address,
        agencyName: registerForm.agencyName,
        contactNumber: registerForm.contactNumber,
        role,
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Flame className="h-6 w-6 text-primary" />
            Gas Booking System
          </DialogTitle>
          <DialogDescription className="sr-only">
            Sign in or create an account to access the gas booking system
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 p-1 bg-muted rounded-lg mb-4">
          <Button
            variant={role === "customer" ? "default" : "ghost"}
            className="flex-1 gap-2"
            onClick={() => setRole("customer")}
            data-testid="button-role-customer"
          >
            <User className="h-4 w-4" />
            Customer
          </Button>
          <Button
            variant={role === "agency" ? "default" : "ghost"}
            className="flex-1 gap-2"
            onClick={() => setRole("agency")}
            data-testid="button-role-agency"
          >
            <Building2 className="h-4 w-4" />
            Agency
          </Button>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
            <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                    data-testid="input-login-email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                    data-testid="input-login-password"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-login-submit">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Login as {role === "customer" ? "Customer" : "Agency"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-4">
            <form onSubmit={handleRegister} className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {role === "customer" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-name"
                        placeholder="Enter your full name"
                        className="pl-10"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        required
                        data-testid="input-register-name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        className="pl-10"
                        value={registerForm.phoneNumber}
                        onChange={(e) => setRegisterForm({ ...registerForm, phoneNumber: e.target.value })}
                        required
                        data-testid="input-register-phone"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-address"
                        placeholder="Enter your delivery address"
                        className="pl-10"
                        value={registerForm.address}
                        onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                        required
                        data-testid="input-register-address"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="register-agency-name">Agency Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-agency-name"
                        placeholder="Enter agency name"
                        className="pl-10"
                        value={registerForm.agencyName}
                        onChange={(e) => setRegisterForm({ ...registerForm, agencyName: e.target.value })}
                        required
                        data-testid="input-register-agency-name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-contact">Contact Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-contact"
                        type="tel"
                        placeholder="Enter contact number"
                        className="pl-10"
                        value={registerForm.contactNumber}
                        onChange={(e) => setRegisterForm({ ...registerForm, contactNumber: e.target.value })}
                        required
                        data-testid="input-register-contact"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-agency-address">Agency Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-agency-address"
                        placeholder="Enter agency address"
                        className="pl-10"
                        value={registerForm.address}
                        onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                        required
                        data-testid="input-register-agency-address"
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                    data-testid="input-register-email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Create a password"
                    className="pl-10"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                    data-testid="input-register-password"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    className="pl-10"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    required
                    data-testid="input-register-confirm-password"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-register-submit">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Register as {role === "customer" ? "Customer" : "Agency"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
