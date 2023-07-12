/**
 *
 * Initializer
 *
 */

import { useEffect, useRef } from 'react';
import { pluginId } from '../../../../utils/plugin';

type InitializerProps = {
  setPlugin: (id: string) => void;
};

const Initializer: React.FunctionComponent<InitializerProps> = ({ setPlugin }) => {
  const ref = useRef(setPlugin);

  useEffect(() => {
    ref.current(pluginId);
  }, []);

  return null;
};

export default Initializer;
