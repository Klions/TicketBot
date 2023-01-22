module.exports = {
  async ban(interaction, client, id_usuario, tipo) {
    const ticket = await client.db.get(`tickets_${interaction.channel.id}`);
    if (!ticket) return interaction.reply({content: 'Ticket not found', ephemeral: true});
    if (interaction.user.id === ticket.creator) return interaction.reply({
      content: client.locales.ticketOnlyClaimableByStaff,
      ephemeral: true
    }).catch(e => console.log(e));

    await client.users.fetch(id_usuario);
    var usuario = await client.users.cache.get(id_usuario);
    var TextoLiberar = "desbaniu";
    if(tipo == 1){
      TextoLiberar = "baniu";
    }
    var VRP_WLUSER = await client.mysql_discord(usuario.id);
    if(VRP_WLUSER){
      client.log("ticketWL", {
        user: {
          tag: interaction.user.tag,
          id: interaction.user.id,
          avatarURL: interaction.user.displayAvatarURL()
        },
        designado: {
          tag: usuario.tag,
          id: usuario.id
        },
        wl: TextoLiberar,
        wl_id: VRP_WLUSER.user_id,
        ticketId: ticket.id,
        ticketChannelId: interaction.channel.id,
        ticketCreatedAt: ticket.createdAt,
      }, client);

      client.embedcustom(interaction.channel.id, {
        mention: usuario.id,
        texto: "<@"+interaction.user.id+"> "+TextoLiberar+" <@"+usuario.id+"> (`ID: "+VRP_WLUSER.user_id+"`).",
        cor: ticket.category.color
      }, client);
      await client.mysql_query(usuario.id, "UPDATE vrp_users SET banned = "+tipo+" WHERE id = USERID");
      await interaction.update({ content: 'O usuário foi selecionado com sucesso!', components: [] }).catch(e => console.log(e));
      //const interec = interaction;
      //
      setTimeout(function(){
        client.update_ticket(interaction, client);
      }, 12*1000);
    }else{
      await interaction.update({ content: 'Este usuário não possui uma conta no servidor para ser banido ou desbanido do game.', components: [] }).catch(e => console.log(e));
    }
  }
};