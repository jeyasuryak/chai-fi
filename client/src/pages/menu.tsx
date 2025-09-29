import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Plus, Minus, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MenuItem, CartItem } from "@shared/schema";

const categories = ["All Items", "Tea", "Coffee", "Snacks", "Beverages"];

export default function MenuPage() {
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [cart, setCart] = useState<CartItem[]>([]);

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  const filteredItems = selectedCategory === "All Items" 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing && existing.quantity > 1) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      } else if (existing && existing.quantity === 1) {
        return prev.filter(cartItem => cartItem.id !== item.id);
      }
      return prev;
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
          <div>
            <h1 className="text-3xl font-bold text-secondary" data-testid="menu-title">Menu</h1>
            <p className="text-muted-foreground" data-testid="menu-subtitle">Select items to add to your order</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="px-6 py-3 rounded-lg font-semibold hover:bg-secondary hover:text-secondary-foreground transition-colors"
              data-testid="button-dashboard"
            >
              <BarChart3 className="mr-2" size={20} />
              Dashboard
            </Button>
            <Button 
              onClick={goToPayment}
              className="relative bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-accent transition-colors"
              disabled={cartCount === 0}
              data-testid="button-cart"
            >
              <ShoppingCart className="mr-2" size={20} />
              Cart
              {cartCount > 0 && (
                <Badge className="cart-badge absolute -top-2 -right-2 w-6 h-6 text-xs rounded-full flex items-center justify-center text-white" data-testid="cart-count">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Menu Categories */}
        <div className="mb-6">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "secondary"}
                className="whitespace-nowrap"
                data-testid={`button-category-${category.toLowerCase().replace(' ', '-')}`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow"
              data-testid={`card-menu-item-${item.id}`}
            >
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-48 object-cover"
                data-testid={`img-menu-item-${item.id}`}
              />
              <div className="p-4">
                <h3 className="font-semibold text-secondary mb-1" data-testid={`text-item-name-${item.id}`}>
                  {item.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-3" data-testid={`text-item-description-${item.id}`}>
                  {item.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-primary" data-testid={`text-item-price-${item.id}`}>
                    ₹{item.price}
                  </span>
                  <div className="flex items-center gap-2">
                    {getItemQuantity(item.id) > 0 && (
                      <Button
                        onClick={() => removeFromCart(item)}
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 rounded-full p-0 border-2"
                        data-testid={`button-decrease-${item.id}`}
                      >
                        <Minus size={14} />
                      </Button>
                    )}
                    {getItemQuantity(item.id) > 0 && (
                      <span 
                        className="min-w-[2rem] text-center font-semibold text-primary"
                        data-testid={`text-quantity-${item.id}`}
                      >
                        {getItemQuantity(item.id)}
                      </span>
                    )}
                    <Button
                      onClick={() => addToCart(item)}
                      size="sm"
                      className="bg-primary text-primary-foreground w-8 h-8 rounded-full hover:bg-accent transition-colors p-0"
                      data-testid={`button-add-to-cart-${item.id}`}
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
            <p className="text-muted-foreground text-lg" data-testid="text-no-items">
              No items found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
