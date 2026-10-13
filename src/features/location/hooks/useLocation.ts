import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { LocationData, GPSStatus } from '../../../shared/types/photoTypes';
import { LocationService } from '../services/locationService';
import { PermissionService } from '../../permissions/services/permissionService';

export function useLocation() {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GPSStatus>('ACQUIRING');
  const [isAcquiring, setIsAcquiring] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const refreshLocation = useCallback(async () => {
    setIsAcquiring(true);
    setErrorMessage(null);
    setGpsStatus('ACQUIRING');

    try {
      const isEnabled = await PermissionService.isLocationServicesEnabled();
      if (!isEnabled) {
        setGpsStatus('SERVICES_DISABLED');
        setErrorMessage('Device location services are turned off.');
        setIsAcquiring(false);
        return;
      }

      const hasPerm = await PermissionService.requestLocation();
      if (!hasPerm) {
        setGpsStatus('PERMISSION_DENIED');
        setErrorMessage('Location permission denied.');
        setIsAcquiring(false);
        return;
      }

      const loc = await LocationService.getCurrentLocation();
      setCurrentLocation(loc);
      const evaluated = LocationService.evaluateAccuracy(loc.accuracy);
      setGpsStatus(evaluated);
    } catch (err: any) {
      if (err.message === 'LOCATION_TIMEOUT') {
        setGpsStatus('INSUFFICIENT_ACCURACY');
        setErrorMessage('GPS acquisition timed out. Move closer to open sky.');
      } else {
        setGpsStatus('UNAVAILABLE');
        setErrorMessage('GPS unavailable.');
      }
    } finally {
      setIsAcquiring(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function startWatcher() {
      try {
        const isEnabled = await PermissionService.isLocationServicesEnabled();
        if (!isEnabled) {
          if (mounted) setGpsStatus('SERVICES_DISABLED');
          return;
        }

        const perm = await Location.getForegroundPermissionsAsync();
        if (!perm.granted) {
          if (mounted) setGpsStatus('PERMISSION_DENIED');
          return;
        }

        const sub = await LocationService.watchLocation(
          (loc) => {
            if (mounted) {
              setCurrentLocation(loc);
              setGpsStatus(LocationService.evaluateAccuracy(loc.accuracy));
              setErrorMessage(null);
            }
          },
          () => {
            if (mounted) setGpsStatus('UNAVAILABLE');
          }
        );
        subscriptionRef.current = sub;
      } catch {
        if (mounted) setGpsStatus('UNAVAILABLE');
      }
    }

    startWatcher();

    return () => {
      mounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, []);

  return {
    currentLocation,
    gpsStatus,
    isAcquiring,
    errorMessage,
    refreshLocation,
  };
}
