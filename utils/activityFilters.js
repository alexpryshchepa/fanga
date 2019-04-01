import { point, polygon, booleanPointInPolygon } from '@turf/turf';
import polyline from '@mapbox/polyline';

export function byBound(activities, bound) {
  const turfPolygon = polygon([bound]);

  const filteredActivities = activities.filter(activity => {
    if (!activity.map.summary_polyline) {
      return false;
    }

    const decodedMapRoute = polyline.decode(activity.map.summary_polyline);
    const turfPoint = point(decodedMapRoute[0].reverse());

    return booleanPointInPolygon(turfPoint, turfPolygon);
  });

  return filteredActivities;
}

export function byType(activities, type = '') {
  const filteredActivities = activities.filter(activity => activity.type === type);

  return filteredActivities;
}
