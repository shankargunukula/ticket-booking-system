import React from 'react';
import ToolErrorView from './tools/ToolErrorView';
import MovieShowtimesView from './tools/MovieShowtimesView';
import TicketStatusView from './tools/TicketStatusView';

// Central Registry Map
const TOOL_COMPONENTS = {
  search_movie_showtimes: MovieShowtimesView,
  fetch_movie_ticket_status: TicketStatusView,
  // Add future component maps here easily!
};

export default function ToolDispatcher({ msg, onSelectShowtime }) {
  if (msg.isError) {
    return <ToolErrorView error={msg.toolData?.error} />;
  }

  const toolType = msg.toolData?.type || msg.toolName;
  const ComponentToRender = TOOL_COMPONENTS[toolType];

  // Fallback structural sniffing if strict type identifier tags are absent
  if (!ComponentToRender) {
    if (msg.toolData?.movie && msg.toolData?.details) {
      return <MovieShowtimesView toolData={msg.toolData} onSelectShowtime={onSelectShowtime} />;
    }
    if (msg.toolData?.seats || msg.toolData?.status) {
      return <TicketStatusView toolData={msg.toolData} />;
    }
    return null;
  }

  return <ComponentToRender toolData={msg.toolData} onSelectShowtime={onSelectShowtime} />;
}
