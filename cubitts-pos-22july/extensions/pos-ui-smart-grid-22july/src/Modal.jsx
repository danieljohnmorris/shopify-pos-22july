import React, { useEffect, useState } from 'react';

import { Screen, useApi, reactExtension, Text, ScrollView } from '@shopify/ui-extensions-react/point-of-sale';

const SmartGridModal = () => {
  console.log('🚀 SmartGridModal component initialized');
  const api = useApi();
  console.log('📱 API object:', api);

  const [authenticated, setAuthenticated] = useState();
  const [error, setError] = useState();
  const [data, setData] = useState();
  const [cart, setCart] = useState(null);
  const [cartError, setCartError] = useState(null);
  
  console.log('🔧 Initial state - authenticated:', authenticated, 'error:', error);

  // Separate useEffect for cart investigation to ensure it runs independently
  useEffect(() => {
    console.log('🚨🚨🚨 CART INVESTIGATION useEffect STARTED 🚨🚨🚨');
    
    // Investigate and get cart context
    const getCartContext = async () => {
      console.log('🔥🔥🔥 CART FUNCTION CALLED 🔥🔥🔥');
      try {
        console.log('=== CART INVESTIGATION START ===');
        console.log('🛒 Investigating cart context...');
        api.toast.show('Cart investigation starting...', 3000);
        
        console.log('📱 Full API structure:', Object.keys(api));
        console.log('🛒 Cart API available?', !!api.cart);
        console.log('🛒 Available cart API methods:', api.cart ? Object.keys(api.cart) : 'Cart API not available');
        
        if (api.cart) {
          // Method 1: Try api.cart.get() as shown in examples
          try {
            console.log('🛒 Attempting api.cart.get()...');
            const cartData = api.cart.get();
            console.log('🛒 Cart data from api.cart.get():', cartData);
            api.toast.show(`Cart found! ${cartData?.lineItems?.length || cartData?.lines?.length || 0} items`, 3000);
            setCart(cartData);
          } catch (e) {
            console.log('❌ api.cart.get() error:', e);
            
            // Method 2: Try different cart API methods
            if (typeof api.cart.getCurrent === 'function') {
              console.log('🛒 Attempting api.cart.getCurrent()...');
              const currentCart = await api.cart.getCurrent();
              console.log('🛒 Cart data from getCurrent():', currentCart);
              setCart(currentCart);
            } else if (typeof api.cart.getState === 'function') {
              console.log('🛒 Attempting api.cart.getState()...');
              const cartState = await api.cart.getState();
              console.log('🛒 Cart state:', cartState);
              setCart(cartState);
            } else {
              console.log('🛒 Exploring cart API structure:', api.cart);
              setCart({ apiStructure: api.cart, note: 'Direct cart data access' });
            }
          }
        } else {
          console.log('❌ Cart API not available');
          setCartError('Cart API not available in this context');
        }
      } catch (error) {
        console.error('💥 Error getting cart context:', error);
        setCartError(error.message);
      }
    };
    
    // Call cart investigation
    console.log('🚨🚨🚨 ABOUT TO CALL getCartContext() 🚨🚨🚨');
    getCartContext();
    console.log('🚨🚨🚨 CALLED getCartContext() 🚨🚨🚨');
  }, [api]);

  useEffect(() => {
    console.log('⚡ useEffect triggered - starting authentication flow');
    
    // https://visit-new-types-choir.trycloudflare.com/
    // dont use localhost
    // always get new session token
    const load = async () => {
    console.log('🔄 Starting load function...');
    try {
    console.log('🔑 Getting session token...');
    const token = await api.session.getSessionToken();
    console.log('✅ Session token obtained:', token ? '***TOKEN_PRESENT***' : 'NO_TOKEN');
    
    console.log('Try :', token ? '***TOKEN_PRESENT***' : 'NO_TOKEN');

    // Fargate: http://myserviceloadba-mnckbmha-1300716139.eu-west-1.elb.amazonaws.com/health 
    // Lambda: https://zs5afs7ig6.execute-api.eu-west-1.amazonaws.com/health
    const api_service_url = "https://zs5afs7ig6.execute-api.eu-west-1.amazonaws.com/health";
    console.log('API service URL:', api_service_url);

    console.log('🌐 Making fetch request to cloudflare tunnel... ', api_service_url);
      const res = await fetch(api_service_url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      console.log('📡 Fetch response status:', res.status, res.statusText);
      console.log('📡 Fetch response headers:', Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        console.error('❌ Bad response:', res.status, res.statusText);
        api.toast.show(`Bad request ${res.status}`, 5000);
        throw new Error(`Error: ${res.status}`);
      }

      console.log('📦 Parsing JSON response...');
      const responseData = await res.json();
      console.log('✅ Authentication data received:', responseData);
      setAuthenticated(true);
      setData(responseData);
      console.log('🔄 State updated - authenticated: true, data:', responseData);
    } catch (e) {
        console.error('💥 Error in authentication request:', e);
        console.error('💥 Error stack:', e.stack);
        setError(e.message);
        console.log('🔄 Error state updated:', e.message);
        api.toast.show(`Error in request ${e}`, 5000);
      console.error(e);
    }
    }
    console.log('🚀 Calling load function...');
    load();
  }, []);

  console.log('🎨 Rendering component with state - authenticated:', authenticated, 'error:', error);
  
  return (
    <Screen name='Home' title='Smart Grid example'>
      <ScrollView>
        <Text>Authenticated: {authenticated ? 'true' : 'false'}</Text>
        <Text>Data: {data ? JSON.stringify(data, null, 2) : 'No data'}</Text>
        <Text>Error: {error}</Text>
        
        {/* Cart Context Investigation */}
        <Text>--- Cart Context ---</Text>
        {cartError ? (
          <Text>Cart Error: {cartError}</Text>
        ) : cart ? (
          <>
            <Text>Cart Status: Available</Text>
            
            {/* Display line items if available */}
            {cart.lineItems && cart.lineItems.length > 0 ? (
              <>
                <Text>--- Cart Line Items ({cart.lineItems.length}) ---</Text>
                {cart.lineItems.map((item, index) => (
                  <Text key={item.id || index}>
                    {item.title || item.merchandise?.product?.title || 'Unknown Product'} x {item.quantity || 1}
                    {item.cost?.totalAmount && ` - ${item.cost.totalAmount.amount} ${item.cost.totalAmount.currencyCode}`}
                  </Text>
                ))}
              </>
            ) : cart.lines && cart.lines.length > 0 ? (
              <>
                <Text>--- Cart Lines ({cart.lines.length}) ---</Text>
                {cart.lines.map((line, index) => (
                  <Text key={line.id || index}>
                    {line.merchandise?.product?.title || 'Unknown Product'} x {line.quantity || 1}
                    {line.cost?.totalAmount && ` - ${line.cost.totalAmount.amount} ${line.cost.totalAmount.currencyCode}`}
                  </Text>
                ))}
              </>
            ) : (
              <Text>Cart is empty or no line items found</Text>
            )}
            
            {/* Display cart totals if available */}
            {cart.cost?.totalAmount && (
              <Text>Total: {cart.cost.totalAmount.amount} {cart.cost.totalAmount.currencyCode}</Text>
            )}
            
            {/* Display cart ID if available */}
            {cart.id && (
              <Text>Cart ID: {cart.id}</Text>
            )}
            
            {/* Debug: Show raw cart structure */}
            <Text>--- Debug: Raw Cart Data ---</Text>
            <Text>{JSON.stringify(cart, null, 2)}</Text>
          </>
        ) : (
          <Text>Cart: Loading...</Text>
        )}
      </ScrollView>
    </Screen>
  );
}

export default reactExtension('pos.home.modal.render', () => {
  return <SmartGridModal />
})
