export const metersToKm = distanceInMeters => Math.round(distanceInMeters / 1000 * 100) / 100;

export const calculatePace = (timeInSeconds, distanceInMeters) => {
  const mins = timeInSeconds / 60;
  const meters = distanceInMeters / 1000;
  const mathPace = (Math.round(mins / meters * 100) / 100).toFixed(2);
  const pace = Math.trunc(mathPace) + Math.round(60 * (mathPace % Math.trunc(mathPace))) / 100;

  return pace.toFixed(2);
};

export const secondsToTime = timeInSeconds => {
  const hour = Math.trunc(timeInSeconds / 60 / 60);
  const min = hour > 0 ? Math.round(timeInSeconds / 60 % 60) : Math.trunc(timeInSeconds / 60);
  const sec = timeInSeconds % 60;
  
  return {
    hour,
    min,
    sec,
  };
}
