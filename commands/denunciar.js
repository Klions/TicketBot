const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('denunciar')
		.setDescription('Adiciona um usuário como denunciado')
    .addIntegerOption(option => 
      option.setName('id')
      .setDescription('ID do usuário denunciado')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(8)
    ),
	async execute(interaction, client) {
    const added = interaction.options.getInteger('id');
    const ticket = await client.db.get(`tickets_${interaction.channel.id}`);
    if (!ticket) return interaction.reply({content: 'Ticket não encontrado', ephemeral: true}).catch(e => console.log(e));
    if (!added || parseInt(added) <= 0){
      return interaction.reply({content: 'Coloque um PASSAPORTE de usuário válido', ephemeral: true}).catch(e => console.log(e));
    }
    if (ticket.denunciados.lenght >= 6) return interaction.reply({content: 'Você não pode adicionar mais de 6 usuários', ephemeral: true}).catch(e => console.log(e));
    var VRP_denunc = await client.mysql_userid(parseInt(added));
    if(!VRP_denunc || !VRP_denunc.discord) return interaction.reply({content: 'Este PASSAPORTE ('+parseInt(added)+') não é de um usuário válido', ephemeral: true}).catch(e => console.log(e));
    if (ticket.denunciados.includes(VRP_denunc.discord)) return interaction.reply({content: 'Este usuário já foi adicionado como denunciado', ephemeral: true}).catch(e => console.log(e));

    await client.users.fetch(VRP_denunc.discord);
    var user_denunciado = await client.users.cache.get(VRP_denunc.discord);

    await client.db.push(`tickets_${interaction.channel.id}.denunciados`, VRP_denunc.discord);

    await client.embedcustom(interaction.channel.id, {
      texto: "<@"+interaction.user.id+"> adicionou <@"+user_denunciado.id+"> ("+user_denunciado.tag+" - ID: "+VRP_denunc.user_id+") como DENUNCIADO ao ticket.",
      cor: ticket.category.color,
      reply: interaction
    }, client);

    await client.log("userDenunciadoAdd", {
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

    await client.update_ticket(interaction, client);
	},
};