// Méthode de Livraison Disponible
const shippingMethods = [{
  id: 1,
  name: "Livraison Express",
  price: 10,
  delivery: "1 - 3 DAYS"
}, {
  id: 2,
  name: "Livraison Classique",
  price: 0,
  delivery: "3 - 6 DAYS"
}];

// Default to Classic  shipping
const defaultShippingMethod = shippingMethods[1];

// Available payment methods
export const paymentMethods = ["Bank Transfer", "Card", "PayPal"];

// Sample product catalog - this would normally come from your product database
export const productCatalog = [{
  id: 1,
  name: "50 Euro Prop Bills",
  basePrice: 100,
  image: "/assets/50.webp"
}, {
  id: 2,
  name: "20 Euro Prop Bills",
  basePrice: 100,
  image: "/assets/20.webp"
}];
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
const OrderContext = createContext(undefined);
export const OrderProvider = ({
  children
}) => {
  const [orderData, setOrderData] = useState(() => {
    // Try to load from localStorage, or use defaults
    const savedCart = localStorage.getItem('propMoneyCart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        return {
          ...defaultOrderData,
          orderItems: parsed.orderItems || defaultOrderData.orderItems
        };
      } catch (error) {
        // Silently fallback to default
        return defaultOrderData;
      }
    }
    return defaultOrderData;
  });

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('propMoneyCart', JSON.stringify({
      orderItems: orderData.orderItems
    }));
  }, [orderData.orderItems]);
  const updateOrderData = data => {
    setOrderData(prev => ({
      ...prev,
      ...data
    }));
  };
  const generateOrderNumber = () => {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumber = `PM-${timestamp}-${random}`;
    updateOrderData({
      orderNumber,
      orderDate: new Date().toISOString()
    });
    return orderNumber;
  };
  const resetOrderData = () => {
    // Reset everything except cart items
    setOrderData(prev => ({
      ...defaultOrderData,
      orderItems: prev.orderItems
    }));
  };
  const calculateTotal = () => {
    const subtotal = orderData.orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
    return subtotal + orderData.shippingMethod.price;
  };

  // Cart management functions
  const addToCart = item => {
    setOrderData(prev => {
      const existingItem = prev.orderItems.find(i => i.id === item.id);
      if (existingItem) {
        // Item already in cart, update quantity
        return {
          ...prev,
          orderItems: prev.orderItems.map(i => i.id === item.id ? {
            ...i,
            quantity: i.quantity + item.quantity
          } : i)
        };
      } else {
        // Add new item to cart
        return {
          ...prev,
          orderItems: [...prev.orderItems, item]
        };
      }
    });
  };
  const removeFromCart = id => {
    setOrderData(prev => ({
      ...prev,
      orderItems: prev.orderItems.filter(item => item.id !== id)
    }));
  };
  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    setOrderData(prev => ({
      ...prev,
      orderItems: prev.orderItems.map(item => item.id === id ? {
        ...item,
        quantity
      } : item)
    }));
  };
  return /*#__PURE__*/React.createElement(OrderContext.Provider, {
    value: {
      orderData,
      updateOrderData,
      generateOrderNumber,
      resetOrderData,
      calculateTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      shippingMethods
    }
  }, children);
};
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
