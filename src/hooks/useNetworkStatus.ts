import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef, useState } from 'react';

// isConnected empieza en true (optimista) para no mostrar el banner de "sin
// conexion" en el primer frame antes de que NetInfo responda.
export function useNetworkStatus(onReconnect: () => void) {
  const [isConnected, setIsConnected] = useState(true);
  const wasConnected = useRef(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = !!state.isConnected;
      setIsConnected(connected);
      if (connected && !wasConnected.current) onReconnect();
      wasConnected.current = connected;
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isConnected;
}
