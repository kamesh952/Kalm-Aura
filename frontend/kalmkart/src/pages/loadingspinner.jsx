import React from 'react';

const LoadingSpinner = ({ message }) => {
  return (
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">{message || "Loading..."}</p>
    </div>
  );
};

export default LoadingSpinner;