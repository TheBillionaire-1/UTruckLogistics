import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Truck } from "lucide-react";
import { Link } from "wouter";

export default function NavBar() {
  const { user, logoutMutation } = useAuth();

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center gap-2 font-semibold text-lg">
            <Truck className="h-6 w-6" />
            UTruck
          </a>
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <Link href="/booking">
                <Button variant="ghost">Book Transport</Button>
              </Link>
              <Link href="/driver/bookings">
                <Button variant="ghost">Driver Dashboard</Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}