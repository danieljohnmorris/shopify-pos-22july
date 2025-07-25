import React from 'react';

import { Tile, useApi, reactExtension } from '@shopify/ui-extensions-react/point-of-sale';

const SmartGridTile = () => {
  const api = useApi();

  return (
    <Tile
      title='Example extension'
      enabled
      onPress={api.action.presentModal}
    />
  );
};

export default reactExtension('pos.home.tile.render', () => {
  return <SmartGridTile />
})
