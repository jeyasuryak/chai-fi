import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Save, X, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { MenuItem, InsertMenuItem } from "@shared/schema";

interface EditingMenuItem extends Partial<MenuItem> {
  isEditing?: boolean;
}

export default function AdminPage() {
  const [editingItem, setEditingItem] = useState<EditingMenuItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItem, setNewItem] = useState<InsertMenuItem>({
    name: "",
    description: "",
    price: "",
    category: "Tea",
    image: "",
    available: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  const categories = ["Tea", "Coffee", "Snacks", "Beverages"];

  const handleCreateItem = async () => {
    try {
      const response = await apiRequest("POST", "/api/menu", newItem);
      if (response.ok) {
        toast({
          title: "Success",
          description: "Menu item created successfully",
        });
        setNewItem({
          name: "",
          description: "",
          price: "",
          category: "Tea",
          image: "",
          available: true,
        });
        setIsAddingNew(false);
        queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create menu item",
        variant: "destructive",
      });
    }
  };

  const handleUpdateItem = async (id: string) => {
    if (!editingItem) return;

    try {
      const response = await apiRequest("PUT", `/api/menu/${id}`, editingItem);
      if (response.ok) {
        toast({
          title: "Success",
          description: "Menu item updated successfully",
        });
        setEditingItem(null);
        queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update menu item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Are you sure you want to mark this item as unavailable?")) {
      try {
        const response = await apiRequest("DELETE", `/api/menu/${id}`);
        if (response.ok) {
          toast({
            title: "Success",
            description: "Menu item marked as unavailable",
          });
          queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete menu item",
          variant: "destructive",
        });
      }
    }
  };

  const startEditing = (item: MenuItem) => {
    setEditingItem({ ...item, isEditing: true });
  };

  const cancelEditing = () => {
    setEditingItem(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary">Admin Panel</h1>
            <p className="text-muted-foreground">Manage menu items and operations</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <BarChart3 size={20} />
              Dashboard
            </Button>
            <Button
              onClick={() => setIsAddingNew(true)}
              className="bg-primary text-primary-foreground"
              disabled={isAddingNew}
            >
              <Plus className="mr-2" size={20} />
              Add New Item
            </Button>
          </div>
        </div>

        {/* Add New Item Form */}
        {isAddingNew && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Menu Item</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-name">Name</Label>
                  <Input
                    id="new-name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Enter item name"
                  />
                </div>
                <div>
                  <Label htmlFor="new-price">Price (₹)</Label>
                  <Input
                    id="new-price"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <Label htmlFor="new-category">Category</Label>
                  <select
                    id="new-category"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full p-2 border border-border rounded-md"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="new-image">Image URL</Label>
                  <Input
                    id="new-image"
                    value={newItem.image}
                    onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                    placeholder="Enter image URL"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="new-description">Description</Label>
                  <Input
                    id="new-description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Enter description"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  onClick={() => setIsAddingNew(false)}
                  variant="outline"
                >
                  <X className="mr-2" size={16} />
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateItem}
                  className="bg-primary text-primary-foreground"
                  disabled={!newItem.name || !newItem.price}
                >
                  <Save className="mr-2" size={16} />
                  Save Item
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Menu Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Menu Items ({menuItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Image</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Price</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </td>
                      <td className="p-2">
                        {editingItem?.id === item.id ? (
                          <Input
                            value={editingItem.name}
                            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                            className="w-full"
                          />
                        ) : (
                          <span className="font-semibold">{item.name}</span>
                        )}
                      </td>
                      <td className="p-2 max-w-xs">
                        {editingItem?.id === item.id ? (
                          <Input
                            value={editingItem.description}
                            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                            className="w-full"
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground truncate">
                            {item.description}
                          </span>
                        )}
                      </td>
                      <td className="p-2">
                        {editingItem?.id === item.id ? (
                          <Input
                            value={editingItem.price}
                            onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                            className="w-20"
                          />
                        ) : (
                          <span className="font-bold text-primary">₹{item.price}</span>
                        )}
                      </td>
                      <td className="p-2">
                        {editingItem?.id === item.id ? (
                          <select
                            value={editingItem.category}
                            onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                            className="p-1 border border-border rounded"
                          >
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-sm">{item.category}</span>
                        )}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            item.available
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.available ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          {editingItem?.id === item.id ? (
                            <>
                              <Button
                                onClick={() => handleUpdateItem(item.id)}
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white"
                              >
                                <Save size={14} />
                              </Button>
                              <Button
                                onClick={cancelEditing}
                                size="sm"
                                variant="outline"
                              >
                                <X size={14} />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                onClick={() => startEditing(item)}
                                size="sm"
                                variant="outline"
                              >
                                <Edit size={14} />
                              </Button>
                              <Button
                                onClick={() => handleDeleteItem(item.id)}
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}