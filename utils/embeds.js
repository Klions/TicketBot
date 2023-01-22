module.exports = {
    async embedcustom(canal, Descricao, client) {
        if (!canal) return;
        if (!Descricao) return;
        const channel = await client.channels.fetch(canal).catch(e => console.error("The channel to log events is not found!\n", e));
        if (!channel) return console.error("The channel to log events is not found!");

        const embed = new client.discord.EmbedBuilder()
            .setColor(Descricao.cor)
            .setDescription(Descricao.texto);
        
        if(Descricao.reply){
            if(Descricao.mention && Descricao.mention.length > 2){
                Descricao.reply.reply({
                    content: '<@'+Descricao.mention+'>',
                    embeds: [embed]
                }).catch(e => console.log(e));
            }else{
                Descricao.reply.reply({
                    embeds: [embed]
                }).catch(e => console.log(e));
            }
        }else{
            if(Descricao.mention && Descricao.mention.length > 2){
                channel.send({
                    content: '<@'+Descricao.mention+'>',
                    embeds: [embed]
                }).catch(e => console.log(e));
            }else{
                channel.send({
                    embeds: [embed]
                }).catch(e => console.log(e));
            }
        }
        
    }
};