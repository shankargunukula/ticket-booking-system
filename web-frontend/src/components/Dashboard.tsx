import React, { useState, useMemo } from 'react';

// Mock Data Structure with Genres, Showtimes, and Ratings
const MOVIE_DATA = [
  { id: 1, title: "Inception", cities: ["New York", "Los Angeles", "Chicago"], genre: "Sci-Fi", rating: 8.8, showtimes: ["10:30 AM", "2:15 PM", "7:00 PM"] },
  { id: 2, title: "The Dark Knight", cities: ["New York", "Chicago"], genre: "Action", rating: 9.0, showtimes: ["1:00 PM", "8:30 PM", "11:00 PM"] },
  { id: 3, title: "La La Land", cities: ["Los Angeles"], genre: "Romance", rating: 8.0, showtimes: ["11:00 AM", "4:30 PM"] },
  { id: 4, title: "Pulp Fiction", cities: ["Los Angeles", "New York"], genre: "Crime", rating: 8.9, showtimes: ["6:00 PM", "9:30 PM"] },
  { id: 5, title: "The Departed", cities: ["Boston", "Chicago"], genre: "Thriller", rating: 8.5, showtimes: ["3:00 PM", "7:45 PM"] },
  { id: 6, title: "Interstellar", cities: ["Boston", "New York"], genre: "Sci-Fi", rating: 8.7, showtimes: ["12:00 PM", "8:00 PM"] }
];

const CITIES = ["All Cities", "New York", "Los Angeles", "Chicago", "Boston"];
const GENRES = ["All Genres", "Sci-Fi", "Action", "Romance", "Crime", "Thriller"];

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

export default function MovieDashboard() {
  // State Trackers
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState("All Times");
  const [sortBy, setSortBy] = useState("default"); // default, highToLow, lowToHigh

  // Unified Multi-Filter & Sort Logic
  const filteredAndSortedMovies = useMemo(() => {
    let result = [...MOVIE_DATA];

    // 1. City Filter
    if (selectedCity !== "All Cities") {
      result = result.filter(movie => movie.cities.includes(selectedCity));
    }

    // 2. Genre Filter
    if (selectedGenre !== "All Genres") {
      result = result.filter(movie => movie.genre === selectedGenre);
    }

    // 3. Showtime Period Filter (Morning, Afternoon, Evening)
    if (selectedTimeOfDay !== "All Times") {
      result = result.filter(movie =>
        movie.showtimes.some(time => getFilterPeriod(time) === selectedTimeOfDay)
      );
    }

    // 4. Sorting logic
    if (sortBy === "highToLow") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "lowToHigh") {
      result.sort((a, b) => a.rating - b.rating);
    }

    return result;
  }, [selectedCity, selectedGenre, selectedTimeOfDay, sortBy]);

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>

      {/* Top Header */}
      <h1 style={{ margin: '0 0 24px 0', color: '#1a202c', textAlign: 'center' }}>Movies Dashboard</h1>

      {/* Filter Toolbar Panel */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '32px',
        alignItems: 'center'
      }}>
        {/* City Filter */}
        <div style={{ flex: '1 minmax(150px, 1fr)' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#718096', marginBottom: '6px' }}>CITY</label>
          <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} style={selectStyle}>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Genre Filter */}
        <div style={{ flex: '1 minmax(150px, 1fr)' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#718096', marginBottom: '6px' }}>GENRE</label>
          <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} style={selectStyle}>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Showtime Filter */}
        <div style={{ flex: '1 minmax(150px, 1fr)' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#718096', marginBottom: '6px' }}>SHOWTIME</label>
          <select value={selectedTimeOfDay} onChange={(e) => setSelectedTimeOfDay(e.target.value)} style={selectStyle}>
            <option value="All Times">All Day</option>
            <option value="Morning">Morning (Before 12 PM)</option>
            <option value="Afternoon">Afternoon (12 PM - 5 PM)</option>
            <option value="Evening">Evening (After 5 PM)</option>
          </select>
        </div>

        {/* Rating Sorting */}
        <div style={{ flex: '1 minmax(150px, 1fr)' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#718096', marginBottom: '6px' }}>SORT BY RATING</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={selectStyle}>
            <option value="default">No Sorting</option>
            <option value="highToLow">Highest Rated First</option>
            <option value="lowToHigh">Lowest Rated First</option>
          </select>
        </div>
      </div>

      {/* Results Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {filteredAndSortedMovies.map(movie => (
          <div key={movie.id} style={cardStyle}>
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

            <div style={{ marginTop: '20px', borderTop: '1px solid #edf2f7', paddingTop: '12px', fontSize: '12px', color: '#718096' }}>
              📍 <i>{movie.cities.join(', ')}</i>
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
    </div>
  );
}

// Minimalist Reusable Layout Styles
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
