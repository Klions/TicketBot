module.exports = {
    async update_ticket(interaction, client) {
        const ticket = await client.db.get(`tickets_${interaction.channel.id}`)
        await interaction.channel.messages.fetch()
        const messageId = ticket.messageId;
        const msg = interaction.channel.messages.cache.get(messageId);
        var Status = 'Aguardando atendimento STAFF';
        const embed = msg.embeds[0].data;
        var DescFormat = '**Criado:** <t:'+parseInt(ticket.createdAt/1000)+':R>';
        var content = '<@'+ticket.creator+'>';

        var VRP_Creator = await client.mysql_discord(ticket.creator);
        if(VRP_Creator){
            DescFormat += '\nㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ\n**INFORMAÇÕES DO JOGADOR**';
            if(VRP_Creator.discord){
                await client.users.fetch(VRP_Creator.discord);
                var membro = await client.users.cache.get(VRP_Creator.discord);
                DescFormat += '\n**Discord:** <@'+VRP_Creator.discord+'> `'+membro.tag+'`';
            }
            DescFormat += '\n**InGame:** `'+VRP_Creator.nome+' '+VRP_Creator.sobrenome+'` `(ID: '+VRP_Creator.user_id+')`';
            DescFormat += '\n**Whitelist:** '+(VRP_Creator.whitelisted == 1 ? '`SIM`' : '`NÃO`');
            if(VRP_Creator.banned == 1) DescFormat += '\n**Banido:** `SIM`';
            if(ticket.category.codeName){
                if(ticket.category.codeName === 'denuncia'){

                }
            }
        }

        if(ticket.denunciados && ticket.denunciados.length > 0){
            DescFormat += '\n\n**INFORMAÇÕES '+pluralize("do", ticket.denunciados.length).toUpperCase()+' '+pluralize("denunciado", ticket.denunciados.length).toUpperCase()+'**';
            var count_den = 0;
            for (const user_denunciado of ticket.denunciados) {
                count_den++;
                var VRP_Denunciado = await client.mysql_discord(user_denunciado);
                if(VRP_Denunciado && VRP_Denunciado.discord){
                    await client.users.fetch(VRP_Denunciado.discord);
                    var membro = await client.users.cache.get(VRP_Denunciado.discord);
                    DescFormat += '\n`↱` `Denunciado '+count_den+':` <@'+VRP_Denunciado.discord+'> `'+membro.tag+'`';
                    DescFormat += '\n`↳` `'+VRP_Denunciado.nome+' '+VRP_Denunciado.sobrenome+'` 〡 `ID: '+VRP_Denunciado.user_id+'` 〡 `WL: '+(VRP_Denunciado.whitelisted == 1 ? 'SIM' : 'NÃO')+'`';
                    if(VRP_Denunciado.banned == 1) DescFormat += ' 〡 `BAN: SIM`';
                }else{
                    DescFormat += '\n`↱` `Denunciado '+count_den+':` <@'+user_denunciado+'>';
                    DescFormat += '\n`↳` `NÃO FOI IDENTIFICADO A CONTA DESTE USUÁRIO`';
                }
            }
        }

        var Participantes = '';
        if (ticket.invited.length > 0) {
            ticket.invited.forEach(membro => {
                if(Participantes !== '')Participantes+=', ';
                Participantes+='<@'+membro+'>';
            });
        }
        if(Participantes !== '') DescFormat += '\n**Participantes ('+ticket.invited.length+'):** '+Participantes;

        if(ticket.reason && ticket.reason && !ticket.reason.includes('Nenhum motivo especificado')){
            DescFormat += '\n\n**Motivo:** ```\n'+ticket.reason+'```';
        }else{
            if(ticket.customDescription){
                DescFormat += '\n\n'+customDescription;
            }
        }
        
        if(ticket.claimed && ticket.claimedBy){
            DescFormat += '\n\n**Atendido por:** <@'+ticket.claimedBy+'> (<t:'+parseInt(ticket.claimedAt/1000)+':R>)';
            Status = 'Em atendimento';
            content+=' <@'+ticket.claimedBy+'>';
        }else{
            DescFormat += '\n*Aguarde algum STAFF atender seu ticket*';
            content+= ' '+(ticket.cargosId ? ticket.cargosId.map(x => `<@&${x}>`).join(', ') : '');
        }
        DescFormat += '\n\n`Comandos disponíveis:`\n`/add - Adiciona um usuário ao ticket`\n`/remover - Remove um usuário do ticket`\n`/denunciar - Denuncia um usuário e adiciona ao ticket`';
        DescFormat = '**Status:** `'+Status+'`\n'+DescFormat;
        // client.mysql(interaction, client);
        msg.components[0].components.map(x => {
            if (x.data.custom_id === 'claim' && ticket.claimed) x.data.disabled = true;
        });
        embed.description = DescFormat;

        msg.edit({
            content: content,
            embeds: [embed],
            components: msg.components
        }).catch(e => console.log(e));
    }
};

function pluralize(singular, times) {
    if (times == 1) return singular;
    else return singular + 's';
}