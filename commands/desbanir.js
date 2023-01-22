const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('desbanir')
		.setDescription('Desbanir um jogador do GAME.'),
    async execute(interaction, client) {
        const ticket = await client.db.get(`tickets_${interaction.channel.id}`);
        if (!ticket) return interaction.reply({content: 'Ticket não encontrado', ephemeral: true}).catch(e => console.log(e));
        

        for (let i = 0; i < ticket.invited.length; i++) {
            await client.users.fetch(ticket.invited[i]);
        }
        var addedUsers = [];
        ticket.invited.forEach(async user => {
            var usuario = await client.users.cache.get(user);
            var VRP_invited = await client.mysql_discord(usuario.id);
            if(VRP_invited){
                var tag = usuario.tag;
                if(usuario.nickname) tag = usuario.nickname;
                addedUsers.push({id: usuario.id, tag: tag, desc: 'Convidado - ID: '+VRP_invited.user_id});
            }
        });

        if(ticket.creator){
            await client.users.fetch(ticket.creator);
            var user_creator = await client.users.cache.get(ticket.creator);
            var VRP_creator = await client.mysql_discord(ticket.creator);
            if(VRP_creator){
                var tag = user_creator.tag;
                if(user_creator.nickname) tag = user_creator.nickname;
                addedUsers.push({id: user_creator.id, tag: tag, desc: 'Criador do Ticket - ID: '+VRP_creator.user_id});
            }
        }
        if(ticket.denunciados && ticket.denunciados.length > 0){
            var count_den = 0;
            for (const user_denunciado of ticket.denunciados) {
                count_den++;
                var VRP_Denunciado = await client.mysql_discord(user_denunciado);
                if(VRP_Denunciado && VRP_Denunciado.discord){
                    await client.users.fetch(VRP_Denunciado.discord);
                    var membro = await client.users.cache.get(VRP_Denunciado.discord);
                    var tag = membro.tag;
                    addedUsers.push({id: membro.id, tag: tag, desc: 'Jogador Denunciado '+count_den+' - ID: '+VRP_Denunciado.user_id});
                }
            }
        }
        
        if(addedUsers.length > 0){
            const row = new client.discord.ActionRowBuilder()
                .addComponents(
                    new client.discord.SelectMenuBuilder()
                        .setCustomId('BanUserRem')
                        .setPlaceholder('Selecione o usuário que queira desbanir do GAME')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .addOptions(
                            addedUsers.map(user => {
                                return {
                                    label: user.tag,
                                    description: user.desc,
                                    value: user.id
                                }
                            })
                        ),
                );
            interaction.reply({components: [row], ephemeral: true}).catch(e => console.log(e));
        }
	},
};