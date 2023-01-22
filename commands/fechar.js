const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fechar')
		.setDescription('Fechar o ticket'),
	async execute(interaction, client) {
    if (client.config.whoCanCloseTicket === 'STAFFONLY' && !interaction.member.roles.cache.some(r => client.config.rolesWhoHaveAccessToTheTickets.includes(r.id))) return interaction.reply({
      content: client.locales.ticketOnlyClosableByStaff,
      ephemeral: true
    }).catch(e => console.log(e));

    if (client.config.askReasonWhenClosing) {
      const {closeAskReason} = require('../utils/close_askReason.js');
      closeAskReason(interaction, client);
    } else {
      const {close} = require('../utils/close.js');
      close(interaction, client);
    }
	},
};