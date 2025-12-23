import React, { useState, useEffect } from "react";
import { useWebSocket } from "../../context/WebSocketContext";
import playersData from "../../data/players.json";
import { teamData } from "../../constants/teamData";
import { FaTimes, FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";
import { SiElixir } from "react-icons/si";

const AdminDashboard = () => {
  const { socket, players: soldPlayers } = useWebSocket();
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [price, setPrice] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [players, setPlayers] = useState([]);

  // Initialize and update players when soldPlayers changes
  useEffect(() => {
    const updatedPlayers = playersData.players.map((player) => {
      const soldPlayer = soldPlayers.find((sp) => sp.id === player.id);
      return soldPlayer || player;
    });
    setPlayers(updatedPlayers);
  }, [soldPlayers]);

  // Listen for real-time updates
  useEffect(() => {
    if (socket) {
      socket.on("playerUpdated", (updatedPlayer) => {
        setPlayers((prevPlayers) =>
          prevPlayers.map((player) =>
            player.id === updatedPlayer.id ? updatedPlayer : player
          )
        );
      });

      socket.on("playerAdded", (newPlayer) => {
        setPlayers((prevPlayers) => [...prevPlayers, newPlayer]);
      });

      return () => {
        socket.off("playerUpdated");
        socket.off("playerAdded");
      };
    }
  }, [socket]);

  // Rest of your existing functions
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.team && !b.team) return -1;
    if (!a.team && b.team) return 1;
    if (a.team === b.team) return a.name.localeCompare(b.name);
    return (a.team || "").localeCompare(b.team || "");
  });

  const filteredPlayers = sortedPlayers.filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlayer(null);
    setPrice("");
    setSelectedTeam(null);
  };

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setPrice(player.price?.toString() || "");
    setSelectedTeam(player.team || null);
    setShowModal(true);
  };

  const isDarkTheme = document.documentElement.classList.contains('dark');
  const toastStyle = {
    background: isDarkTheme ? "#FFFFFF" : "#374151",
    color: isDarkTheme ? "#000000" : "#FFFFFF",
    fontSize: "21px",
  };

  const getTeamBalance = (teamName, excludePlayerId = null) => {
    const teamPlayers = players.filter(
      (p) => p.team === teamName && p.id !== excludePlayerId
    );
    const spentAmount = teamPlayers.reduce((sum, p) => sum + (p.price || 0), 0);
    const initialBalance = teamData[teamName].wallet;
    return initialBalance - spentAmount;
  };

  const handleSubmit = async () => {
    if (!selectedPlayer || !selectedTeam || !price) {
      toast.error("Please fill all fields", {
        style: toastStyle,
      });
      return;
    }

    const newPrice = parseInt(price);
    const oldPrice = selectedPlayer.sold ? (selectedPlayer.price || 0) : 0;
    const priceDifference = newPrice - oldPrice;

    // If it's an update and team hasn't changed, check balance differently
    const isSameTeam = selectedPlayer.team === selectedTeam;
    const availableBalance = isSameTeam
      ? getTeamBalance(selectedTeam, selectedPlayer.id) + oldPrice
      : getTeamBalance(selectedTeam);

    // Check if team can afford the price difference
    if (isSameTeam) {
      if (availableBalance < newPrice) {
        toast.error(`${selectedTeam} cannot afford this price`, {
          style: toastStyle,
        });
        return;
      }
    } else {
      if (availableBalance < newPrice) {
        toast.error(`${selectedTeam} cannot afford this price`, {
          style: toastStyle,
        });
        return;
      }
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/players/sell`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playerId: selectedPlayer.id,
            name: selectedPlayer.name,
            position: selectedPlayer.position,
            team: selectedTeam,
            price: newPrice,
            modifiedTime: Date.now(),
            sold: true,
            codolioLink: selectedPlayer.codolio_link || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update player');
      }

      closeModal();
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to update player", {
        style: toastStyle,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#010815] p-0 md:p-4 lg:pl-64 pt-14 lg:pt-8">
      <div className="max-w-7xl mx-auto p-4 py-8">
        {/* Team Wallets Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            Team Balances
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(teamData).map(([teamName, data]) => {
              const remainingBalance = getTeamBalance(teamName);
              const spentAmount = data.wallet - remainingBalance;

              return (
                <div
                  key={teamName}
                  className={`${data.color} ${data.border} border-2 rounded-lg p-4
                             shadow-md transform hover:scale-105 transition-all duration-300`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <img src={data.icon} alt={teamName} className="w-9 h-9" />
                    <div>
                      <h3 className="text-white font-bold">{teamName}</h3>
                    </div>
                  </div>
                  <div className="text-white">
                    <div className="text-sm opacity-90 flex">
                      Spent:{" "}
                      <span className="pl-1 flex gap-[1px] items-center">
                        <SiElixir className="text-white text-[14px] rotate-[25deg]" />
                        {spentAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className=" flex text-sm">
                      Balance:{" "}
                      <span className="pl-1 font-bold flex gap-[1px] items-center">
                        <SiElixir className="text-white text-[12px] rotate-[25deg]" />
                        {remainingBalance.toLocaleString()}{" "}
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                      <div
                        className="bg-white rounded-full h-2"
                        style={{
                          width: `${(remainingBalance / data.wallet) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Players Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex-col gap-3 md:gap-0 md:flex-row flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Players ({filteredPlayers.length})
            </h2>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search players..."
                className="w-64 pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:text-gray-200 
                           dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPlayers.map((player) => {
              const teamInfo = player.team ? teamData[player.team] : null;
              return (
                <div
                  key={player.id}
                  onClick={() => handlePlayerClick(player)}
                  className={`${teamInfo ? teamInfo.color : "bg-gray-100"} 
                             ${teamInfo ? teamInfo.border : "border-gray-200"} 
                             border-2 rounded-lg p-4 cursor-pointer
                             transform hover:scale-105 transition-all duration-300
                             shadow-md hover:shadow-lg`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3
                        className={`text-lg font-bold ${player.sold ? "text-white" : "text-gray-800"
                          }`}
                      >
                        {player.name}
                      </h3>
                      <p
                        className={`capitalize ${player.sold ? "text-white" : "text-gray-600"
                          }`}
                      >
                        {player.position}
                      </p>
                    </div>
                    {player.team && (
                      <img
                        src={teamData[player.team].icon}
                        alt={player.team}
                        className="w-8 h-8"
                      />
                    )}
                  </div>
                  {player.sold && (
                    <div className="mt-3 text-white">
                      <p className="text-sm opacity-90">
                        Sold to {player.team}
                      </p>
                      <div className="text-lg font-bold flex gap-[1px] items-center">
                        <SiElixir className="text-white text-[16px] rotate-[25deg]" />
                        {player.price.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sell Modal - Now Larger */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  {selectedPlayer.sold ? "Update Player" : "Sell Player"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-300 mb-2">
                    {selectedPlayer.name}
                  </h3>
                  <p className="text-gray-600 text-lg capitalize dark:text-gray-400">
                    {selectedPlayer.position}
                  </p>
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Price
                  </label>
                  <input
                    type="text"
                    className="w-full pl-6 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:text-gray-200 
                              dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                    value={price}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        setPrice(value);
                      }
                    }}
                    placeholder="Enter amount"
                  />

                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Select Team
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(teamData).map(([teamName, data]) => {
                      // Calculate remaining balance for each team
                      const remainingBalance = getTeamBalance(teamName);

                      return (
                        <button
                          key={teamName}
                          className={`${data.color} p-4 rounded-lg text-white
            ${selectedTeam === teamName ? "ring-4 ring-blue-500 dark:ring-white bg-opacity-100" : "bg-opacity-80"}
            hover:opacity-90 transition-all duration-300`}
                          onClick={() => setSelectedTeam(teamName)}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <img
                              src={data.icon}
                              alt={teamName}
                              className="w-10 h-10 md:w-7 md:h-7"
                            />
                            <div className="flex flex-col items-start">
                              <div className="text-lg font-bold">
                                {teamName}
                              </div>
                              <div className="text-sm flex">
                                Balance:
                                <span className="pl-1 flex gap-[1px] items-center">
                                  <SiElixir className="text-white text-[14px] rotate-[25deg]" />
                                  {remainingBalance.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  className="w-full p-4 text-xl bg-green-500 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg
                    hover:bg-green-600 transition-colors disabled:bg-gray-300
                    font-bold mt-4"
                  onClick={handleSubmit}
                  disabled={!selectedPlayer || !selectedTeam || !price}
                >
                  {selectedPlayer.sold ? "Update Player" : "Confirm Sale"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default AdminDashboard;