# Spec: Geofence Management

## Goal
Allow users to define locations (home, work, custom) or paths (commute routes) with preset destinations for quick access.

## Features
1. Create geofences with name, path (1+ points), and radius/buffer
2. Assign destination stations to each geofence
3. Auto-detect when user enters a geofence
4. Show relevant destinations on home screen

## Geofence Types

A geofence is defined by an array of points plus a buffer radius:
- **Circle** (1 point): Traditional circular geofence (e.g., "Home")
- **Path/Corridor** (2+ points): Linear route with buffer (e.g., "Commute to work")

```typescript
interface Geofence {
  id: string;
  name: string;
  points: Array<{ lat: number; lng: number }>; // 1 point = circle, N points = path
  radius: number; // buffer distance in meters
  destinations: Array<{ stationId: string; stationName: string }>;
}
```

## UI Components
- **Geofence list**: All user's geofences
- **Add/Edit geofence**: Map picker for points, radius slider, destination selector
- **Destination picker**: Search and select stations

## Structure
```
apps/sl-journey/src/
├── app/
│   ├── geofences/
│   │   ├── index.tsx        # List geofences
│   │   ├── [id].tsx         # Edit geofence
│   │   └── new.tsx          # Create geofence
├── components/
│   ├── GeofenceCard.tsx
│   ├── MapPicker.tsx
│   ├── RadiusSlider.tsx
│   └── StationSearch.tsx
├── hooks/
│   ├── useGeofences.ts
│   └── useCurrentGeofence.ts
├── lib/
│   └── geofence.ts          # Detection logic
```

## Acceptance Criteria
- [ ] List all user's geofences
- [ ] Create geofence with name and location(s) (map picker)
- [ ] Support single point (circle) and multi-point (path) geofences
- [ ] Set geofence radius/buffer (default 200m)
- [ ] Add multiple destination stations to geofence
- [ ] Edit existing geofence
- [ ] Delete geofence
- [ ] Detect when user is inside a geofence (circle or path)
- [ ] Home screen shows geofence destinations when inside one
- [ ] Synced to Convex (available on all devices)

## Geofence Detection Logic

```typescript
// src/lib/geofence.ts

/**
 * Check if user is inside a geofence (works for both circles and paths)
 */
function isInsideGeofence(
  userLat: number,
  userLng: number,
  geofence: { points: Array<{ lat: number; lng: number }>; radius: number }
): boolean {
  if (geofence.points.length === 1) {
    // Circle: check distance to single point
    const distance = haversineDistance(
      userLat, userLng,
      geofence.points[0].lat, geofence.points[0].lng
    );
    return distance <= geofence.radius;
  }

  // Path: check distance to nearest line segment
  const minDistance = geofence.points.reduce((min, point, i) => {
    if (i === 0) return min;
    const prevPoint = geofence.points[i - 1];
    const dist = pointToSegmentDistance(
      userLat, userLng,
      prevPoint.lat, prevPoint.lng,
      point.lat, point.lng
    );
    return Math.min(min, dist);
  }, Infinity);

  return minDistance <= geofence.radius;
}

/**
 * Haversine formula for distance between two points
 */
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/**
 * Distance from point P to line segment AB (in meters)
 * Uses equirectangular approximation for small distances
 */
function pointToSegmentDistance(
  px: number, py: number,  // point (lat, lng)
  ax: number, ay: number,  // segment start (lat, lng)
  bx: number, by: number   // segment end (lat, lng)
): number {
  // Convert to approximate planar coordinates (meters)
  const R = 6371000;
  const cosLat = Math.cos(toRad((ax + bx + px) / 3));

  const pxM = toRad(px) * R;
  const pyM = toRad(py) * R * cosLat;
  const axM = toRad(ax) * R;
  const ayM = toRad(ay) * R * cosLat;
  const bxM = toRad(bx) * R;
  const byM = toRad(by) * R * cosLat;

  // Vector from A to B
  const abx = bxM - axM;
  const aby = byM - ayM;

  // Vector from A to P
  const apx = pxM - axM;
  const apy = pyM - ayM;

  // Project P onto line AB, clamped to segment
  const abLenSq = abx * abx + aby * aby;
  if (abLenSq === 0) {
    // A and B are the same point
    return Math.sqrt(apx * apx + apy * apy);
  }

  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / abLenSq));

  // Closest point on segment
  const closestX = axM + t * abx;
  const closestY = ayM + t * aby;

  // Distance from P to closest point
  const dx = pxM - closestX;
  const dy = pyM - closestY;
  return Math.sqrt(dx * dx + dy * dy);
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
```

## Notes
- Use Haversine formula for distance calculation
- Path geofences useful for commute routes (e.g., "walking to metro")
- Consider using expo-location geofencing for background detection (future)
- Map picker can use react-native-maps or simple lat/lng input initially
