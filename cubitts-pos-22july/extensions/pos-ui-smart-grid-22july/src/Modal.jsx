import React, { useEffect, useState } from 'react';

import { Screen, useApi, reactExtension, Text } from '@shopify/ui-extensions-react/point-of-sale';

const SmartGridModal = () => {
  console.log('🚀 SmartGridModal component initialized');
  const api = useApi();
  console.log('📱 API object:', api);

  const [authenticated, setAuthenticated] = useState();
  const [error, setError] = useState();
  
  console.log('🔧 Initial state - authenticated:', authenticated, 'error:', error);

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

    const api_service_url = "http://MyServiceLoadBa-mnckbmha-1300716139.eu-west-1.elb.amazonaws.com/health";
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
      const data = await res.json();
      console.log('✅ Authentication data received:', data);
      setAuthenticated(data);
      console.log('🔄 State updated - authenticated set to:', data);
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
    <Screen name='Home' title='Authentication example'>
      <Text>Authenticated: {authenticated ? 'true' : 'false'}</Text>
      
      <Text>Error: {error}</Text>
    </Screen>
  );
}

export default reactExtension('pos.home.modal.render', () => {
  return <SmartGridModal />
})
