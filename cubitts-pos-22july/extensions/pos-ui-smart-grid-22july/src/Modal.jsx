import React, { useEffect, useState } from 'react';

import { Screen, useApi, reactExtension, Text } from '@shopify/ui-extensions-react/point-of-sale';

const SmartGridModal = () => {
  const api = useApi();

  const [authenticated, setAuthenticated] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    // https://visit-new-types-choir.trycloudflare.com/
    // dont use localhost
    // always get new session token
    const load = async () => {
    try {
    const token = await api.session.getSessionToken()
      const res = await fetch('https://st-verse-qualified-da.trycloudflare.com', {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        api.toast.show(`Bad request ${res.status}`, 5000)
        throw new Error(`Error ${url}: ${res.status}`)
      }

      const data = await res.json();
      setAuthenticated(data)
    } catch (e) {
        api.toast.show(`Error in request ${e}`, 5000)
      console.error(e);
    }
    }
    load()
  }, []);

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
