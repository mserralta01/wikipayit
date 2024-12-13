import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function ApplicationComplete() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Application Submitted!</CardTitle>
          <CardDescription>
            Thank you for completing your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We have received your application and will review it shortly.
            Our team will contact you with the next steps.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 