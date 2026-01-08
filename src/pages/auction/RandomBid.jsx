import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers,
  FaTimes,
  FaArrowLeft,
  FaDice,
  FaCrown,
  FaUserTie,
  FaUser,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import playersData from "../../data/players.json";
import { teamData } from "../../constants/teamData";
import toast from "react-hot-toast";

const RandomBid = () => {
  const [selectedPosition, setSelectedPosition] = useState("co-leader");
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [soldPlayers, setSoldPlayers] = useState(
    JSON.parse(localStorage.getItem("randomBidsPlayer") || "[]")
  );
  const [unsoldPlayers, setUnsoldPlayers] = useState(
    JSON.parse(localStorage.getItem("randomBidsUnsoldPlayers") || "[]")
  );
  const [showUnsoldPlayers, setShowUnsoldPlayers] = useState(false);

  const positions = ["Co-Leader", "Elder", "Member"];

  // Filter available players
  const availablePlayers = playersData.players.filter(
    (player) =>
      player.position.toLowerCase() === selectedPosition.toLowerCase() &&
      !soldPlayers.some((sold) => sold.id === player.id) &&
      !unsoldPlayers.some((unsold) => unsold.id === player.id)
  );

  const handleRandomSelect = () => {
    if (availablePlayers.length === 0) return;

    setIsAnimating(true);
    const totalTime = 2000;
    const intervalTime = 150;
    const intervals = Math.floor(totalTime / intervalTime);

    let count = 0;
    const interval = setInterval(() => {
      if (count < intervals) {
        // Generate single random index
        const randomIndex = Math.floor(Math.random() * availablePlayers.length);
        setActiveIndex(randomIndex);
        count++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
        setActiveIndex(null);
        const finalIndex = Math.floor(Math.random() * availablePlayers.length);
        setSelectedPlayer(availablePlayers[finalIndex]);
      }
    }, intervalTime);
  };

  const handleSoldPlayerClick = (player) => {
    setSelectedPlayer(player);
    setSelectedTeam(player.team);
    setShowModal(true);
  };

  const markAsSold = () => {
    if (!selectedPlayer || !selectedTeam) {
      toast.error("Please select a team");
      return;
    }

    const updatedPlayer = {
      ...selectedPlayer,
      team: selectedTeam,
      sold: true,
    };

    // Update if player exists, otherwise add new
    const newSoldPlayers = selectedPlayer.sold
      ? soldPlayers.map((p) => (p.id === selectedPlayer.id ? updatedPlayer : p))
      : [...soldPlayers, updatedPlayer];

    setSoldPlayers(newSoldPlayers);
    localStorage.setItem("randomBidsPlayer", JSON.stringify(newSoldPlayers));
    setSelectedPlayer(null);
    setSelectedTeam(null);

    toast.success(
      `${updatedPlayer.name} ${
        selectedPlayer.sold ? "updated" : "added"
      } successfully!`
    );
  };

  const markAsUnsold = () => {
    if (!selectedPlayer) return;

    const updatedUnsoldPlayers = [...unsoldPlayers, selectedPlayer];
    setUnsoldPlayers(updatedUnsoldPlayers);
    localStorage.setItem("randomBidsUnsoldPlayers", JSON.stringify(updatedUnsoldPlayers));
    setSelectedPlayer(null);
    setSelectedTeam(null);
    toast.success(`${selectedPlayer.name} marked as unsold`);
  };

  const moveToBidding = (player) => {
    const newUnsoldPlayers = unsoldPlayers.filter(p => p.id !== player.id);
    setUnsoldPlayers(newUnsoldPlayers);
    localStorage.setItem("randomBidsUnsoldPlayers", JSON.stringify(newUnsoldPlayers));
    setSelectedPlayer(player);
  };

  const getPositionIcon = (position) => {
    switch (position.toLowerCase()) {
      case "co-leader":
        return <FaCrown className="text-yellow-500" />;
      case "elder":
        return <FaUserTie className="text-green-300" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  const PositionIcon = ({ position, className = "" }) => (
    <div className={`p-2 bg-white/10 rounded-full ${className}`}>
      {getPositionIcon(position)}
    </div>
  );

  const getTeamPositionCounts = (teamName) => {
    const teamPlayers = soldPlayers.filter(player => player.team === teamName);
    return {
      'co-leader': teamPlayers.filter(p => p.position.toLowerCase() === 'co-leader').length,
      'elder': teamPlayers.filter(p => p.position.toLowerCase() === 'elder').length,
      'member': teamPlayers.filter(p => p.position.toLowerCase() === 'member').length
    };
  };

  const isTeamPositionFull = (teamName, position) => {
    const counts = getTeamPositionCounts(teamName);
    const limits = {
      'co-leader': 3,
      'elder': 4,
      'member': 8
    };
    return counts[position.toLowerCase()] >= limits[position.toLowerCase()];
  };

  return (
    <div className="min-h-screen bg-[#010815] pt-8 md:pt-6 p-4 relative">
      <div className="max-w-full sm:px-20 mx-auto pb-24 mt-12 sm:mt-0 ">
        <Link
          to="/adminpage/dashboard"
          className="inline-flex items-center text-gray-300 hover:text-white transition-colors mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back to Dashboard
        </Link>

        {/* Position Selection */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-8 shadow-lg">
          <h1 className="text-4xl font-bold text-white mb-6 text-center">
            Random Player Generator
          </h1>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            {positions.map((pos) => (
              <button
                key={pos}
                onClick={() => setSelectedPosition(pos)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-bold transition-all
                  ${
                    selectedPosition === pos
                      ? "bg-blue-500 text-white transform scale-105 shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
              >
                <PositionIcon position={pos} />
                {pos.charAt(0).toUpperCase() + pos.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          {availablePlayers.length > 0 ? (
            availablePlayers.map((player, index) => (
              <motion.div
                key={player.id}
                animate={
                  isAnimating && activeIndex === index
                    ? {
                        scale: 1.03,
                        backgroundColor: "rgba(255,255,255,0.5)",
                        transition: {
                          duration: 0.1,
                          ease: "easeInOut",
                        },
                      }
                    : {
                        scale: 1,
                        backgroundColor: "rgb(31,41,55)",
                        transition: {
                          duration: 0.1,
                          ease: "easeInOut",
                        },
                      }
                }
                className="bg-gray-900 rounded-xl p-6 transform transition-all shadow-lg"
              >
                <div className="flex items-center gap-3 mb-2">
                  {/* <div className={`p-2 rounded-full bg-white/10`}>
                    {getPositionIcon(player.position)}
                  </div> */}
                  <h3 className="text-2xl font-bold text-white">
                    {player.name}
                  </h3>
                </div>
                <p className="text-gray-400 capitalize">{player.position}</p>
              </motion.div>
            ))
          ) : (
            <div className="col-span-6 text-center py-8">
              <p className="text-gray-400 text-xl">
                No players available for this position
              </p>
            </div>
          )}
        </div>

        {/* Random Selection Button - Normal positioning */}
        <div className="relative">
          <button
            onClick={handleRandomSelect}
            disabled={isAnimating || availablePlayers.length === 0}
            className={`w-full bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-600 
              hover:from-purple-700 hover:via-blue-600 hover:to-indigo-700
              text-white font-bold py-6 rounded-xl shadow-lg 
              transition-all disabled:from-gray-600 disabled:to-gray-700 text-xl
              transform hover:scale-[1.02] disabled:hover:scale-100
              disabled:cursor-not-allowed flex items-center justify-center gap-3`}
          >
            <FaDice className="text-2xl" />
            {isAnimating ? "Selecting..." : "Random Player"}
          </button>
        </div>

        {/* Sold Players Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-white">
            Selected Players
          </h2>
          {soldPlayers.filter((p) => p.position.toLowerCase() === selectedPosition.toLowerCase()).length >
          0 ? (
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              {soldPlayers
                .filter((p) => p.position.toLowerCase() === selectedPosition.toLowerCase())
                .map((player) => {
                  const teamInfo = teamData[player.team];
                  return (
                    <div
                      key={player.id}
                      onClick={() => handleSoldPlayerClick(player)}
                      className={`${teamInfo.color} rounded-xl p-6 
                        shadow-lg transform hover:scale-[1.02] transition-all duration-300
                        cursor-pointer flex`}
                    >
                      <img
                        src={teamInfo.icon}
                        alt={player.team}
                        className="w-10 h-10 mt-2 mr-4"
                      />
                      <div className="flex items-center gap-3 mb-2">
                        {/* <PositionIcon
                          position={player.position}
                          className={`${
                            soldPlayers.some(
                              (soldPlayer) => soldPlayer.name === player.name
                            )
                              ? "bg-white/70"
                              : "bg-white/10"
                          }`}
                        /> */}
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {player.name}
                          </h3>
                          <p className="text-white/90 capitalize">
                            {player.position}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="bg-gray-900 rounded-xl p-8 text-center">
              <p className="text-gray-400 text-xl">No players sold yet</p>
            </div>
          )}
        </div>

        {/* Add toggle button for unsold players */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowUnsoldPlayers(!showUnsoldPlayers)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg"
          >
            {showUnsoldPlayers ? "Hide Unsold Players" : "Show Unsold Players"}
          </button>
        </div>

        {/* Add Unsold Players Section */}
        {showUnsoldPlayers && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6 text-white">Unsold Players</h2>
            {unsoldPlayers.filter((p) => p.position.toLowerCase() === selectedPosition.toLowerCase()).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                {unsoldPlayers
                  .filter((p) => p.position.toLowerCase() === selectedPosition.toLowerCase())
                  .map((player) => (
                    <div
                      key={player.id}
                      onClick={() => moveToBidding(player)}
                      className="bg-red-900/50 rounded-xl p-6 shadow-lg transform 
                        hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                    >
                      <h3 className="text-xl font-bold text-white">{player.name}</h3>
                      <p className="text-white/90 capitalize">{player.position}</p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-gray-900 rounded-xl p-8 text-center">
                <p className="text-gray-400 text-xl">No unsold players</p>
              </div>
            )}
          </div>
        )}

        {/* Fixed Modal Positioning */}
        <AnimatePresence>
          {selectedPlayer && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 z-[100]"
                onClick={() => setSelectedPlayer(null)}
              />
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="fixed z-[101] bg-gray-900 rounded-xl p-8 shadow-2xl
                  border border-gray-700 w-[90%] max-w-2xl left-[5%] md:left-[30%] top-[10%] md:top-[5%]"
                style={{
                  top: "10%",
                  // left: "40%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                  <FaTimes size={24} />
                </button>

                {/* <h2 className="text-2xl font-bold text-white mb-6">
                  Selected Player
                </h2> */}

                <div className="bg-gray-700 rounded-lg p-4 mb-6 mt-6">
                  <h3 className="text-3xl text-center font-bold text-white mb-2">
                    {selectedPlayer.name}
                  </h3>
                  <p className="text-gray-300 text-center capitalize">
                    {selectedPlayer.position}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {Object.entries(teamData).map(([teamName, data]) => {
                    const counts = getTeamPositionCounts(teamName);
                    const isDisabled = isTeamPositionFull(teamName, selectedPlayer.position);
                    const positionLimit = {
                      'co-leader': 4,
                      'elder': 16,
                      'member': 16
                    }[selectedPlayer.position.toLowerCase()];
                    
                    const currentCount = counts[selectedPlayer.position.toLowerCase()];
                    
                    return (
                      <button
                        key={teamName}
                        onClick={() => setSelectedTeam(teamName)}
                        disabled={isDisabled}
                        className={`${data.color} p-4 py-6 text-2xl rounded-lg text-white
                          ${selectedTeam === teamName 
                            ? "ring-4 ring-white transform scale-102 shadow-lg" 
                            : ""
                          }
                          ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}
                          transition-all duration-300`}
                      >
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="flex items-center justify-center space-x-2">
                            <img
                              src={data.icon}
                              alt={teamName}
                              className="w-7 h-7"
                            />
                            <span className="font-bold">{teamName}</span>
                          </div>
                          <div className="text-sm">
                            <p className="capitalize">
                              {selectedPlayer.position}s: {currentCount}/{positionLimit}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-4 mt-4">
                  <button
                    onClick={markAsSold}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white 
                      font-bold py-4 text-xl rounded-lg shadow-lg transition-colors"
                  >
                    Confirm Selection
                  </button>
                  <button
                    onClick={markAsUnsold}
                    className="flex-1 bg-gray-500 hover:bg-red-600 text-white 
                      font-bold py-4 text-xl rounded-lg shadow-lg transition-colors"
                  >
                    Mark as Unsold
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RandomBid;
