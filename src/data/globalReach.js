// Static fallback for Global Reach when Supabase is unreachable
// Mirrors the global_reach table schema: { id, country_name, country, states, lat, lng }
export const FALLBACK_REACH = [
  { id: 'fb-west-malaysia', country_name: 'West Malaysia', country: 'MY', states: ['Peninsular Malaysia'], lat: 3.139, lng: 101.686 },
  { id: 'fb-singapore', country_name: 'Singapore', country: 'SG', states: [], lat: 1.3521, lng: 103.8198 },
  { id: 'fb-brunei', country_name: 'Brunei', country: 'BN', states: [], lat: 4.5353, lng: 114.7277 },
  { id: 'fb-thailand', country_name: 'Thailand', country: 'TH', states: [], lat: 15.87, lng: 100.9925 },
  { id: 'fb-taiwan', country_name: 'Taiwan', country: 'TW', states: [], lat: 23.6978, lng: 120.9605 },
  { id: 'fb-indonesia', country_name: 'Indonesia', country: 'ID', states: [], lat: -0.7893, lng: 113.9213 },
  { id: 'fb-hong-kong', country_name: 'Hong Kong', country: 'HK', states: [], lat: 22.3193, lng: 114.1694 },
  { id: 'fb-philippines', country_name: 'Philippines', country: 'PH', states: [], lat: 12.8797, lng: 121.774 },
];
