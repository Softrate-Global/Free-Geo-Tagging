import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { LocationData, GPSStatus } from '../../../shared/types/photoTypes';
import { LocationService } from '../services/locationService';
import { PermissionService } from '../../permissions/services/permissionService';
import { APP_CONSTANTS } from '../../../core/constants/appConstants';

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
      try {
        const geo = await LocationService.reverseGeocode(loc.latitude, loc.longitude);
        if (geo) {
          loc.placeName = geo.placeName;
          loc.subAddress = geo.subAddress;
          loc.formattedAddress = geo.formattedAddress;
        }
      } catch {}

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

  const lastGeocodedCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const isGeocodingRef = useRef(false);
  const smoothedAccuracyRef = useRef<number | null>(null);
  const currentStatusRef = useRef<GPSStatus>('ACQUIRING');
  const lastStateUpdateTimeRef = useRef<number>(0);
  const lastKnownLocRef = useRef<LocationData | null>(null);

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
            if (!mounted) return;

            // 1. Smooth accuracy fluctuations using Exponential Moving Average (EMA)
            const prevAcc = smoothedAccuracyRef.current;
            const smoothedAcc =
              prevAcc == null ? loc.accuracy : prevAcc * 0.6 + loc.accuracy * 0.4;
            smoothedAccuracyRef.current = smoothedAcc;

            // 2. Evaluate status with hysteresis to prevent rapid flickering
            const nextStatus = LocationService.evaluateAccuracy(
              smoothedAcc,
              APP_CONSTANTS.TARGET_ACCURACY_METERS,
              currentStatusRef.current
            );
            if (nextStatus !== currentStatusRef.current) {
              currentStatusRef.current = nextStatus;
              setGpsStatus(nextStatus);
            }

            setErrorMessage(null);

            // 3. Stationary check: filter out high-frequency micro-jitter if standing still
            const now = Date.now();
            const last = lastKnownLocRef.current;
            const hasMoved =
              !last ||
              Math.abs(loc.latitude - last.latitude) > 0.00003 ||
              Math.abs(loc.longitude - last.longitude) > 0.00003;
            const timeElapsed = now - lastStateUpdateTimeRef.current;

            // Update UI location if moved > 3m or if 3s elapsed
            if (hasMoved || timeElapsed > 3000) {
              lastStateUpdateTimeRef.current = now;
              const roundedAcc = Math.round(smoothedAcc);

              setCurrentLocation((prev) => {
                const updated: LocationData = {
                  ...loc,
                  accuracy: roundedAcc,
                  placeName: prev?.placeName,
                  subAddress: prev?.subAddress,
                  formattedAddress: prev?.formattedAddress,
                };
                lastKnownLocRef.current = updated;
                return updated;
              });
            }

            // 4. Trigger reverse geocoding if moved > 25m or on initial startup
            const lastGeo = lastGeocodedCoordsRef.current;
            const needsGeocode =
              !lastGeo ||
              Math.abs(loc.latitude - lastGeo.lat) > 0.00025 ||
              Math.abs(loc.longitude - lastGeo.lng) > 0.00025;

            if (needsGeocode && !isGeocodingRef.current) {
              isGeocodingRef.current = true;
              lastGeocodedCoordsRef.current = { lat: loc.latitude, lng: loc.longitude };

              LocationService.reverseGeocode(loc.latitude, loc.longitude)
                .then((geo) => {
                  if (geo && mounted) {
                    setCurrentLocation((prev) =>
                      prev
                        ? {
                            ...prev,
                            placeName: geo.placeName,
                            subAddress: geo.subAddress,
                            formattedAddress: geo.formattedAddress,
                          }
                        : prev
                    );
                  }
                })
                .catch(() => {})
                .finally(() => {
                  isGeocodingRef.current = false;
                });
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
