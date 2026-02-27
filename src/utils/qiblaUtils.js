// Returns the bearing angle to the Kaaba in degrees (0–360) from true north.
// Inputs are decimal degrees for latitude and longitude.
export const calculateQiblaDirection = (latitude, longitude) => {
  const toRadians = (value) => (value * Math.PI) / 180

  const kaabaLatitude = toRadians(21.4225)
  const kaabaLongitude = toRadians(39.8262)

  const userLatitude = toRadians(latitude)
  const userLongitude = toRadians(longitude)

  const deltaLongitude = kaabaLongitude - userLongitude

  const y = Math.sin(deltaLongitude)
  const x =
    Math.cos(userLatitude) * Math.tan(kaabaLatitude) -
    Math.sin(userLatitude) * Math.cos(deltaLongitude)

  const angle = (Math.atan2(y, x) * 180) / Math.PI

  return (angle + 360) % 360
}
