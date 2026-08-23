import React, { useState, useMemo } from 'react';
import { MOCK_MOVIES_DATABASE, STATIC_FILTERS } from './mock/moviesMockData';
import TicketBookingModal from './TicketBookingModal'; // Path to the file code above

// Helper to categorize time slots
const getFilterPeriod = (timeStr) => {
  const hour = parseInt(timeStr.split(':')[0], 10);
  const isPM = timeStr.includes('PM');

  let formattedHour = hour;
  if (isPM && hour !== 12) formattedHour += 12;
  if (!isPM && hour === 12) formattedHour = 0;

  if (formattedHour < 12) return "Morning";
  if (formattedHour >= 12 && formattedHour < 17) return "Afternoon";
  return "Evening";
};

export default function Dashboard() {
  // Navigation & Multi-Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCity, setSelectedCity] = useState("All Cities");
    const [selectedGenre, setSelectedGenre] = useState("All Genres");
    const [selectedTimeOfDay, setSelectedTimeOfDay] = useState("All Times");
    const [sortBy, setSortBy] = useState("default");

    // Booking Flow States
    const [activeMovie, setActiveMovie] = useState(null);
    const [selectedShowtime, setSelectedShowtime] = useState("");
    const [ticketCount, setTicketCount] = useState(1);
    const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const [selectedMovieForBooking, setSelectedMovieForBooking] = useState(null);

 // Unified Multi-Filter & Search Engine Computing Pipeline
   const filteredAndSortedMovies = useMemo(() => {
     let dataset = [...MOCK_MOVIES_DATABASE];

     // Text String Name Search Indexing
     if (searchTerm.trim() !== "") {
       dataset = dataset.filter(movie =>
         movie.title.toLowerCase().includes(searchTerm.toLowerCase())
       );
     }

     // City Selection Constraints
     if (selectedCity !== "All Cities") {
       dataset = dataset.filter(movie => movie.cities.includes(selectedCity));
     }

     // Genre Selection Constraints
     if (selectedGenre !== "All Genres") {
       dataset = dataset.filter(movie => movie.genre === selectedGenre);
     }

     // Time Slot Allocation Windows
     if (selectedTimeOfDay !== "All Times") {
       dataset = dataset.filter(movie =>
         movie.showtimes.some(time => getFilterPeriod(time) === selectedTimeOfDay)
       );
     }

     // Mathematical Sorting Operations
     if (sortBy === "highToLow") dataset.sort((a, b) => b.rating - a.rating);
     if (sortBy === "lowToHigh") dataset.sort((a, b) => a.rating - b.rating);

     return dataset;
   }, [searchTerm, selectedCity, selectedGenre, selectedTimeOfDay, sortBy]);


  // Handle open booking flow modal
  const triggerBookingModal = (movie) => {
    setActiveMovie(movie);
    setSelectedShowtime(movie.showtimes[0]); // Default selection
    setTicketCount(1);
    setBookingConfirmed(false);
    setSelectedMovieForBooking(movie);
  };

  // Close booking modal workspace cleanly
  const resetModalState = () => {
    setActiveMovie(null);
    setBookingConfirmed(false);
  };

  return (
   <div style={{ minWidth: '1000px', padding: '32px 16px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>

      {/* Top Header */}
      <h1 style={{ maxWidth: '1200px', margin: '0 0 24px 0', color: '#1a202c', textAlign: 'center' }}>Movies Dashboard</h1>


      {/* Advanced Filter Toolbar + Search Core */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 32px auto', backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>

        {/* Row 1: Unified Text String Search Field */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Search</label>
          <input
            type="text"
            placeholder="Search movie titles directly..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '15px', boxSizing: 'border-box', outline: 'none', transition: 'border 0.2s' }}
          />
        </div>


        {/* Row 2: Secondary Dropdown Target Groups */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Location/City</label>
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} style={selectStyle}>
              {STATIC_FILTERS.cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Category Genre</label>
            <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} style={selectStyle}>
              {STATIC_FILTERS.genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Time Slot Windows</label>
            <select value={selectedTimeOfDay} onChange={(e) => setSelectedTimeOfDay(e.target.value)} style={selectStyle}>
              <option value="All Times">All Day Schedules</option>
              <option value="Morning">Morning Slots</option>
              <option value="Afternoon">Afternoon Slots</option>
              <option value="Evening">Evening Slots</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Rating Configuration</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={selectStyle}>
              <option value="default">Unsorted Order</option>
              <option value="highToLow">Highest Rated First</option>
              <option value="lowToHigh">Lowest Rated First</option>
            </select>
          </div>
        </div>

        </div>



     {/* Primary Reactive Movie Cards Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '28px' }}>
        {filteredAndSortedMovies.map(movie => (
          <div key={movie.id} style={cardStyle}>
          {/* Visual Cover Banner Image element */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, color: '#2d3748', fontSize: '18px' }}>{movie.title}</h3>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#3182ce' }}>⭐ {movie.rating}</span>
              </div>

              <span style={badgeStyle}>{movie.genre}</span>

              {/* Showtimes tags list */}
              <div style={{ marginTop: '16px' }}>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#a0aec0', marginBottom: '4px' }}>AVAILABLE SHOWTIMES</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {movie.showtimes.map((time, idx) => (
                    <span key={idx} style={timeBadgeStyle}>{time}</span>
                  ))}
                </div>
              </div>
            </div>


{/* Action and pricing contextual row */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: '#94a3b8' }}>LOCATIONS</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>{movie.cities.join(', ')}</span>
                </div>
                <button onClick={() => triggerBookingModal(movie)} style={bookButtonStyle}>
                  Book Tickets
                </button>
              </div>

          </div>
        ))}
      </div>

      {/* Empty Fallback Block */}
      {filteredAndSortedMovies.length === 0 && (
        <div style={{ textAlign: 'center', color: '#a0aec0', padding: '48px 0' }}>
          <h3>No matches found</h3>
          <p>Try resetting or broadening your filter configurations.</p>
        </div>
      )}
   {/* Render the layer dynamically if active state holds data context */}
           {selectedMovieForBooking && (
             <TicketBookingModal
               movie={selectedMovieForBooking}
               onClose={() => setSelectedMovieForBooking(null)}
             />
           )}

    </div>


  );
}

// Minimalist Reusable Layout Styles
const bookButtonStyle = {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'background-color 0.15s'
};

const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#64748b',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.025em'
};

const selectStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc',
  fontSize: '14px',
  outline: 'none',
  cursor: 'pointer'
};

const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.06)',
  display: 'flex',
  flexDirection: 'column',
  justify: 'space-between'
};

const badgeStyle = {
  backgroundColor: '#ebf8ff',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '11px',
  color: '#2b6cb0',
  fontWeight: 'bold',
  display: 'inline-block'
};

const timeBadgeStyle = {
  backgroundColor: '#f7fafc',
  border: '1px solid #e2e8f0',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '11px',
  color: '#4a5568'
};

