import React, { useState } from 'react';
import { Shield, Lock, Cloud, HardDrive, Info } from 'lucide-react';

interface PrivacySettingsProps {
  onSettingsChange: (settings: PrivacySettings) => void;
}

export interface PrivacySettings {
  clientSideProcessing: boolean;
  dataRetention: 'none' | 'session' | 'local';
  anonymizeContent: boolean;
  excludeSensitiveInfo: boolean;
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState<PrivacySettings>({
    clientSideProcessing: true,
    dataRetention: 'session',
    anonymizeContent: false,
    excludeSensitiveInfo: true
  });

  const handleSettingChange = (key: keyof PrivacySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="h-6 w-6 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Privacy Settings</h3>
      </div>

      <div className="space-y-6">
        {/* Client-side Processing */}
        <div className="flex items-start space-x-3">
          <div className="flex items-center h-5">
            <input
              id="client-processing"
              type="checkbox"
              checked={settings.clientSideProcessing}
              onChange={(e) => handleSettingChange('clientSideProcessing', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="client-processing" className="text-sm font-medium text-gray-900 flex items-center space-x-2">
              <HardDrive className="h-4 w-4" />
              <span>Client-side Processing Only</span>
            </label>
            <p className="text-xs text-gray-600 mt-1">
              Process all documents locally in your browser without sending data to external services
            </p>
          </div>
        </div>

        {/* Data Retention */}
        <div>
          <label className="text-sm font-medium text-gray-900 flex items-center space-x-2 mb-3">
            <Lock className="h-4 w-4" />
            <span>Data Retention</span>
          </label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="retention-none"
                type="radio"
                name="dataRetention"
                value="none"
                checked={settings.dataRetention === 'none'}
                onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="retention-none" className="ml-3 text-sm text-gray-700">
                No storage - Delete immediately after processing
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="retention-session"
                type="radio"
                name="dataRetention"
                value="session"
                checked={settings.dataRetention === 'session'}
                onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="retention-session" className="ml-3 text-sm text-gray-700">
                Session only - Clear when browser is closed
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="retention-local"
                type="radio"
                name="dataRetention"
                value="local"
                checked={settings.dataRetention === 'local'}
                onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="retention-local" className="ml-3 text-sm text-gray-700">
                Local storage - Keep in browser until manually cleared
              </label>
            </div>
          </div>
        </div>

        {/* Anonymize Content */}
        <div className="flex items-start space-x-3">
          <div className="flex items-center h-5">
            <input
              id="anonymize"
              type="checkbox"
              checked={settings.anonymizeContent}
              onChange={(e) => handleSettingChange('anonymizeContent', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="anonymize" className="text-sm font-medium text-gray-900">
              Anonymize Personal Information
            </label>
            <p className="text-xs text-gray-600 mt-1">
              Replace names, addresses, phone numbers, and email addresses with generic placeholders
            </p>
          </div>
        </div>

        {/* Exclude Sensitive Info */}
        <div className="flex items-start space-x-3">
          <div className="flex items-center h-5">
            <input
              id="exclude-sensitive"
              type="checkbox"
              checked={settings.excludeSensitiveInfo}
              onChange={(e) => handleSettingChange('excludeSensitiveInfo', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="exclude-sensitive" className="text-sm font-medium text-gray-900">
              Exclude Sensitive Information
            </label>
            <p className="text-xs text-gray-600 mt-1">
              Skip processing of files that might contain sensitive data (banking, medical, legal documents)
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Privacy First Approach</h4>
            <p className="text-xs text-blue-800 mt-1">
              This application is designed with privacy in mind. When client-side processing is enabled, 
              your documents never leave your browser. All processing happens locally using your device's resources.
            </p>
          </div>
        </div>
      </div>

      {/* Current Settings Summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-xs font-medium text-gray-700 mb-2">Current Configuration:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Processing: {settings.clientSideProcessing ? 'Client-side only' : 'May use cloud services'}</li>
          <li>• Data retention: {settings.dataRetention === 'none' ? 'No storage' : 
                                settings.dataRetention === 'session' ? 'Session only' : 'Local storage'}</li>
          <li>• Anonymization: {settings.anonymizeContent ? 'Enabled' : 'Disabled'}</li>
          <li>• Sensitive data filtering: {settings.excludeSensitiveInfo ? 'Enabled' : 'Disabled'}</li>
        </ul>
      </div>
    </div>
  );
};

export default PrivacySettings;