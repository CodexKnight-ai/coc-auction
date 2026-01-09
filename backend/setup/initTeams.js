const Team = require('../models/Team');

const initializeTeams = async () => {
  try {
    const teams = [
      { 
        name: 'Barbarians', 
        wallet: 20000,
        color: 'bg-yellow-500'
      },
      { 
        name: 'Giants', 
        wallet: 20000,
        color: 'bg-red-500'
      },
      { 
        name: 'Pekkas', 
        wallet: 20000,
        color: 'bg-purple-500'
      },
      { 
        name: 'Wizards', 
        wallet: 20000,
        color: 'bg-blue-500'
      }
    ];
    
    for (const team of teams) {
      const existingTeam = await Team.findOne({ name: team.name });
      
      if (!existingTeam) {
        await Team.create(team);
        console.log(`Team ${team.name} initialized with wallet ${team.wallet}`);
      }
    }
  } catch (error) {
    console.error('Error initializing teams:', error);
  }
};

module.exports = initializeTeams; 