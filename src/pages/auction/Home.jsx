import React from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import { Link } from 'react-router-dom';
import { teamData } from '../../constants/teamData';
import { FaTrophy, FaUsers, FaCoins } from 'react-icons/fa';
import { SiElixir } from "react-icons/si";
import  pclublogo  from "../../assets/pclublogo.png"

const Home = () => {
  const { players: soldPlayers } = useWebSocket();

  // Get top 3 highest bids
  const topBids = soldPlayers
    .filter(player => player.sold)
    .sort((a, b) => b.price - a.price)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#010815] p-4 lg:pl-[17rem] pt-20 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className=" flex justify-between bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 mb-8 text-white">
          <div>
            <h1 className="text-[2rem] md:text-5xl font-bold mb-4">
              Clash of Codes 4.0 Auction
            </h1>
            <p className="text-[1.15rem] opacity-90">
              Ultimate coding tournament by Programming club of Ahmedabad University ✨
            </p>
          </div>
          <div>
            <img src={pclublogo} alt="pclub logo" className='w-[8rem] mt-3 sm:mt-0 lg:w-[5.5rem]' />
          </div>
        </div>

        {/* Top Bids Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200 flex items-center">
            <FaTrophy className="text-yellow-500 mr-2" />
            Highest Bids
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topBids.length > 0 ? (
              topBids.map((player, index) => {
                const team = teamData[player.team];
                return (
                  <div
                    key={player.id}
                    className={`${team.color} rounded-xl p-6 shadow-lg
                      transform hover:scale-105 transition-all duration-300
                      relative overflow-hidden`}
                  >
                    {/* Position Badge */}
                    <div className="absolute -right-8 -top-8 bg-white/20 w-24 h-24 rounded-full">
                      <span className="absolute bottom-5 left-3 text-4xl font-bold text-white">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="flex items-start space-x-4">
                      <img src={team.icon} alt={team.name} className="w-16 h-16" />
                      <div>
                        <a 
                          href={player.codolio_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white text-xl font-bold mb-1 hover:underline"
                        >
                          {player.name}
                        </a>
                        <p className="text-white/90">{player.position}</p>
                        <div className="mt-3">
                          <p className="text-sm text-white/90">Sold to {player.team}</p>
                          <div className="text-2xl font-bold text-white flex gap-[1px] items-center">
                            <SiElixir className='text-white text-[20px] rotate-[25deg]'/>
                            {player.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 bg-white dark:bg-gray-900 rounded-xl p-8 text-center shadow-lg">
                <p className="text-xl font-semibold text-gray-800 dark:text-gray-300">
                  Auction not started yet, stay tuned!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Teams Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200 flex items-center">
            <FaUsers className="text-blue-500 mr-2" />
            Teams Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(teamData).map(([teamName, data]) => {
              const teamPlayers = soldPlayers.filter(p => p.team === teamName);
              const totalSpent = teamPlayers.reduce((sum, p) => sum + (p.price || 0), 0);
              const remainingBalance = data.wallet - totalSpent;

              return (
                <Link
                  key={teamName}
                  to={`/teams/${teamName.toLowerCase()}`}
                  className={`${data.color} rounded-xl p-4 shadow-lg
                    transform hover:scale-105 transition-all duration-300
                    cursor-pointer group`}
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <img 
                      src={data.icon} 
                      alt={teamName} 
                      className="w-9 h-9 transform group-hover:scale-110 transition-transform" 
                    />
                    <h3 className="text-white text-lg font-bold">{teamName}</h3>
                  </div>
                  
                  <div className="text-white">
                    <div className="flex justify-between items-center mb-2">
                      <span className="opacity-90">Players:</span>
                      <span className="font-bold">{teamPlayers.length}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="opacity-90">Spent:</span>
                      <span className="font-bold flex gap-[1px] items-center"><SiElixir className='text-white text-[14px] rotate-[25deg]'/>{totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                      <div 
                        className="bg-white rounded-full h-2 transition-all duration-500"
                        style={{ width: `${(remainingBalance / data.wallet) * 100}%` }}
                      />
                    </div>
                    <div className="text-sm text-center flex gap-[1px] items-center">
                        <SiElixir className='text-white text-[12px] rotate-[25deg]'/>{remainingBalance.toLocaleString()} remaining
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200 flex items-center">
            <FaCoins className="text-green-500 mr-2" />
            Auction Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-gray-600 dark:text-gray-400">Total Players</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{soldPlayers.length}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-gray-600 dark:text-gray-400">Sold Players</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {soldPlayers.filter(p => p.sold).length}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-gray-600 dark:text-gray-400">Total Spent</p>
              <div className="text-2xl font-bold flex gap-[1px] items-center dark:text-gray-200">
              <SiElixir className='text-[#E11ADB] text-[20px] rotate-[25deg]'/>
              {soldPlayers.reduce((sum, p) => sum + (p.price || 0), 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-gray-600 dark:text-gray-400">Average Price</p>
              <div className="text-2xl font-bold flex gap-[1px] items-center dark:text-gray-200">
              <SiElixir className='text-[#E11ADB] text-[20px] rotate-[25deg]'/>
              {Math.round(soldPlayers.reduce((sum, p) => sum + (p.price || 0), 0) / 
                  (soldPlayers.filter(p => p.sold).length || 1)).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 