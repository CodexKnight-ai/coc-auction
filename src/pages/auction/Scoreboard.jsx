// src/pages/Scoreboard.jsx
import React, { useState } from 'react';
import { FaSearch, FaTrophy, FaCrown } from 'react-icons/fa';
import { GiQueenCrown, GiCrownedSkull } from "react-icons/gi";
import { HiUserGroup } from "react-icons/hi";
import playersData from '../../data/players.json';
import { teamData } from '../../constants/teamData';

const getPositionIcon = (position) => {
  switch (position.toLowerCase()) {
    case 'leader':
      return <FaCrown className="text-yellow-500 text-3xl" />;
    case 'co-leader':
      return <FaCrown className="text-yellow-500 text-2xl" />;
    case 'elder':
      return <GiQueenCrown className="text-blue-500 text-2xl" />;
    case 'member':
      return <HiUserGroup className="text-gray-500 text-2xl" />;
    default:
      return null;
  }
};
const getCfProfileUrl = (cfId) => {
  if (!cfId) return null;
  if (cfId.startsWith('http')) return cfId;
  return `https://codeforces.com/profile/${cfId}`;
};

const Scoreboard = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const sortedPlayers = [...playersData.players].sort((a, b) => Number(a.id) - Number(b.id));

  const filteredPlayers = sortedPlayers.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#010815] p-4 lg:pl-72 pt-20 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
              <FaTrophy className="inline-block mr-4 text-yellow-500" />
              Qualifiers Scoreboard
            </h1>
          </div>
        </div>

        {/* Search Control */}
        <div className="flex flex-col sm:flex-row sm:justify-end items-start md:items-center pb-8">
          <div className="relative w-full mb-0 shadow-lg rounded-lg">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search players..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:text-gray-200 
                       dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Players List */}
        <div className="space-y-4">
          {filteredPlayers.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <FaSearch className="text-4xl text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  No players found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No players match your search "{searchTerm}"
                </p>
              </div>
            </div>
          ) : (
            filteredPlayers.map((player) => {
              const teamInfo = player.team ? teamData[player.team] : null;
              let bgColorClass = 'bg-white dark:bg-gray-900';

              switch (player.position.toLowerCase()) {
                case 'co-leader':
                  bgColorClass = 'bg-[#CE8946]/10 dark:bg-emerald-600/40';
                  break;
                case 'elder':
                  bgColorClass = 'bg-[#C0C0C0]/20 dark:bg-[#C0C0C0]/40';
                  break;
                case 'member':
                  bgColorClass = 'bg-emerald-100/30 dark:bg-[#CE8946]/40';
                  break;
              }

              return (
                <div
                  key={player.id}
                  className={`${teamInfo ? teamInfo.color : bgColorClass
                    } rounded-xl shadow-lg transform hover:scale-[1.01] transition-all duration-150`}
                >
                  <div className="p-4">
                    {/* Mobile Layout */}
                    <div className="flex flex-col sm:hidden">
                      <div className='flex gap-4'>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className={`text-lg font-bold ${teamInfo ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                              }`}>
                              #{player.id}
                            </span>
                            <div className="bg-gray-100 dark:bg-white border-[1px] dark:border-0 rounded-full p-[4px] w-8 h-8 flex items-center justify-center">
                              {getPositionIcon(player.position)}
                            </div>
                          </div>
                          {teamInfo && (
                            <img src={teamInfo.icon} alt={player.team} className="w-8 h-8" />
                          )}
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center gap-2">
                            <a
                              href={player.codolio_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-lg md:text-xl font-bold hover:underline ${teamInfo ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                                }`}
                            >
                              {player.name}
                            </a>

                            {player.cf_id && (
                              <a
                                href={getCfProfileUrl(player.cf_id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View Codeforces Profile"
                              >
                                <img
                                  src="https://res.cloudinary.com/dvhcrdl4b/image/upload/v1767870754/codeforces_qakwky.svg"
                                  alt="Codeforces"
                                  className="w-5 h-5 hover:scale-110 transition-transform"
                                />
                              </a>
                            )}
                          </div>

                          <p className={`capitalize text-sm ${teamInfo ? 'text-white opacity-90' : 'text-gray-600 dark:text-gray-400'
                            }`}>
                            {player.position}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className={`text-center p-2 rounded-lg bg-opacity-10 ${teamInfo ? 'text-white bg-white' : 'text-gray-800 dark:text-gray-200 bg-gray-400'
                          }`}>
                          <p className="text-xs opacity-80">Final Score</p>
                          <p className="text-lg font-bold">{player.best_score.slice(0, 6)}</p>
                        </div>
                        <div className={`text-center p-2 rounded-lg bg-opacity-10 ${teamInfo ? 'text-white bg-white' : 'text-gray-800 dark:text-gray-200 bg-gray-400'
                          }`}>
                          <p className="text-xs opacity-80">Q1</p>
                          <p className="text-lg font-bold">{player.q1_score.slice(0, 6)}</p>
                        </div>
                        <div className={`text-center p-2 rounded-lg bg-opacity-10 ${teamInfo ? 'text-white bg-white' : 'text-gray-800 dark:text-gray-200 bg-gray-400 '
                          }`}>
                          <p className="text-xs opacity-80">Q2</p>
                          <p className="text-lg font-bold">{player.q2_score.slice(0, 6)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <span className={`text-xl font-bold ${teamInfo ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                          }`}>
                          #{player.id}
                        </span>
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-100 dark:bg-white border-[1px] dark:border-0 rounded-full p-[4px] w-10 h-10 flex items-center justify-center">
                            {getPositionIcon(player.position)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <a
                                href={player.codolio_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-lg md:text-xl font-bold hover:underline ${teamInfo ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                                  }`}
                              >
                                {player.name}
                              </a>

                              {player.cf_id && (
                                <a
                                  href={getCfProfileUrl(player.cf_id)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="View Codeforces Profile"
                                >
                                  <img
                                    src="https://res.cloudinary.com/dvhcrdl4b/image/upload/v1767870754/codeforces_qakwky.svg"
                                    alt="Codeforces"
                                    className="w-5 h-5 hover:scale-110 transition-transform"
                                  />
                                </a>
                              )}
                            </div>

                            <p className={`capitalize mt-1 ${teamInfo ? 'text-white opacity-90' : 'text-gray-600 dark:text-gray-400'
                              }`}>
                              {player.position}
                            </p>
                          </div>

                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className={`text-center border-r-2 border-gray-700 dark:border-gray-400 pr-4 ${teamInfo ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                          }`}>
                          <p className="text-sm opacity-80">Final Score</p>
                          <p className="text-xl font-bold">{player.best_score.slice(0, 6)}</p>
                        </div>
                        <div className={`text-center ${teamInfo ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                          }`}>
                          <p className="text-sm opacity-80">Q1 Score</p>
                          <p className="text-xl font-bold">{player.q1_score.slice(0, 6)}</p>
                        </div>
                        <div className={`text-center ${teamInfo ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                          }`}>
                          <p className="text-sm opacity-80">Q2 Score</p>
                          <p className="text-xl font-bold">{player.q2_score.slice(0, 6)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;