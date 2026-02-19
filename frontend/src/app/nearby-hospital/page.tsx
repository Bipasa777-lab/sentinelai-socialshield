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

export default function NearbyHospitalPage() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dummy data for display if no real data is fetched or for initial state
  const dummyHospitals = [
    {
      _id: '65e8a7c2b3f1a9d2c4e5f6g7',
      name: 'Desun Hospital',
      location: { coordinates: [88.4322, 22.5645] }, // Kolkata coordinates for Desun Hospital
      address: { street: 'Andul Rd, Shankar Khamar', city: 'Kolkata', state: 'West Bengal', zipCode: '711109', country: 'India' },
      contactNumber: '+91 90070 66666',
      operatingHours: {
        monday: { open: '00:00', close: '23:59' },
        tuesday: { open: '00:00', close: '23:59' },
        wednesday: { open: '00:00', close: '23:59' },
        thursday: { open: '00:00', close: '23:59' },
        friday: { open: '00:00', close: '23:59' },
        saturday: { open: '00:00', close: '23:59' },
        sunday: { open: '00:00', close: '23:59' },
      },
      distance: '0.50'
    },
    {
      _id: '65e8a7c2b3f1a9d2c4e5f6g8',
      name: 'Apollo Multispecialty Hospital',
      location: { coordinates: [88.4239, 22.5731] }, // Kolkata coordinates for Apollo Multispecialty Hospital
      address: { street: '58, Canal Circular Rd, Kadapara', city: 'Kolkata', state: 'West Bengal', zipCode: '700054', country: 'India' },
      contactNumber: '+91 33 2320 3040',
      operatingHours: {
        monday: { open: '00:00', close: '23:59' },
        tuesday: { open: '00:00', close: '23:59' },
        wednesday: { open: '00:00', close: '23:59' },
        thursday: { open: '00:00', close: '23:59' },
        friday: { open: '00:00', close: '23:59' },
        saturday: { open: '00:00', close: '23:59' },
        sunday: { open: '00:00', close: '23:59' },
      },
      distance: '1.20'
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

  const findNearbyHospitals = async () => {
    if (!location) {
      setError('Please detect your location first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/hospitals/nearby?latitude=${location.latitude}&longitude=${location.longitude}`
      );
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        const hospitalsWithDistance = data.data.map((hospital: any) => ({
          ...hospital,
          distance: location ? calculateDistance(location.latitude, location.longitude, hospital.location.coordinates[1], hospital.location.coordinates[0]) : null,
        }));
        setHospitals(hospitalsWithDistance);
      } else {
        // Fallback to dummy data if no real data is found
        setHospitals(dummyHospitals.map(hospital => ({ 
          ...hospital, 
          distance: location ? calculateDistance(location.latitude, location.longitude, hospital.location.coordinates[1], hospital.location.coordinates[0]) : null
        })));
        throw new Error(data.message || 'Failed to fetch hospitals. Displaying dummy data.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch hospitals. Displaying dummy data.');
      setHospitals(dummyHospitals.map(hospital => ({ 
        ...hospital, 
        distance: location ? calculateDistance(location.latitude, location.longitude, hospital.location.coordinates[1], hospital.location.coordinates[0]) : null
      })));
    } finally {
      setLoading(false);
    }
  };

  const getOperatingHours = (hours: any) => {
    const today = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
    return hours[today] ? `${hours[today].open} - ${hours[today].close}` : 'Closed';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Nearby Hospitals</h1>
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
              onClick={findNearbyHospitals}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50"
            >
              {loading ? 'Finding Hospitals...' : 'Find Nearby Hospitals'}
            </button>
          </div>
        )}

        {hospitals.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Hospitals Found:</h2>
            <ul>
              {hospitals.map((hospital) => (
                <li key={hospital._id} className="bg-gray-50 p-4 rounded-md mb-2 shadow-sm">
                  <h3 className="text-lg font-bold text-blue-700">{hospital.name}</h3>
                  <p className="text-gray-600">{hospital.address.street}, {hospital.address.city}</p>
                  {hospital.contactNumber && <p className="text-gray-600">Phone: {hospital.contactNumber}</p>}
                  {hospital.operatingHours && (
                    <p className="text-gray-600">Hours: {getOperatingHours(hospital.operatingHours)}</p>
                  )}
                  {hospital.distance && <p className="text-gray-500 text-sm">Distance: {hospital.distance} km</p>}
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${hospital.location.coordinates[1]},${hospital.location.coordinates[0]}`, '_blank')}
                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-md transition duration-300"
                  >
                    View on Map
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {hospitals.length === 0 && location && !loading && !error && (
          <p className="text-center text-gray-500">No hospitals found nearby.</p>
        )}
      </div>
    </div>
  );
}
