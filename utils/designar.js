module.exports = {
  async designar(interaction, client, info) {
    const ticket = await client.db.get(`tickets_${interaction.channel.id}`);
    if (!ticket) return interaction.reply({content: 'Ticket not found', ephemeral: true});

    const canClaim = interaction.member.roles.cache.some(r => client.config.rolesModerator.includes(r.id));

    if (!canClaim){
      var CargosModerator = '';
      if (client.config.rolesModerator.length > 0) {
        client.config.rolesModerator.forEach(role => {
          if(CargosModerator !== '')CargosModerator+=', ';
          CargosModerator+='<@&'+role+'>';
        });
      }else{
        CargosModerator = 'STAFFs';
      }
      return interaction.reply({
        content: client.locales.ticketOnlyModerator.replace('CARGOSDESIGNAR', CargosModerator),
        ephemeral: true
      }).catch(e => console.log(e));
    }

    if (interaction.user.id === ticket.creator) return interaction.reply({
      content: client.locales.ticketOnlyClaimableByStaff,
      ephemeral: true
    }).catch(e => console.log(e));

    /*
    if (ticket.claimed) return interaction.reply({
      content: client.locales.ticketAlreadyClaimed,
      ephemeral: true
    }).catch(e => console.log(e));
    */
    var AntigoDesignado = false;
    if (ticket.claimed && ticket.claimedBy){
      AntigoDesignado = ticket.claimedBy;
    }

    client.log("ticketDesignar", {
      user: {
        tag: interaction.user.tag,
        id: interaction.user.id,
        avatarURL: interaction.user.displayAvatarURL()
      },
      designado: {
        tag: info.usuario.tag,
        id: info.usuario.id
      },
      old_designado: AntigoDesignado,
      ticketId: ticket.id,
      ticketChannelId: interaction.channel.id,
      ticketCreatedAt: ticket.createdAt,
    }, client);

    await client.db.set(`tickets_${interaction.channel.id}.claimed`, true);
    await client.db.set(`tickets_${interaction.channel.id}.claimedBy`, info.usuario.id);
    await client.db.set(`tickets_${interaction.channel.id}.claimedAt`, Date.now());

    await interaction.channel.messages.fetch()
    /*const messageId = await client.db.get(`tickets_${interaction.channel.id}.messageId`)
    const msg = interaction.channel.messages.cache.get(messageId);

    const embed = msg.embeds[0].data;
    embed.description = embed.description + `\n\n ${client.locales.other.claimedBy.replace('USER', `<@${interaction.user.id}>`)}`;

    msg.components[0].components.map(x => {
      if (x.data.custom_id === 'claim') x.data.disabled = true;
    });

    msg.edit({
      content: msg.content,
      embeds: [embed],
      components: msg.components
    }).catch(e => console.log(e));*/

    client.embedcustom(interaction.channel.id, {
      mention: info.usuario.id,
      texto: "<@"+interaction.user.id+"> designou <@"+info.usuario.id+"> ("+info.usuario.tag+") ao ticket.",
      cor: ticket.category.color,
      reply: interaction
    }, client);

    client.update_ticket(interaction, client);
    /*
    interaction.reply({
      content: client.locales.ticketClaimedMessage.replace('USER', `<@${interaction.user.id}>`),
      ephemeral: false
    }).catch(e => console.log(e));
    */
  }
};