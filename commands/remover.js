const { SlashCommandBuilder, ActionRowBuilder, Events, SelectMenuBuilder } = require('discord.js');
const add = require('./add');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remover')
		.setDescription('Remover algum participante do ticket'),
	async execute(interaction, client) {
    const ticket = await client.db.get(`tickets_${interaction.channel.id}`);
    if (!ticket) return interaction.reply({content: 'Ticket não encontrado', ephemeral: true}).catch(e => console.log(e));
    if (ticket.invited.length < 1) return interaction.reply({content: 'Não há usuários para remover', ephemeral: true}).catch(e => console.log(e));
    
    for (let i = 0; i < ticket.invited.length; i++) {
      await client.users.fetch(ticket.invited[i]);
    }

    const addedUsers = ticket.invited.map(user => client.users.cache.get(user))

    const row = new ActionRowBuilder()
			.addComponents(
				new SelectMenuBuilder()
					.setCustomId('removeUser')
					.setPlaceholder('Selecione um usuário para remover')
          .setMinValues(1)
          .setMaxValues(ticket.invited.length)
					.addOptions(
            addedUsers.map(user => {
              return {
                label: user.tag,
                value: user.id
              }
            })
					),
			);

    interaction.reply({components: [row], ephemeral: true}).catch(e => console.log(e));
	},
};