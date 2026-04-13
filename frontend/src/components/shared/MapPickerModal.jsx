import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import { MapPin, Search, X, Loader2, Check } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
};

const MapEvents = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => onMapClick(e),
  });
  return null;
};

const MapPickerModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    initialPos = [17.3850, 78.4867], 
    radius = 15,
    title = "Select Location",
    subTitle = "Pick a point on the map",
    confirmText = "Confirm Location"
}) => {
  const [markerPos, setMarkerPos] = useState(initialPos);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [tempAddress, setTempAddress] = useState("");

  useEffect(() => {
    if (isOpen) {
        setMarkerPos(initialPos);
    }
  }, [isOpen, initialPos]);

  const handleSearchPlaces = async (query) => {
    if (query.length < 3) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const [isGeocoding, setIsGeocoding] = useState(false);

  const reverseGeocode = async (lat, lng) => {
    setIsGeocoding(true);
    setTempAddress("Resolving address...");
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        setTempAddress(data.display_name);
        setSearchQuery(data.display_name);
      } else {
        setTempAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      setTempAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSelectPlace = (place) => {
    const newPos = [parseFloat(place.lat), parseFloat(place.lon)];
    setMarkerPos(newPos);
    setTempAddress(place.display_name);
    setSearchResults([]);
    setSearchQuery(place.display_name);
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setMarkerPos([lat, lng]);
    reverseGeocode(lat, lng);
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setMarkerPos([latitude, longitude]);
        reverseGeocode(latitude, longitude);
      });
    }
  };

  const eventHandlers = {
    dragend(e) {
      const marker = e.target;
      const position = marker.getLatLng();
      setMarkerPos([position.lat, position.lng]);
      reverseGeocode(position.lat, position.lng);
    },
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-6xl h-[95vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border-2 border-border animate-fade-up relative">
        
        {/* Immersive Map Container */}
        <div className="flex-1 relative bg-muted/50 overflow-hidden">
          <MapContainer 
            center={markerPos} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <ChangeView center={markerPos} />
            <MapEvents onMapClick={handleMapClick} />
            <Marker 
              position={markerPos} 
              draggable={true}
              eventHandlers={eventHandlers}
            />
            {radius && (
                <Circle
                    center={markerPos}
                    radius={radius * 1000}
                    pathOptions={{
                        color: "#3b82f6",
                        fillColor: "#3b82f6",
                        fillOpacity: 0.1,
                    }}
                />
            )}
          </MapContainer>

          {/* Floating Top Header (Search) */}
          <div className="absolute top-6 left-6 right-6 z-[1000] flex flex-col md:flex-row items-center justify-between gap-6 pointer-events-none">
            <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xl p-3 pr-6 rounded-[2rem] border border-white/20 shadow-2xl pointer-events-auto">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                 <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight">{title}</h3>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mt-1">{subTitle}</p>
              </div>
            </div>

            <div className="flex-1 max-w-md w-full relative pointer-events-auto">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearchPlaces(e.target.value);
                  }}
                  placeholder="Search for a location..."
                  className="block w-full pl-11 pr-4 py-4 bg-white/90 backdrop-blur-md border-2 border-white/20 rounded-2xl text-sm font-bold shadow-2xl outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/50 hover:bg-white"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl border-2 border-white/20 rounded-2xl shadow-2xl z-[210] overflow-hidden max-h-60 overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={result.place_id}
                        onClick={() => handleSelectPlace(result)}
                        className="w-full text-left px-6 py-4 hover:bg-primary/5 text-sm font-bold transition-colors border-b border-border/50 last:border-0"
                      >
                        {result.display_name}
                      </button>
                    ))}
                  </div>
                )}
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="w-14 h-14 bg-white/80 backdrop-blur-xl hover:bg-white rounded-2xl transition-all flex items-center justify-center border border-white/20 shadow-2xl pointer-events-auto"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Floating Bottom Info (Stats) */}
          <div className="absolute bottom-6 left-6 right-6 z-[1000] flex flex-col md:flex-row items-end justify-between gap-6 pointer-events-none">
            <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xl p-4 pr-8 rounded-[2rem] border border-white/20 shadow-2xl animate-fade-in pointer-events-auto">
               <div className="p-3 bg-primary/10 rounded-2xl border border-primary/10 shadow-sm">
                  <MapPin className="w-6 h-6 text-primary" />
               </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Pinned Location</p>
                  <p className={`text-xs font-black mt-1 max-w-[200px] truncate ${isGeocoding ? 'text-primary animate-pulse' : 'text-foreground'}`}>
                    {isGeocoding ? "Resolving precise location..." : (tempAddress || "Select a point on map")}
                  </p>
                </div>
            </div>

            <div className="flex items-center gap-3 pointer-events-auto">
              <button 
                onClick={handleLocateMe}
                className="w-14 h-14 bg-white text-primary rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-2 border-border"
                title="Find me"
              >
                <MapPin className="w-6 h-6" />
              </button>
              
              <button 
                onClick={() => onConfirm(markerPos, tempAddress)}
                className="bg-[#10b981] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.1em] text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-white/20"
              >
                <Check className="w-5 h-5" /> {confirmText}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MapPickerModal;
