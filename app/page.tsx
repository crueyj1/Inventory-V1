"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { InventoryTab } from "../components/inventory-tab";
import { AppHeader } from "../components/layout/app-header";
import { ErrorBoundary } from "../components/error-boundary";

export default function HomePage() {
  return (
    <ErrorBoundary fallback={<div className="p-4 text-red-500">Something went wrong. Please try again later.</div>}>
      <div className="min-h-screen flex flex-col">
        <AppHeader title="GMI Cloud Inventory Dashboard" />
        
        <main className="flex-1 p-4">
          <Tabs defaultValue="global" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="global">Global Partner Inventory</TabsTrigger>
              <TabsTrigger value="internal">Internal GMI Inventory</TabsTrigger>
            </TabsList>
            <TabsContent value="global">
              <InventoryTab source="global" />
            </TabsContent>
            <TabsContent value="internal">
              <InventoryTab source="internal" />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ErrorBoundary>
  );
}