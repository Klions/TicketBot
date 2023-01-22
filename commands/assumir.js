const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('assumir')
		.setDescription('Assumir este ticket.'),
	async execute(interaction, client) {
    const {claim} = require('../utils/claim.js');
    claim(interaction, client);
	},
};