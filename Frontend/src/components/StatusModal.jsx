import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const StatusModal = ({ isOpen, onClose, type, message, onConfirm, showConfirm = false }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />;
      case 'confirm':
        return <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />;
      default:
        return <CheckCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          text: 'text-green-800',
          button: 'bg-green-600 hover:bg-green-700'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          text: 'text-red-800',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'confirm':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-800',
          button: 'bg-orange-600 hover:bg-orange-700'
        };
      default:
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-800',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        <div className={`${colors.bg} px-6 py-4 rounded-t-xl relative`}>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="px-6 py-6 text-center">
          {getIcon()}
          <p className={`text-lg font-medium ${colors.text} mb-6`}>
            {message}
          </p>
          
          <div className="flex gap-3 justify-center">
            {showConfirm ? (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${colors.button}`}
                >
                  Confirm
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className={`px-6 py-2 text-white rounded-lg transition-colors font-medium ${colors.button}`}
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;