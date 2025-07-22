import React, { useEffect, useState } from 'react';

import { Screen, useApi, reactExtension, Text } from '@shopify/ui-extensions-react/point-of-sale';

const SmartGridModal = () => {
  const api = useApi<'pos.home.modal.render'>();

  const [authenticated, setAuthenticated] = useState<number>();
  const [error, setError] = useState<string>();
  const [sessionToken, setSessionToken] = useState<string>();

  useEffect(() => {
    api.session.getSessionToken().then((token) => {
      setSessionToken(token);
      fetch('https://quantities-confidential-observations-steel.trycloudflare.com/api/extensions/test', {
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