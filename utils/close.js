const discordTranscripts = require('discord-html-transcripts');
const axios = require('axios');
const { url, token } = require('../config/token.json');
module.exports = {
  async close(interaction, client, reason) {
    const ticket = await client.db.get(`tickets_${interaction.channel.id}`);
    if (!ticket) return interaction.reply({content: 'Ticket não encontrado', ephemeral: true}).catch(e => console.log(e));

    if (client.config.whoCanCloseTicket === 'STAFFONLY' && !interaction.member.roles.cache.some(r => client.config.rolesWhoHaveAccessToTheTickets.includes(r.id))) return interaction.reply({
      content: client.locales.ticketOnlyClosableByStaff,
      ephemeral: true
    }).catch(e => console.log(e));

    if (ticket.closed) return interaction.reply({
      content: client.locales.ticketAlreadyClosed,
      ephemeral: true
    }).catch(e => console.log(e));

    /*
    client.log("ticketClose", {
      user: {
        tag: interaction.user.tag,
        id: interaction.user.id,
        avatarURL: interaction.user.displayAvatarURL()
      },
      ticketId: ticket.id,
      ticketChannelId: interaction.channel.id,
      ticketCreatedAt: ticket.createdAt,
      reason: reason
    }, client);
    */

    await client.db.set(`tickets_${interaction.channel.id}.closed`, true);
    await client.db.set(`tickets_${interaction.channel.id}.closedBy`, interaction.user.id);
    await client.db.set(`tickets_${interaction.channel.id}.closedAt`, Date.now());

    if (reason) {
      await client.db.set(`tickets_${interaction.channel.id}.closeReason`, reason);
    } else {
      await client.db.set(`tickets_${interaction.channel.id}.closeReason`, client.locales.other.noReasonGiven);
    }

    const creator = await client.db.get(`tickets_${interaction.channel.id}.creator`);
    const invited = await client.db.get(`tickets_${interaction.channel.id}.invited`);

    interaction.channel.permissionOverwrites.edit(creator, {
      ViewChannel: false,
    }).catch(e => console.log(e));

    invited.forEach(async user => {
      interaction.channel.permissionOverwrites.edit(user, {
        ViewChannel: false,
      }).catch(e => console.log(e));
    });
    /*
    const row = new client.discord.ActionRowBuilder()
			.addComponents(
				new client.discord.ButtonBuilder()
					.setCustomId('deleteTicket')
					.setLabel(client.locales.other.deleteTicketButtonMSG)
					.setStyle(client.discord.ButtonStyle.Danger),
			);*/

    var CloserName = '<@'+interaction.user.id+'> ('+interaction.user.tag+')';
    if(interaction.user.nickname) CloserName = '<@'+interaction.user.id+'> ('+interaction.user.nickname+')';
    interaction.channel.send({
      embeds: [JSON.parse(JSON.stringify(client.locales.embeds.ticketClosed)
        .replace('TICKETCOUNT', ticket.id)
        .replace('REASON', reason.replace(/[\n\r]/g, '\\n'))
        .replace('CLOSERNAME', CloserName))],
      components: [] // [row]
    }).catch(e => console.log(e));

    await interaction.channel.messages.fetch()
    const messageId = await client.db.get(`tickets_${interaction.channel.id}.messageId`)
    const msg = interaction.channel.messages.cache.get(messageId);
    const embed = msg.embeds[0].data;

    interaction.reply({
      content: client.locales.ticketCreatingTranscript,
    }).catch(e => console.log(e));

    msg.components[0].components.map(x => {
      if (x.data.custom_id === 'close') x.data.disabled = true;
      if (x.data.custom_id === 'close_askReason') x.data.disabled = true;
    });

    msg.edit({
      content: msg.content,
      embeds: [embed],
      components: msg.components
    }).catch(e => console.log(e));

    async function close(res) {
      if (client.config.closeTicketCategoryId) interaction.channel.setParent(client.config.closeTicketCategoryId).catch(e => console.log(e));;
      
      var url_transcript = '';
      if(res.attachments && res.attachments.size > 0) {
        res.attachments.forEach(Attachment => {
          url_transcript = url+'?url='+Attachment.url;
        });
      }

      interaction.channel.send({
        content: client.locales.ticketTranscriptCreated.replace('TRANSCRIPTURL', `${url_transcript}`),
      }).catch(e => console.log(e));
      await client.db.set(`tickets_${interaction.channel.id}.transcriptURL`, `${url_transcript}`);
      const ticket = await client.db.get(`tickets_${interaction.channel.id}`);

      client.log("ticketClose", {
        user: {
          tag: interaction.user.tag,
          id: interaction.user.id,
          avatarURL: interaction.user.displayAvatarURL()
        },
        ticketId: ticket.id,
        ticketChannelId: interaction.channel.id,
        ticketCreatedAt: ticket.createdAt,
        ticketCreator: ticket.creator,
        reason: ticket.closeReason,
        categoria: ticket.category.name,
        transcriptURL: '[Ver Transcrição]('+url_transcript+')'
      }, client);

      const tiketClosedDMEmbed = new client.discord.EmbedBuilder()
        .setColor(client.embeds.ticketClosedDM.color ? client.embeds.ticketClosedDM.color : client.config.mainColor)
        .setDescription(
          client.embeds.ticketClosedDM.description
          .replace('TICKETCOUNT', ticket.id)
          .replace('TRANSCRIPTURL', `[Ver Transcrição](${url_transcript})`)
          .replace('REASON', ticket.closeReason)
          .replace('CLOSERNAME', CloserName)
        )
        .setFooter({
          text: client.embeds.ticketClosedDM.footer.text, // Please respect the LICENSE :D
          iconUrl: client.embeds.ticketClosedDM.footer.iconUrl
        });

      client.users.fetch(creator).then(user => {
        user.send({
          embeds: [tiketClosedDMEmbed]
        }).catch(e => console.log(e));
      });

      
      const {deleteTicket} = require("../utils/delete.js");
      deleteTicket(interaction, client);
      
    };

		let attachment = await discordTranscripts.createTranscript(interaction.channel, {
      returnType: 'attachment',
      fileName: 'transcript_'+ticket.id+'.html',
      minify: true,
      saveImages: true,
      useCDN: true,
      poweredBy: false
    });

    //https://tickettool.xyz/direct?url=

    let canal_transcript = await client.channels.fetch(client.config.logsTranscriptLog).catch(e => console.error("O canal de Logs do Transcript não foi encontrado!\n"));
    if(canal_transcript){
      await canal_transcript.send({
        files: [attachment]
      }).then(res => close(res)).catch(e => console.log(e));
    }
    
  }
};