const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('Adiciona alguém ao ticket como participante')
    .addUserOption(input => 
      input.setName('usuario')
      .setDescription('O usuário a adicionar')
      .setRequired(true)),
	async execute(interaction, client) {
    const added = interaction.options.getUser('usuario');
    const ticket = await client.db.get(`tickets_${interaction.channel.id}`);
    if (!ticket) return interaction.reply({content: 'Ticket não encontrado', ephemeral: true}).catch(e => console.log(e));
    if (ticket.invited.includes(added.id)) return interaction.reply({content: 'Usuário já foi adicionado', ephemeral: true}).catch(e => console.log(e));

    if (ticket.invited.lenght >= 5) return interaction.reply({content: 'Você não pode adicionar mais de 5 usuários', ephemeral: true}).catch(e => console.log(e));

    client.db.push(`tickets_${interaction.channel.id}.invited`, added.id);

    await interaction.channel.permissionOverwrites.edit(added, {
      SendMessages: true,
      AddReactions: true,
      ReadMessageHistory: true,
      AttachFiles: true,
      ViewChannel: true,
    }).catch(e => console.log(e));

    client.embedcustom(interaction.channel.id, {
      mention: added.id,
      texto: "<@"+interaction.user.id+"> adicionou <@"+added.id+"> ("+added.tag+") ao ticket.",
      cor: ticket.category.color,
      reply: interaction
    }, client);

    client.log("userAdded", {
      user: {
        tag: interaction.user.tag,
        id: interaction.user.id,
        avatarURL: interaction.user.displayAvatarURL()
      },
      ticketId: ticket.id,
      ticketChannelId: interaction.channel.id,
      added: {
        id: added.id,
      }
    }, client);

    client.update_ticket(interaction, client);
	},
};