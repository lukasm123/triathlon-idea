/**
 * Race Modal Component
 * 
 * A specialized modal for creating and editing triathlon races with distance-specific
 * features and recovery period information. Includes conflict detection and warnings.
 * 
 * Features:
 * - Race distance selection with recovery period info
 * - Conflict detection and warnings
 * - Recovery period visualization
 * - Form validation for race-specific fields
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle, Info, Clock } from 'lucide-react';
import { TriathlonRace, RaceDistance, RACE_DISTANCES, SchedulingConflict } from '../types';
import { formatDate, detectSchedulingConflicts } from '../utils/dateUtils';

interface RaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  race?: TriathlonRace | null;
  selectedDate?: Date | null;
  existingRaces: TriathlonRace[];
  onSave: (raceData: any) => void;
  onDelete?: () => void;
}

const RaceModal: React.FC<RaceModalProps> = ({
  isOpen,
  onClose,
  race,
  selectedDate,
  existingRaces,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    distance: 'sprint' as RaceDistance,
    description: '',
    location: ''
  });

  const [conflict, setConflict] = useState<SchedulingConflict | null>(null);

  useEffect(() => {
    if (race) {
      setFormData({
        title: race.title,
        date: race.date,
        time: race.time || '',
        distance: race.distance,
        description: race.description || '',
        location: race.location || ''
      });
    } else if (selectedDate) {
      setFormData({
        title: '',
        date: formatDate(selectedDate),
        time: '',
        distance: 'sprint',
        description: '',
        location: ''
      });
    }
  }, [race, selectedDate]);

  // Check for conflicts when date or distance changes
  useEffect(() => {
    if (formData.date && formData.title) {
      const proposedRace = { ...formData, id: race?.id || 'temp' };
      const otherRaces = existingRaces.filter(r => r.id !== race?.id);
      const detectedConflict = detectSchedulingConflicts(proposedRace, otherRaces);
      setConflict(detectedConflict);
    }
  }, [formData.date, formData.distance, existingRaces, race?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.date) {
      return;
    }

    // Show warning for conflicts but allow saving
    if (conflict && conflict.severity === 'error') {
      const proceed = window.confirm(
        `⚠️ SCHEDULING CONFLICT DETECTED!\n\n${conflict.message}\n\nThis race falls during a recovery period and is not recommended. Do you want to schedule it anyway?`
      );
      if (!proceed) return;
    }

    onSave({
      ...formData,
      title: formData.title.trim(),
      time: formData.time || undefined,
      description: formData.description.trim() || undefined,
      location: formData.location.trim() || undefined
    });
    
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this race?')) {
      onDelete();
      onClose();
    }
  };

  const selectedDistanceConfig = RACE_DISTANCES[formData.distance];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {race ? 'Edit Race' : 'Add New Race'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conflict Warning */}
        {conflict && (
          <div className={`mx-6 mt-4 p-3 rounded-lg border ${
            conflict.severity === 'error' 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">
                  {conflict.severity === 'error' ? 'Scheduling Conflict' : 'Scheduling Warning'}
                </p>
                <p className="text-sm mt-1">{conflict.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Race Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., City Olympic Triathlon"
              required
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Race Date *
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                id="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Distance */}
          <div>
            <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">
              Race Distance *
            </label>
            <select
              id="distance"
              value={formData.distance}
              onChange={(e) => setFormData({ ...formData, distance: e.target.value as RaceDistance })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {Object.entries(RACE_DISTANCES).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>
            
            {/* Distance Info */}
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">{selectedDistanceConfig.description}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>Recovery: {selectedDistanceConfig.recovery.min}-{selectedDistanceConfig.recovery.max} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., City Beach, Lake Park"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description / Notes
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Additional notes about this race..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <div>
              {race && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-white rounded-md transition-colors ${
                  conflict && conflict.severity === 'error'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {race ? 'Update' : 'Create'} Race
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaceModal;
