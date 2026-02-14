# Spec: Trafiklab API Integration

## Goal
Integrate with Trafiklab SL APIs for station data, departures, and live vehicle positions via Convex HTTP actions.

## APIs
- **SL Nearby Stops**: Find stations near a location
- **SL Departures**: Get departures from a station
- **SL Route Planner**: Plan trips between stations
- **GTFS Regional Realtime**: Live vehicle positions

## Structure
```
packages/convex/
├── convex/
│   ├── http.ts              # HTTP action routes
│   └── sl/
│       ├── nearbyStops.ts
│       ├── departures.ts
│       ├── journeyPlanner.ts
│       ├── vehiclePositions.ts  # GTFS Realtime
│       └── cache.ts
```

## Acceptance Criteria
- [ ] Environment variable for Trafiklab API key configured
- [ ] HTTP action: Get nearby stations by lat/lng
- [ ] HTTP action: Get departures for a station
- [ ] HTTP action: Plan route between two stations
- [ ] HTTP action: Get live vehicle positions in bounds
- [ ] Station data cached in Convex (avoid repeated API calls)
- [ ] Error handling for API failures
- [ ] Rate limiting awareness (Trafiklab limits)
- [ ] Mobile app fetches and displays departures

## API Response Shapes

### Nearby Stops
```typescript
{
  stations: Array<{
    id: string
    name: string
    lat: number
    lng: number
    distance: number
  }>
}
```

### Departures
```typescript
{
  departures: Array<{
    line: string
    destination: string
    displayTime: string
    expectedTime: string
    transportMode: 'metro' | 'bus' | 'train' | 'tram' | 'ferry'
  }>
}
```

### Journey Planner (Trip Search)
```typescript
// Request
{
  origin: string           // Station ID or "lat,lng" coordinates
  destination: string      // Station ID or "lat,lng" coordinates
  numTrips?: number        // 1-3, default 3
  maxChanges?: number      // 0-9, default 9
  routeType?: 'leasttime' | 'leastinterchange' | 'leastwalking'
}

// Response
{
  trips: Array<{
    duration: number       // minutes
    legs: Array<{
      origin: {
        name: string
        lat: number
        lng: number
        departureTime: string  // ISO 8601
      }
      destination: {
        name: string
        lat: number
        lng: number
        arrivalTime: string    // ISO 8601
      }
      line: string
      transportMode: 'metro' | 'bus' | 'train' | 'tram' | 'ferry' | 'walk'
      stops: Array<{
        name: string
        arrivalTime: string
        departureTime: string
      }>
    }>
    fare?: {
      price: number        // SEK
      ticketTypes: string[]
    }
  }>
}
```

## Journey Planner API

### Endpoint
```
https://journeyplanner.integration.sl.se/v2/trips
```

### Key Parameters
| Parameter | Required | Description |
|-----------|----------|-------------|
| `type_origin` | Yes | `coord` for coordinates, `any` for station ID |
| `name_origin` | Yes | Station ID or `lat,lng` (WGS84) |
| `type_destination` | Yes | `coord` for coordinates, `any` for station ID |
| `name_destination` | Yes | Station ID or `lat,lng` (WGS84) |
| `calc_number_of_trips` | Yes | Number of results (1-3) |
| `max_changes` | No | Maximum transfers (0-9, default 9) |
| `route_type` | No | `leasttime`, `leastinterchange`, `leastwalking` |

### Transit Type Filters
- `incl_mot_0`: Commuter trains (default: true)
- `incl_mot_2`: Metro (default: true)
- `incl_mot_5`: Buses (default: true)
- `incl_mot_14`: National trains (default: true)

### Implementation
```typescript
// packages/convex/convex/sl/journeyPlanner.ts
export async function planJourney(
  origin: string,
  destination: string,
  options?: {
    numTrips?: number
    maxChanges?: number
    routeType?: 'leasttime' | 'leastinterchange' | 'leastwalking'
  }
) {
  const params = new URLSearchParams({
    type_origin: origin.includes(',') ? 'coord' : 'any',
    name_origin: origin,
    type_destination: destination.includes(',') ? 'coord' : 'any',
    name_destination: destination,
    calc_number_of_trips: String(options?.numTrips ?? 3),
    outputFormat: 'json',
  });

  if (options?.maxChanges !== undefined) {
    params.set('max_changes', String(options.maxChanges));
  }
  if (options?.routeType) {
    params.set('route_type', options.routeType);
  }

  const response = await fetch(
    `https://journeyplanner.integration.sl.se/v2/trips?${params}`
  );

  return response.json();
}
```

### Notes
- No API key required for Journey Planner v2
- Avoid excessive requests to maintain service availability
- Results include fare information when available

### Vehicle Positions (GTFS Realtime)
```typescript
{
  vehicles: Array<{
    vehicleId: string
    lat: number
    lng: number
    bearing: number       // heading direction in degrees
    speed: number         // meters per second
    lineNumber: string
    tripId: string
    routeId: string
    transportMode: 'metro' | 'bus' | 'train' | 'tram' | 'ferry'
    destination: string
    timestamp: string     // ISO 8601 with offset
  }>
}
```

## GTFS Realtime Integration

### Data Format
GTFS Realtime uses Protocol Buffers (protobuf). Parse using `gtfs-realtime-bindings`.

```typescript
// packages/convex/convex/sl/vehiclePositions.ts
import GtfsRealtimeBindings from "gtfs-realtime-bindings";

export async function fetchVehiclePositions(bounds: MapBounds) {
  const response = await fetch(
    "https://opendata.samtrafiken.se/gtfs-rt/sl/VehiclePositions.pb",
    {
      headers: {
        "Accept": "application/x-protobuf",
        "Authorization": `Bearer ${TRAFIKLAB_API_KEY}`,
      },
    }
  );

  const buffer = await response.arrayBuffer();
  const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
    new Uint8Array(buffer)
  );

  return feed.entity
    .filter((entity) => entity.vehicle)
    .map((entity) => ({
      vehicleId: entity.vehicle.vehicle.id,
      lat: entity.vehicle.position.latitude,
      lng: entity.vehicle.position.longitude,
      bearing: entity.vehicle.position.bearing,
      speed: entity.vehicle.position.speed,
      tripId: entity.vehicle.trip.tripId,
      routeId: entity.vehicle.trip.routeId,
      timestamp: new Date(entity.vehicle.timestamp * 1000).toISOString(),
    }))
    .filter((v) => isInBounds(v, bounds)); // Filter to map viewport
}
```

### Trafiklab APIs Required
1. **GTFS Regional Realtime (SL)** - Vehicle positions, trip updates, service alerts
2. **GTFS Regional Static (SL)** - Route/trip metadata for enriching realtime data

## Dependencies
- Trafiklab API key (user provides)
- gtfs-realtime-bindings (protobuf parsing)

## Notes
- User must register at https://www.trafiklab.se/ for API key
- Cache station metadata (rarely changes)
- Departures should not be cached (real-time data)
- Vehicle positions update every ~3 seconds
- Filter vehicles by map bounds to reduce data transfer
- Consider caching static GTFS data (routes, stops) locally
