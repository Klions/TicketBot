const {PermissionFlagsBits} = require('discord.js');
module.exports = {
	name: 'interactionCreate',
	once: false,
  async execute(interaction, client) {
    if (interaction.isModalSubmit()) {
      if (interaction.customId.includes("askReason_")) {
        
      }else if (interaction.customId === "askReasonClose") {
        
      }
    };
  },
};
