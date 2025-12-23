import React, { useState, useEffect } from 'react';
import { SiElixir } from "react-icons/si";
import { format } from 'date-fns';
import { teamData } from '../../constants/teamData';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/logs`);
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError('Failed to load transaction logs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#010815] p-0 md:p-4 lg:pl-64">
        <div className="max-w-7xl mx-auto p-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#010815] p-0 md:p-4 lg:pl-64">
        <div className="max-w-7xl mx-auto p-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-center text-red-500 dark:text-red-400">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#010815] p-0 md:p-4 pt-14 lg:pl-64">
      <div className="max-w-7xl mx-auto p-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
            Transaction Logs ({logs.length})
          </h2>

          <div className="space-y-4">
            {logs.map((log) => {
              const teamInfo = teamData[log.soldTo.toLowerCase()];

              return (
                <div
                  key={log._id}
                  className={`${teamInfo?.color || 'bg-gray-100 dark:bg-gray-700'} 
                    rounded-lg p-4 transition-all duration-300 hover:shadow-lg`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="group relative inline-block">
                        <a
                          href={log.codolioLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-semibold text-gray-800 dark:text-gray-200 hover:underline inline-flex items-center gap-2"
                        >
                          {log.playerName}
                          {teamInfo && (
                            <img
                              src={teamInfo.icon}
                              alt={log.soldTo}
                              className="w-6 h-6"
                            />
                          )}
                        </a>
                        {/* Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity 
                          bg-gray-900 text-gray-800 dark:text-gray-200 text-sm rounded-md py-1 px-2 absolute z-10 
                          bottom-full left-1/2 transform -translate-x-1/2 mb-1 whitespace-nowrap"
                        >
                          View Codolio Profile
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                            -mt-1 border-4 border-transparent border-t-gray-900"
                          ></div>
                        </div>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 text-opacity-90">
                        {log.action === 'update' ? 'Updated in' : 'Sold to'} {log.soldTo}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end text-lg font-bold text-gray-800 dark:text-gray-200">
                        <SiElixir className="text-gray-800 dark:text-gray-200 text-[16px] rotate-[25deg] mr-1" />
                        {log.price.toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 text-opacity-75">
                        {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {logs.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No transaction logs found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogs; 