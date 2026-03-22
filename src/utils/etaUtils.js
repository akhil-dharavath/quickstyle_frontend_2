// Distance is calculated using the Haversine formula
export const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

// Maps distance to a human-readable ETA string
export const calculateETA = (distanceKm) => {
    if (distanceKm === null || distanceKm === undefined) return "30-45 mins";
    if (distanceKm < 2) return "10-15 mins";
    if (distanceKm < 5) return "15-25 mins";
    if (distanceKm < 10) return "25-35 mins";
    return "45+ mins";
};
