import React, { useEffect, useState } from 'react';

import { Screen, useApi, reactExtension, Text } from '@shopify/ui-extensions-react/point-of-sale';

const SmartGridModal = () => {
  const api = useApi();

  const [authenticated, setAuthenticated] = useState();
  const [error, setError] = useState();
  const [sessionToken, setSessionToken] = useState();

  useEffect(() => {
    // https://visit-new-types-choir.trycloudflare.com/
    // http://localhost:9000
    api.session.getSessionToken().then((token) => {
      setSessionToken(token);
      fetch('https://visit-new-types-choir.trycloudflare.com/', {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => setAuthenticated(response.status))
        .catch(setError);
    });
  }, []);

  return (
    <Screen name='Home' title='Authentication example'>
      <Text>Token: {sessionToken}</Text>
      <Text>Authenticated: {authenticated}</Text>
      <Text>Error: {error}</Text>
    </Screen>
  );
}

export default reactExtension('pos.home.modal.render', () => {
  return <SmartGridModal />
})
