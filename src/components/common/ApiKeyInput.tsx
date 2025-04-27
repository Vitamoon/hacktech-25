import React, { useState } from 'react';
import { Key, Eye, EyeOff, Save } from 'lucide-react';
import { useApiKeyContext } from '../../context/ApiKeyContext';

const ApiKeyInput: React.FC = () => {
  const { openaiApiKey, setOpenaiApiKey } = useApiKeyContext();
  const [inputKey, setInputKey] = useState(openaiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(!!openaiApiKey);

  const handleSave = () => {
    setOpenaiApiKey(inputKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
        <Key className="h-5 w-5 mr-2 text-blue-600" /> OpenAI API Key
      </h3>
      <div className="relative">
        <input
          type={showKey ? 'text' : 'password'}
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          placeholder="Enter your OpenAI API key"
          className="w-full px-4 py-2 pr-24 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <button
            onClick={() => setShowKey(!showKey)}
            className="p-1 text-gray-400 hover:text-gray-600 mr-2"
            type="button"
          >
            {showKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
          <button
            onClick={handleSave}
            className={`p-1 ${isSaved ? 'text-green-500' : 'text-blue-500 hover:text-blue-700'}`}
            type="button"
          >
            <Save className="h-5 w-5" />
          </button>
        </div>
      </div>
      {isSaved && (
        <p className="text-sm text-green-600 mt-2">API key saved successfully!</p>
      )}
      <p className="text-xs text-gray-500 mt-2">
        Your API key is stored locally in your browser and is never sent to our servers.
      </p>
    </div>
  );
};

export default ApiKeyInput;