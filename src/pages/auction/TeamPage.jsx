import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useWebSocket } from '../../context/WebSocketContext';
import { teamData } from '../../constants/teamData';
import { FaSearch, FaSort, FaArrowLeft, FaUser, FaCrown, FaUserTie } from 'react-icons/fa';
import { motion } from 'framer-motion';
import playersData from '../../data/players.json';
import { SiElixir } from "react-icons/si";

const TeamPage = () => {
  const { teamName } = useParams();
  const { players: soldPlayers } = useWebSocket();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('position');
  const [allPlayers, setAllPlayers] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  const team = teamData[teamName.charAt(0).toUpperCase() + teamName.slice(1)];

  const clanLeaders = [
    { name: "Vidhan Nahar", clan: "Barbarians", codolio_link: "https://codolio.com/profile/vishv0407" },
    { name: "Kush Kelaiya", clan: "Giants", codolio_link: "https://codolio.com/profile/meetrathi_97" },
    { name: "Meet Gandhi", clan: "Pekkas", codolio_link: "https://codolio.com/profile/jays" },
    { name: "Jyotier Vithlani", clan: "Wizards", codolio_link: "https://codolio.com/profile/jyotier" },
  ].filter(leader => leader.clan === teamName.charAt(0).toUpperCase() + teamName.slice(1));

  useEffect(() => {
    const teamPlayers = playersData.players
      .map(player => {
        const soldPlayer = soldPlayers.find(sp => sp.id === player.id);
        return soldPlayer || player;
      })
      .filter(player => player.team === teamName.charAt(0).toUpperCase() + teamName.slice(1));
    setAllPlayers(teamPlayers);
  }, [soldPlayers, teamName]);

  const sortedPlayers = [...allPlayers].sort((a, b) => {
    if (sortBy === 'price') return b.price - a.price;
    
    // Position priority order
    const positionOrder = {
      'co-leader': 1,
      'elder': 2,
      'member': 3
    };
    
    return positionOrder[a.position.toLowerCase()] - positionOrder[b.position.toLowerCase()];
  });

  const filteredPlayers = sortedPlayers.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSpent = allPlayers.reduce((sum, p) => sum + (p.price || 0), 0);
  const remainingBalance = team.wallet - totalSpent;

  const getPositionIcon = (position) => {
    switch (position.toLowerCase()) {
      case 'co-leader': return <FaCrown className="text-yellow-500" />;
      case 'elder': return <FaUserTie className="text-blue-500" />;
      default: return <FaUser className="text-gray-500" />;
    }
  };

  // Function to handle navigation to the last page
  const goBack = () => {
    if (location.state?.from) {
      navigate(location.state.from); // Navigate to the stored 'from' state
    } else {
      navigate(-1); // Go back in history if no state is available
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${team.color} bg-opacity-50 lg:pl-64 pt-8 lg:pt-0`}>
      {/* Back Button */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="fixed top-20 hidden lg:block lg:left-72 z-10 lg:top-4"
      >
        <button
        onClick={goBack}
        className="flex items-center space-x-2 bg-white/90 dark:bg-gray-800 backdrop-blur-sm 
                  px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all
                  transform hover:scale-105"
      >
        <FaArrowLeft className="text-gray-700 dark:text-gray-300" />
        <span className="font-semibold text-gray-700 dark:text-gray-300">Back</span>
      </button>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Team Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="flex justify-center mb-6">
            <motion.img
              src={team.icon}
              alt={teamName}
              className="w-32 h-32 rounded-xl"
            />
          </div>
          <h1 className="text-5xl font-bold bg-clip-text text-transparent 
                         bg-gradient-to-r from-gray-700 to-gray-900 
                         tracking-wider uppercase mb-4">
            {teamName}
          </h1>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-gray-300 to-gray-500 dark:from-gray-500 dark:to-gray-300 rounded-full mb-8" />
          
          <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-gray-900 w-full md:w-[40%] mx-auto rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-[22px] sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Clan Leader</h2>
          <div className="grid grid-cols-1 gap-4">
            {clanLeaders.map((leader, index) => (
              <div key={index} className="flex justify-center items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <FaCrown className="text-yellow-500 text-xl" />
                <div>
                  <a 
                    href={leader.codolio_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-2xl font-semibold text-gray-800 dark:text-gray-200 hover:underline"
                  >
                    {leader.name}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

          {/* Team Stats */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto"
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-2 sm:p-4">
              <p className="text-gray-600 dark:text-gray-300 text-[13px] sm:text-base ">Players</p>
              <p className="text-lg sm:text-3xl font-bold dark:text-gray-200">{allPlayers.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-2 sm:p-4">
              <p className="text-gray-600 dark:text-gray-200 text-[13px] sm:text-base">Spent</p>
              <div className="text-lg sm:text-3xl font-bold flex gap-[1px] items-center justify-center dark:text-gray-200"> 
                <SiElixir className='text-[#E11ADB] text-[16px] sm:text-[24px] rotate-[25deg]'/>
                {totalSpent.toLocaleString()}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-2 sm:p-4">
              <p className="text-gray-600 dark:text-gray-300 text-[13px] sm:text-base">Remaining</p>
              <div className="text-lg sm:text-3xl font-bold flex gap-[1px] items-center justify-center dark:text-gray-200"> 
                <SiElixir className='text-[#E11ADB] text-[16px] sm:text-[24px] rotate-[25deg]'/>
                {remainingBalance.toLocaleString()}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Search and Sort */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-[#030e21] rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
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
            <button
              onClick={() => setSortBy(sortBy === 'price' ? 'position' : 'price')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200
                         transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 whitespace-nowrap"
            >
              <FaSort />
              <span className="hidden sm:inline">Sort by </span>
              {sortBy === 'price' ? 'Position' : 'Price'}
            </button>
          </div>
        </motion.div>

        {/* Players List */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-transparent rounded-xl shadow-lg overflow-hidden"
        >
          {/* Table Header */}
          <div className="bg-gray-50 dark:bg-[#030e21] px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-1 font-semibold text-gray-600 dark:text-gray-300">#</div>
              <div className="col-span-7 font-semibold text-gray-600 dark:text-gray-300">Player</div>
              <div className="col-span-4 text-right font-semibold text-gray-600 dark:text-gray-300">Price</div>
            </div>
          </div>

          {/* Table Body */}
          {filteredPlayers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-900"
            >
              <div className="text-center space-y-4">
                {searchTerm ? (
                  <>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 inline-block">
                      <FaSearch className="text-gray-400 text-4xl" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                      No Players Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                      No players match your search "{searchTerm}"
                    </p>
                  </>
                ) : (
                  <>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 inline-block">
                      <SiElixir className="text-[#E11ADB] text-4xl" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                      No Players Bought Yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                      Players will appear here once they are bought in the auction for {teamName}
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-500">
              {filteredPlayers.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="px-6 py-4 hover:bg-white dark:bg-gray-800 transition-colors"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 text-gray-500 font-medium dark:text-gray-300">
                      {index + 1}
                    </div>
                    <div className="col-span-7">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded-full">
                          {getPositionIcon(player.position)}
                        </div>
                        <div>
                          <a 
                            href={player.codolio_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-semibold dark:text-gray-300 hover:underline"
                          >
                            {player.name}
                          </a>
                          <p className="text-gray-600 capitalize dark:text-gray-400">{player.position}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-4 flex justify-end">
                      <div className="text-2xl font-bold text-gray-800 dark:text-gray-300 flex gap-[1px] items-center">
                        <SiElixir className='text-[#E11ADB] text-[20px] rotate-[25deg]'/>
                        {player.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TeamPage;