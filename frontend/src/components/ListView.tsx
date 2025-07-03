/**
 * Race List View Component
 * 
 * A comprehensive list interface for managing triathlon races with filtering,
 * sorting, and detailed race information display.
 * 
 * Features:
 * - Sortable race list by date, distance, title
 * - Filter by race distance
 * - Search functionality
 * - Recovery period indicators
 * - Quick actions (edit, delete)
 * - Conflict warnings
 * 
 * @component
 */

import React, { useState, useMemo } from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  Edit, 
  Trash2,
  AlertTriangle,
  Plus,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { TriathlonRace, RaceDistance, RACE_DISTANCES } from '../types';
import { 
  getRaceDistanceColor, 
  getRaceDistanceIcon, 
  calculateRecoveryPeriod,
  detectSchedulingConflicts,
  formatTime
} from '../utils/dateUtils';
import EventModal from './EventModal';

interface ListViewProps {
  races: TriathlonRace[];
  onRaceCreate: (race: any) => void;
  onRaceUpdate: (id: string, race: any) => void;
  onRaceDelete: (id: string) => void;
}

type SortField = 'date' | 'title' | 'distance' | 'location';
type SortDirection = 'asc' | 'desc';

const ListView: React.FC<ListViewProps> = ({ races, onRaceCreate, onRaceUpdate, onRaceDelete }) => {
  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [distanceFilter, setDistanceFilter] = useState<RaceDistance | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRace, setSelectedRace] = useState<TriathlonRace | null>(null);

  // Filter and sort races
  const filteredAndSortedRaces = useMemo(() => {
    let filtered = races.filter(race => {
      const matchesSearch = race.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           race.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           race.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDistance = distanceFilter === 'all' || race.distance === distanceFilter;
      
      return matchesSearch && matchesDistance;
    });

    // Sort races
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'distance':
          const distanceOrder = { sprint: 1, olympic: 2, middle: 3, long: 4 };
          aValue = distanceOrder[a.distance];
          bValue = distanceOrder[b.distance];
          break;
        case 'location':
          aValue = (a.location || '').toLowerCase();
          bValue = (b.location || '').toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [races, searchTerm, distanceFilter, sortField, sortDirection]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle race actions
  const handleEditRace = (race: TriathlonRace) => {
    setSelectedRace(race);
    setIsModalOpen(true);
  };

  const handleAddRace = () => {
    setSelectedRace(null);
    setIsModalOpen(true);
  };

  const handleDeleteRace = (race: TriathlonRace) => {
    if (window.confirm(`Are you sure you want to delete "${race.title}"?`)) {
      onRaceDelete(race.id);
    }
  };

  // Get race status (upcoming, past, recovery period)
  const getRaceStatus = (race: TriathlonRace) => {
    const raceDate = parseISO(race.date);
    const today = new Date();
    const daysDiff = differenceInDays(raceDate, today);
    
    if (daysDiff > 0) {
      return { type: 'upcoming', text: `In ${daysDiff} day${daysDiff !== 1 ? 's' : ''}`, color: 'text-blue-600' };
    } else if (daysDiff === 0) {
      return { type: 'today', text: 'Today', color: 'text-green-600 font-bold' };
    } else {
      const recoveryPeriod = calculateRecoveryPeriod(race);
      const recoveryDaysLeft = differenceInDays(recoveryPeriod.endDate, today);
      
      if (recoveryDaysLeft > 0) {
        return { 
          type: 'recovery', 
          text: `Recovery: ${recoveryDaysLeft} day${recoveryDaysLeft !== 1 ? 's' : ''} left`, 
          color: 'text-orange-600' 
        };
      } else {
        return { type: 'past', text: `${Math.abs(daysDiff)} day${Math.abs(daysDiff) !== 1 ? 's' : ''} ago`, color: 'text-gray-500' };
      }
    }
  };

  // Check for conflicts
  const getConflicts = (race: TriathlonRace) => {
    const otherRaces = races.filter(r => r.id !== race.id);
    return detectSchedulingConflicts(race, otherRaces);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <SortAsc className="w-4 h-4" /> : 
      <SortDesc className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Race Schedule</h2>
          <button
            onClick={handleAddRace}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Race</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search races..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Distance Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(e.target.value as RaceDistance | 'all')}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Distances</option>
              {Object.entries(RACE_DISTANCES).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Race List */}
      <div className="overflow-x-auto">
        {filteredAndSortedRaces.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No races found</p>
            <p>
              {searchTerm || distanceFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Add your first race to get started'
              }
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    <SortIcon field="date" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Race</span>
                    <SortIcon field="title" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('distance')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Distance</span>
                    <SortIcon field="distance" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('location')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Location</span>
                    <SortIcon field="location" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedRaces.map((race) => {
                const status = getRaceStatus(race);
                const conflict = getConflicts(race);
                const distanceConfig = RACE_DISTANCES[race.distance];
                
                return (
                  <tr key={race.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {format(parseISO(race.date), 'MMM d, yyyy')}
                        </div>
                        {race.time && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(race.time)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">{race.title}</div>
                        {race.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {race.description}
                          </div>
                        )}
                        {conflict && (
                          <div className="flex items-center mt-1">
                            <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                            <span className="text-xs text-red-600">Scheduling conflict</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRaceDistanceColor(race.distance)}`}>
                        <span className="mr-1">{getRaceDistanceIcon(race.distance)}</span>
                        {distanceConfig.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Recovery: {distanceConfig.recovery.min}-{distanceConfig.recovery.max} days
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {race.location ? (
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          {race.location}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No location</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditRace(race)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Edit race"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRace(race)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete race"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredAndSortedRaces.length} of {races.length} races
          </span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-yellow-400 rounded"></div>
              <span>Light Recovery</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-orange-500 rounded"></div>
              <span>Moderate Recovery</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-red-500 rounded"></div>
              <span>Heavy Recovery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {isModalOpen && (
        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          event={selectedRace ? { ...selectedRace, type: selectedRace.distance } : null}
          selectedDate={selectedRace ? new Date(selectedRace.date) : new Date()}
          onSave={selectedRace ? 
            (raceData) => onRaceUpdate(selectedRace.id, { ...raceData, distance: raceData.type }) : 
            (raceData) => onRaceCreate({ ...raceData, distance: raceData.type })
          }
          onDelete={selectedRace ? () => onRaceDelete(selectedRace.id) : undefined}
        />
      )}
    </div>
  );
};

export default ListView;
