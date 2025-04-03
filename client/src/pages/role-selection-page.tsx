
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Users, Truck } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RoleSelectionPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const roleMutation = useMutation({
    mutationFn: async (role: "customer" | "driver") => {
      await apiRequest.post("/api/user/role", { role });
    },
    onSuccess: () => {
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8">Choose Your Role</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => roleMutation.mutate("customer")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <Users className="w-16 h-16" />
              <h2 className="text-2xl font-semibold">Regular Customer</h2>
              <p className="text-muted-foreground">
                Book cargo transport services and track your shipments
              </p>
              <Button 
                className="w-full"
                disabled={roleMutation.isPending}
              >
                Continue as Customer
              </Button>
            </div>
          </Card>

          <Card 
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => roleMutation.mutate("driver")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <Truck className="w-16 h-16" />
              <h2 className="text-2xl font-semibold">Service Operator</h2>
              <p className="text-muted-foreground">
                Provide transport services and manage bookings
              </p>
              <Button 
                className="w-full"
                disabled={roleMutation.isPending}
              >
                Continue as Operator
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
