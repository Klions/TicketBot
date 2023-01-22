const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('designar')
		.setDescription('Designar um staff ao ticket.')
        .addUserOption(input => 
        input.setName('usuario')
        .setDescription('O usuário a designar')
        .setRequired(true)),
    async execute(interaction, client) {
        const designarid = interaction.options.getUser('usuario');
        const ticket = await client.db.get(`tickets_${interaction.channel.id}`);
        if (!ticket) return interaction.reply({content: 'Ticket não encontrado', ephemeral: true}).catch(e => console.log(e));
        if (ticket.claimedBy && ticket.claimedBy.includes(designarid.id)) return interaction.reply({content: 'STAFF já está designado a este ticket', ephemeral: true}).catch(e => console.log(e));

        var info = {
            usuario: designarid
        }
        const {designar} = require('../utils/designar.js');
        designar(interaction, client, info);
	},
};