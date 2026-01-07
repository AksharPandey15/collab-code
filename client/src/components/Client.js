import React from 'react';
import Avatar from 'react-avatar';

function Client({ username }) {
  // Ensure we have a string to avoid crashes if username is unexpectedly null/undefined
  const displayName = username?.toString() || "Anonymous";

  return (
    <div className="client d-flex align-items-center mb-2 p-1 rounded transition-all">
      {/* Avatar with a slightly smaller size (40) fits better in sidebars. 
          Using a specific 'color' array or 'maxInitials' makes it look more professional.
      */}
      <Avatar 
        name={displayName} 
        size="40" 
        round="8px" 
        maxInitials={2}
        textSizeRatio={1.75}
      />
      
      <span 
        className="ms-3 text-light fw-medium overflow-hidden text-nowrap" 
        style={{ 
          fontSize: '0.9rem', 
          textOverflow: 'ellipsis', 
          maxWidth: '150px' 
        }}
        title={displayName} // Shows full name on hover if truncated
      >
        {displayName}
      </span>
    </div>
  );
}

export default Client;