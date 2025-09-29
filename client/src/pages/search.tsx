import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ShoppingCart, Plus, Minus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import type { MenuItem, CartItem } from "@shared/schema";

const categories = ["All Items", "Tea", "Coffee", "Snacks", "Beverages"];

export default function SearchPage() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  // Filter items based on search query and category
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All Items" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      let newCart;
      if (existing) {
        newCart = prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        newCart = [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
      }
      localStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      let newCart;
      if (existing && existing.quantity > 1) {
        newCart = prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      } else if (existing && existing.quantity === 1) {
        newCart = prev.filter(cartItem => cartItem.id !== item.id);
      } else {
        newCart = prev;
      }
      localStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const getItemQuantity = (itemId: string): number => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const goToPayment = () => {
    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/payment");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate("/menu")}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="mr-2" size={16} />
              Back to Menu
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-secondary">Search Menu</h1>
              <p className="text-muted-foreground">Find your favorite items</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="px-6 py-3 rounded-lg font-semibold hover:bg-secondary hover:text-secondary-foreground transition-colors"
            >
              Dashboard
            </Button>
            <Button 
              onClick={goToPayment}
              className="relative bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-accent transition-colors"
              disabled={cartCount === 0}
            >
              <ShoppingCart className="mr-2" size={20} />
              Cart
              {cartCount > 0 && (
                <Badge className="cart-badge absolute -top-2 -right-2 w-6 h-6 text-xs rounded-full flex items-center justify-center text-white">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-6">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "secondary"}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        <div className="mb-4">
          <p className="text-muted-foreground">
            {searchQuery ? `Found ${filteredItems.length} items for "${searchQuery}"` : `Showing ${filteredItems.length} items`}
          </p>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow"
            >
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-secondary mb-1">
                  {item.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  {item.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-primary">
                    ₹{item.price}
                  </span>
                  <div className="flex items-center gap-2">
                    {getItemQuantity(item.id) > 0 && (
                      <Button
                        onClick={() => removeFromCart(item)}
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 rounded-full p-0 border-2"
                      >
                        <Minus size={14} />
                      </Button>
                    )}
                    {getItemQuantity(item.id) > 0 && (
                      <span className="min-w-[2rem] text-center font-semibold text-primary">
                        {getItemQuantity(item.id)}
                      </span>
                    )}
                    <Button
                      onClick={() => addToCart(item)}
                      size="sm"
                      className="bg-primary text-primary-foreground w-8 h-8 rounded-full hover:bg-accent transition-colors p-0"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Search className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-muted-foreground text-lg">
              {searchQuery ? `No items found for "${searchQuery}"` : "No items found in this category."}
            </p>
            {searchQuery && (
              <Button 
                onClick={() => setSearchQuery("")}
                variant="outline"
                className="mt-4"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* Powered by Innowara */}
        <div className="mt-8 flex justify-center items-center">
          <div className="bg-white rounded-xl shadow-sm border border-border p-4 flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Innowara Logo" 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                // Fallback if image doesn't load
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Powered by</p>
              <p className="font-semibold text-primary">Innowara</p>
              <p className="text-xs text-muted-foreground">IT Solutions - Web & Mobile Apps</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}