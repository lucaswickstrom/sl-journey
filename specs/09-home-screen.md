# Spec: Home Screen

## Goal
Display departures based on user's current location, with an interactive 3D map showing position, stations, geofences, and live transit vehicles.

## Features
1. Auto-detect nearby stations using device location
2. Show departures from nearest station(s)
3. Highlight pinned trips
4. Show geofence-based destinations when in a geofence
5. **3D Map** with current position, stations, and geofences
6. **Live transit locations** (trains/buses in real-time)

## UI Components
- **3D Map**: Shows user position, nearby stations, active geofences
- **Header**: Current location name or "Near [Station]"
- **Departure list**: Grouped by line/direction
- **Quick filters**: Metro, Bus, Train, Tram, Ferry
- **Pull to refresh**: Reload departures

## Structure
```
apps/sl-journey/src/
├── app/
│   ├── index.tsx            # Home screen
│   └── _layout.tsx
├── components/
│   ├── Map3D.tsx            # 3D map component
│   ├── StationMarker.tsx    # Station pin on map
│   ├── GeofenceOverlay.tsx  # Geofence visualization
│   ├── VehicleMarker.tsx    # Live transit vehicle
│   ├── DepartureCard.tsx
│   ├── DepartureList.tsx
│   └── TransportFilter.tsx
├── hooks/
│   ├── useLocation.ts
│   ├── useNearbyStations.ts
│   ├── useDepartures.ts
│   └── useLiveVehicles.ts   # Live transit positions
```

## 3D Map

### Features
- User's current position (blue dot with heading)
- Nearby stations (colored by transport type)
- Active geofences (semi-transparent overlay - circle or path)
- Tap station to see departures
- **Grayscale base map** with no labels (custom markers pop with color)

### Map Style
Dark grayscale map with no labels to make colored markers stand out.

```typescript
// src/lib/mapStyle.ts
export const grayscaleDarkStyle = [
  { elementType: "geometry", stylers: [{ color: "#1d1d1d" }] },
  { elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a1a1a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e0e0e" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
];
```

### Implementation
```tsx
// src/components/Map3D.tsx
import MapView, { Marker, Circle, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { grayscaleDarkStyle } from "../lib/mapStyle";

interface Map3DProps {
  userLocation: { lat: number; lng: number };
  stations: Station[];
  geofences: Geofence[];
  onStationPress: (station: Station) => void;
}

export const Map3D = ({ userLocation, stations, geofences, onStationPress }: Map3DProps) => {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{ flex: 1 }}
      customMapStyle={grayscaleDarkStyle}
      initialRegion={{
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      showsUserLocation
      pitchEnabled
      rotateEnabled
      {/* Station markers */}
      {stations.map((station) => (
        <Marker
          key={station.id}
          coordinate={{ latitude: station.lat, longitude: station.lng }}
          onPress={() => onStationPress(station)}
        />
      ))}

      {/* Geofence overlays */}
      {geofences.map((geofence) => (
        geofence.points.length === 1 ? (
          <Circle
            key={geofence.id}
            center={{ latitude: geofence.points[0].lat, longitude: geofence.points[0].lng }}
            radius={geofence.radius}
            fillColor="rgba(0, 119, 200, 0.2)"
            strokeColor="rgba(0, 119, 200, 0.5)"
          />
        ) : (
          <Polyline
            key={geofence.id}
            coordinates={geofence.points.map(p => ({ latitude: p.lat, longitude: p.lng }))}
            strokeColor="rgba(0, 119, 200, 0.5)"
            strokeWidth={geofence.radius / 10} // Visual approximation
          />
        )
      ))}
    </MapView>
  );
};
```

## Live Transit Locations

Real-time vehicle positions on the map.

### Data Source
SL provides real-time vehicle positions via GTFS Realtime feed (Trafiklab).

### Implementation
```typescript
// src/hooks/useLiveVehicles.ts
import { useQuery } from "@tanstack/react-query";

interface VehiclePosition {
  vehicleId: string;
  lat: number;
  lng: number;
  bearing: number; // heading direction
  lineNumber: string;
  transportMode: "metro" | "bus" | "train" | "tram" | "ferry";
  destination: string;
}

export function useLiveVehicles(bounds: MapBounds) {
  return useQuery({
    queryKey: ["liveVehicles", bounds],
    queryFn: () => fetchVehiclePositions(bounds),
    refetchInterval: 3000, // Update every 3 seconds
    staleTime: 2000,
  });
}
```

```tsx
// src/components/VehicleMarker.tsx
interface VehicleMarkerProps {
  vehicle: VehiclePosition;
}

export const VehicleMarker = ({ vehicle }: VehicleMarkerProps) => {
  const color = getTransportColor(vehicle.transportMode, vehicle.lineNumber);

  return (
    <Marker
      coordinate={{ latitude: vehicle.lat, longitude: vehicle.lng }}
      rotation={vehicle.bearing}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View style={[styles.vehicle, { backgroundColor: color }]}>
        <Text style={styles.lineNumber}>{vehicle.lineNumber}</Text>
      </View>
    </Marker>
  );
};
```

### Trafiklab API
- **GTFS Regional Realtime** - Vehicle positions for SL
- Requires API key from Trafiklab
- Returns protobuf data (GTFS Realtime format)

## Acceptance Criteria

### Core
- [ ] Location permission requested on first launch
- [ ] Nearby stations fetched based on current location
- [ ] Departures displayed in real-time
- [ ] Auto-refresh every 30 seconds
- [ ] Pull-to-refresh works
- [ ] Transport mode filters work
- [ ] Pinned trips highlighted at top
- [ ] Loading and error states handled
- [ ] Works offline with cached data (graceful degradation)

### 3D Map
- [ ] Map shows user's current position
- [ ] Grayscale dark base map with no labels
- [ ] Nearby stations displayed with transport-type colors
- [ ] Geofences visualized (circles and paths)
- [ ] Tap station to view departures
- [ ] Map supports 3D tilt and rotation

### Live Vehicles
- [ ] Real-time vehicle positions on map
- [ ] Vehicles colored by transport type/line
- [ ] Vehicles show heading direction
- [ ] Updates every 3 seconds
- [ ] Only fetch vehicles in visible map bounds

## Dependencies
- react-native-maps (map component)
- expo-location (user position)

## Notes
- Use expo-location for foreground location
- Consider battery impact of location updates
- Show "Location unavailable" state gracefully
- Live vehicles may have significant data usage - consider toggle
- GTFS Realtime requires protobuf parsing (use gtfs-realtime-bindings)
