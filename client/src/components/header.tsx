import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { AuthModal } from "./auth-modal";
import { useAuthContext, UserRole } from "@/lib/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Flame, Menu, LogOut, User, Settings, LayoutDashboard } from "lucide-react";

export function Header() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState<UserRole>("customer");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, userRole } = useAuthContext();
  const [location] = useLocation();

  const openAuthModal = (role: UserRole) => {
    setAuthRole(role);
    setAuthModalOpen(true);
  };

  const navItems = isAuthenticated
    ? userRole === "customer"
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/cylinders", label: "Cylinders" },
          { href: "/bookings", label: "My Bookings" },
          { href: "/payments", label: "Payments" },
        ]
      : [
          { href: "/agency/dashboard", label: "Dashboard" },
          { href: "/agency/bookings", label: "Bookings" },
          { href: "/agency/inventory", label: "Inventory" },
          { href: "/agency/supplies", label: "Supplies" },
        ]
    : [];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between gap-4 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2" data-testid="link-home">
            <Flame className="h-7 w-7 text-primary" />
            <span className="font-semibold text-lg hidden sm:inline">GasBook</span>
          </Link>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={location === item.href ? "secondary" : "ghost"}
                    size="sm"
                    data-testid={`link-nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild className="md:hidden">
                    <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[280px]">
                    <nav className="flex flex-col gap-2 mt-8">
                      {navItems.map((item) => (
                        <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                          <Button
                            variant={location === item.href ? "secondary" : "ghost"}
                            className="w-full justify-start"
                          >
                            {item.label}
                          </Button>
                        </Link>
                      ))}
                      <Button variant="ghost" className="w-full justify-start text-destructive" onClick={logout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </nav>
                  </SheetContent>
                </Sheet>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.profileImageUrl} alt={user?.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center gap-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl} alt={user?.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user?.name}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={userRole === "customer" ? "/dashboard" : "/agency/dashboard"} className="flex items-center cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer" data-testid="button-logout">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => openAuthModal("customer")} data-testid="button-customer-login">
                  Customer Login
                </Button>
                <Button size="sm" onClick={() => openAuthModal("agency")} data-testid="button-agency-login">
                  Agency Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultRole={authRole} />
    </>
  );
}
