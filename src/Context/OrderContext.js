// =============================================
// ORDER CONTEXT - MythicMarket (JavaScript Vanilla)
// =============================================
// Ce fichier gère le contexte des commandes et le panier
// Version JavaScript vanilla (pas React)

// Méthode de Livraison Disponible
const shippingMethods = [
  {
    id: 1,
    name: "Livraison Express",
    price: 10,
    delivery: "1 - 3 DAYS",
  },
  {
    id: 2,
    name: "Livraison Classique",
    price: 0,
    delivery: "3 - 6 DAYS",
  },  
];

// Default to Classic shipping
const defaultShippingMethod = shippingMethods[1];

// Available payment methods
const paymentMethods = [
  "Bank Transfer",
  "Card",
  "PayPal"
];

// Sample product catalog - this would normally come from your product database
const productCatalog = [
  {
    id: 1,
    name: "50 Euro Prop Bills",
    basePrice: 100,
    image: "/public/50.webp",
  },
  {
    id: 2,
    name: "20 Euro Prop Bills",
    basePrice: 100,
    image: "/public/20.webp",
  },
  {
    id: 3,
    name: "10 Euro Prop Bills",
    basePrice: 100,
    image: "/public/10.webp",
  },
  {
    id: 4,
    name: "5 Euro Prop Bills",
    basePrice: 100,
    image: "/public/5.webp",
  },
];

const defaultOrderData = {
  name: '',
  phoneNumber: '',
  email: '',
  country: '',
  address: '',
  shippingTo: '',
  postalCode: '',
  city: '',
  discord: '',
  paymentMethod: '',
  orderItems: [],
  shippingMethod: defaultShippingMethod,
  orderNumber: '',
  orderDate: ''
};

// Global order state
let orderData = { ...defaultOrderData };

// Initialize order data from localStorage
const initializeOrderData = () => {
  const savedCart = localStorage.getItem('propMoneyCart');
  if (savedCart) {
    try {
      const parsed = JSON.parse(savedCart);
      orderData = {
        ...defaultOrderData,
        orderItems: parsed.orderItems || defaultOrderData.orderItems
      };
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      orderData = { ...defaultOrderData };
    }
  }
  return orderData;
};

// Save cart to localStorage
const saveCartToStorage = () => {
  localStorage.setItem('propMoneyCart', JSON.stringify({ 
    orderItems: orderData.orderItems 
  }));
};

// Update order data
const updateOrderData = (data) => {
  orderData = { ...orderData, ...data };
  return orderData;
};

// Generate order number
const generateOrderNumber = () => {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const orderNumber = `PM-${timestamp}-${random}`;
  updateOrderData({ orderNumber, orderDate: new Date().toISOString() });
  return orderNumber;
};

// Reset order data
const resetOrderData = () => {
  // Reset everything except cart items
  orderData = {
    ...defaultOrderData,
    orderItems: orderData.orderItems
  };
  return orderData;
};

// Calculate total
const calculateTotal = () => {
  const subtotal = orderData.orderItems.reduce(
    (total, item) => total + item.price * item.quantity, 
    0
  );
  return subtotal + orderData.shippingMethod.price;
};

// Cart management functions
const addToCart = (item) => {
  const existingItem = orderData.orderItems.find(i => i.id === item.id);
  
  if (existingItem) {
    // Item already in cart, update quantity
    orderData.orderItems = orderData.orderItems.map(i => 
      i.id === item.id 
        ? { ...i, quantity: i.quantity + item.quantity } 
        : i
    );
  } else {
    // Add new item to cart
    orderData.orderItems = [...orderData.orderItems, item];
  }
  
  saveCartToStorage();
  return orderData.orderItems;
};

const removeFromCart = (id) => {
  orderData.orderItems = orderData.orderItems.filter(item => item.id !== id);
  saveCartToStorage();
  return orderData.orderItems;
};

const updateQuantity = (id, quantity) => {
  if (quantity < 1) return orderData.orderItems;
  
  orderData.orderItems = orderData.orderItems.map(item => 
    item.id === id ? { ...item, quantity } : item
  );
  
  saveCartToStorage();
  return orderData.orderItems;
};

// Get current order data
const getOrderData = () => orderData;

// Get cart items
const getCartItems = () => orderData.orderItems;

// Get cart count
const getCartCount = () => {
  return orderData.orderItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeOrderData();
});

// Export functions for use in other files
window.OrderContext = {
  shippingMethods,
  paymentMethods,
  productCatalog,
  getOrderData,
  getCartItems,
  getCartCount,
  updateOrderData,
  generateOrderNumber,
  resetOrderData,
  calculateTotal,
  addToCart,
  removeFromCart,
  updateQuantity
};