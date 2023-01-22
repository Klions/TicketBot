module.exports = {
  async log(logsType, logs, client) {
    if (!client.config.logs) return;
    if (!client.config.logsChannelId) return;
    const channel = await client.channels.fetch(client.config.logsChannelId).catch(e => console.error("The channel to log events is not found!\n", e));
    if (!channel) return console.error("The channel to log events is not found!");

    let webhooks = await channel.fetchWebhooks()
    if (webhooks.size === 0) {
      await channel.createWebhook({ name: "Ticket Bot Logs"});
      webhooks = await channel.fetchWebhooks();
    }
    const webhook = webhooks.first();

    if (logsType === "ticketCreate") {
      const embed = new client.discord.EmbedBuilder()
      .setColor("3ba55c")
      .setAuthor({ name: logs.user.tag, iconURL: logs.user.avatarURL })
      .setDescription(`${logs.user.tag} (<@${logs.user.id}>) criou um ticket (<#${logs.ticketChannelId}>) <t:${parseInt(Math.floor(Date.now())/1000)}:R>.\n**Categoria:** \`${logs.categoria}\`\n**Motivo:** \`\`\`\n${logs.reason}\`\`\``);

      webhook.send({
        username: "Novo Ticket",
        avatarURL: "https://i.imgur.com/M38ZmjM.png",
        embeds: [embed]
      }).catch(e => console.log(e));
    };

    if (logsType === "ticketClaim") {
      const embed = new client.discord.EmbedBuilder()
      .setColor("faa61a")
      .setAuthor({ name: logs.user.tag, iconURL: logs.user.avatarURL })
      .setDescription(`${logs.user.tag} (<@${logs.user.id}>) assumiu o ticket #${logs.ticketId} (<#${logs.ticketChannelId}>) após ${client.msToHm(new Date(Date.now() - logs.ticketCreatedAt))} da criação`);

      webhook.send({
        username: "Ticket Assumido",
        avatarURL: "https://i.imgur.com/qqEaUyR.png",
        embeds: [embed]
      }).catch(e => console.log(e));
    };

    if (logsType === "ticketDesignar") {
      var old_designado = '\n**Anteriormente assumido por:** <@'+logs.old_designado+'>' || '';
      const embed = new client.discord.EmbedBuilder()
      .setColor("faa61a")
      .setAuthor({ name: logs.user.tag, iconURL: logs.user.avatarURL })
      .setDescription(`${logs.user.tag} (<@${logs.user.id}>) designou o ticket \`#${logs.ticketId}\` (<#${logs.ticketChannelId}>) para ${logs.designado.tag} (<@${logs.designado.id}>).${old_designado}`);

      webhook.send({
        username: "Ticket Designado",
        avatarURL: "https://i.imgur.com/qqEaUyR.png",
        embeds: [embed]
      }).catch(e => console.log(e));
    };

    if (logsType === "ticketClose") {
      const embed = new client.discord.EmbedBuilder()
      .setColor("ed4245")
      .setAuthor({ name: logs.user.tag, iconURL: logs.user.avatarURL })
      .setDescription(`${logs.user.tag} (<@${logs.user.id}>) finalizou o ticket \`#${logs.ticketId}\` de <@${logs.ticketCreator}> <t:${parseInt(Math.floor(Date.now())/1000)}:R>.\n**Categoria:** \`${logs.categoria}\`\n**Resolvido em:** \`${client.msToHm(new Date(Date.now() - logs.ticketCreatedAt))}\`\n**Motivo:** \`\`\`\n${logs.reason}\`\`\`\n\nTranscrição: ${logs.transcriptURL}`);

      webhook.send({
        username: "Ticket Fechado",
        avatarURL: "https://i.imgur.com/5ShDA4g.png",
        embeds: [embed]
      }).catch(e => console.log(e));
    };

    if (logsType === "ticketDelete") {
      const embed = new client.discord.EmbedBuilder()
      .setColor("ed4245")
      .setAuthor({ name: logs.user.tag, iconURL: logs.user.avatarURL })
      .setDescription(`${logs.user.tag} (<@${logs.user.id}>) deletou o ticket #${logs.ticketId} após ${client.msToHm(new Date(Date.now() - logs.ticketCreatedAt))} de criação\n\nTranscript: ${logs.transcriptURL}`);

      webhook.send({
        username: "Ticket Deletado",
        avatarURL: "https://i.imgur.com/obTW2BS.png",
        embeds: [embed]
      }).catch(e => console.log(e));
    };

    if (logsType === "userAdded") {
      const embed = new client.discord.EmbedBuilder()
      .setColor("3ba55c")
      .setAuthor({ name: logs.user.tag, iconURL: logs.user.avatarURL })
      .setDescription(`${logs.user.tag} (<@${logs.user.id}>) adicionou <@${logs.added.id}> (${logs.added.id}) ao ticket #${logs.ticketId} (<#${logs.ticketChannelId}>)`);

      webhook.send({
        username: "Usuário Adicionado",
        avatarURL: "https://i.imgur.com/G6QPFBV.png",
        embeds: [embed]
      }).catch(e => console.log(e));
    };

    if (logsType === "userRemoved") {
      const embed = new client.discord.EmbedBuilder()
      .setColor("ed4245")
      .setAuthor({ name: logs.user.tag, iconURL: logs.user.avatarURL })
      .setDescription(`${logs.user.tag} (<@${logs.user.id}>) removeu <@${logs.removed.id}> (${logs.removed.id}) do ticket #${logs.ticketId} (<#${logs.ticketChannelId}>)`);

      webhook.send({
        username: "Usuário Removido",
        avatarURL: "https://i.imgur.com/eFJ8xxC.png",
        embeds: [embed]
      }).catch(e => console.log(e));
    };
  }
};