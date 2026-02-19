"use client";
import { useState } from 'react';
import { API_BASE_URL } from '@/lib/api';

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance.toFixed(2);
};

export default function NearbyPharmacyPage() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dummy data for display if no real data is fetched or for initial state
  const dummyPharmacies = [
    {
      _id: '65e8a7c2b3f1a9d2c4e5f6g9',
      name: 'Apollo Pharmacy (Lake Gardens)',
      location: { coordinates: [88.3686, 22.4975] }, // Kolkata coordinates for Apollo Pharmacy
      address: { street: '169, Lake Gardens Road', city: 'Kolkata', state: 'West Bengal', zipCode: '700045', country: 'India' },
      contactNumber: '+91 33 2422 6023',
      operatingHours: {
        monday: { open: '08:00', close: '22:00' },
        tuesday: { open: '08:00', close: '22:00' },
        wednesday: { open: '08:00', close: '22:00' },
        thursday: { open: '08:00', close: '22:00' },
        friday: { open: '08:00', close: '22:00' },
        saturday: { open: '08:00', close: '22:00' },
        sunday: { open: '09:00', close: '20:00' },
      },
      distance: '0.80'
    },
    {
      _id: '65e8a7c2b3f1a9d2c4e5f6h0',
      name: 'Metro Pharma',
      location: { coordinates: [88.3585, 22.5654] }, // Kolkata coordinates for Metro Pharma
      address: { street: '1, Sarat Bose Rd', city: 'Kolkata', state: 'West Bengal', zipCode: '700020', country: 'India' },
      contactNumber: '+91 33 2475 2211',
      operatingHours: {
        monday: { open: '09:00', close: '21:00' },
        tuesday: { open: '09:00', close: '21:00' },
        wednesday: { open: '09:00', close: '21:00' },
        thursday: { open: '09:00', close: '21:00' },
        friday: { open: '09:00', close: '21:00' },
        saturday: { open: '09:00', close: '20:00' },
        sunday: { open: '10:00', close: '18:00' },
      },
      distance: '1.50'
    },
  ];

  const detectLocation = () => {
    setLoading(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  const getOperatingHours = (hours: any) => {
    const today = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
    return hours[today] ? `${hours[today].open} - ${hours[today].close}` : 'Closed';
  };

  // This will be replaced with an actual API call later
  const findNearbyPharmacies = async () => {
    if (!location) {
      setError('Please detect your location first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/pharmacies/nearby?latitude=${location.latitude}&longitude=${location.longitude}`
      );
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        const pharmaciesWithDistance = data.data.map((pharmacy: any) => ({
          ...pharmacy,
          distance: location ? calculateDistance(location.latitude, location.longitude, pharmacy.location.coordinates[1], pharmacy.location.coordinates[0]) : null,
        }));
        setPharmacies(pharmaciesWithDistance);
      } else {
        // Fallback to dummy data if no real data is found
        setPharmacies(dummyPharmacies.map(pharmacy => ({
          ...pharmacy,
          distance: location ? calculateDistance(location.latitude, location.longitude, pharmacy.location.coordinates[1], pharmacy.location.coordinates[0]) : null
        })));
        throw new Error(data.message || 'Failed to fetch pharmacies. Displaying dummy data.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pharmacies. Displaying dummy data.');
      setPharmacies(dummyPharmacies.map(pharmacy => ({
        ...pharmacy,
        distance: location ? calculateDistance(location.latitude, location.longitude, pharmacy.location.coordinates[1], pharmacy.location.coordinates[0]) : null
      })));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Nearby Pharmacies</h1>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <button
          onClick={detectLocation}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 mb-4 disabled:opacity-50"
        >
          {loading ? 'Detecting Location...' : 'Detect My Location'}
        </button>

        {error && <p className="text-red-500 text-center mb-4">Error: {error}</p>}

        {location && (
          <div className="text-center mb-6">
            <p className="text-gray-700 mb-2">
              Location Detected: Latitude {location.latitude.toFixed(4)}, Longitude {location.longitude.toFixed(4)}
            </p>
            <button
              onClick={findNearbyPharmacies}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50"
            >
              {loading ? 'Finding Pharmacies...' : 'Find Nearby Pharmacies'}
            </button>
          </div>
        )}

        {pharmacies.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pharmacies Found:</h2>
            <ul>
              {pharmacies.map((pharmacy) => (
                <li key={pharmacy._id} className="bg-gray-50 p-4 rounded-md mb-2 shadow-sm">
                  <h3 className="text-lg font-bold text-blue-700">{pharmacy.name}</h3>
                  <p className="text-gray-600">{pharmacy.address.street}, {pharmacy.address.city}</p>
                  {pharmacy.contactNumber && <p className="text-gray-600">Phone: {pharmacy.contactNumber}</p>}
                  {pharmacy.operatingHours && (
                    <p className="text-gray-600">Hours: {getOperatingHours(pharmacy.operatingHours)}</p>
                  )}
                  {pharmacy.distance && <p className="text-gray-500 text-sm">Distance: {pharmacy.distance} km</p>}
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${pharmacy.location.coordinates[1]},${pharmacy.location.coordinates[0]}`, '_blank')}
                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-md transition duration-300"
                  >
                    View on Map
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {pharmacies.length === 0 && location && !loading && !error && (
          <p className="text-center text-gray-500">No pharmacies found nearby.</p>
        )}
      </div>
    </div>
  );
}
