const readline = require('readline');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
    if (client.config.servidores && client.config.servidores.length > 0) {
      for (const server of client.config.servidores) {
        const guild = await client.guilds.cache.get(server);
        if(guild){
          await client.guilds.fetch(server)
          await client.guilds.cache.get(server).members.fetch()
          if (!client.guilds.cache.get(server).members.me.permissions.has("Administrator")) {
            console.log("\n⚠️⚠️⚠️ Não possui acesso administrativo no servidor: '"+server+"'. ⚠️⚠️⚠️");
          }
        }else{
          console.log("\n⚠️⚠️⚠️ Não está no servidor: '"+server+"'. ⚠️⚠️⚠️");
        }
      }
    }
    
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`🚀 Pronto! Logado como \x1b[37;46;1m${client.user.tag}\x1b[0m (\x1b[37;46;1m${client.user.id}\x1b[0m)\n🌟 Central do OSASCO SP\n`);
    
    console.log('Convite: https://discord.com/oauth2/authorize?client_id='+client.user.id+'&scope=bot&permissions=8')
  },
};
