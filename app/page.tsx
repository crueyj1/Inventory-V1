import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { InventoryTab } from "../components/inventory-tab";

export default function HomePage() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">GMI Cloud Inventory Dashboard</h1>
      <Tabs defaultValue="global" className="w-full">
        <TabsList>
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
  );
}