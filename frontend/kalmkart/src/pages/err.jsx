import React from 'react';

const ErrorMessage = ({ title, message, icon, actions = [] }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex flex-col items-center text-center">
        {icon && <div className="mb-4">{icon}</div>}
        {title && <h3 className="text-lg font-medium text-red-800 mb-2">{title}</h3>}
        {message && <p className="text-sm text-red-700 mb-4">{message}</p>}
        {actions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  action.variant === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                  action.variant === 'primary' ? 'bg-blue-600 hover:bg-blue-700' :
                  'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {action.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;