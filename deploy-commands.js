const fs = require('node:fs');
const path = require('node:path');
const jsonc = require('jsonc');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const { token } = require('./config/token.json');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const { clientId, servidores } = jsonc.parse(fs.readFileSync(path.join(__dirname, 'config/config.jsonc'), 'utf8'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}


const rest = new REST({ version: '10' }).setToken(token);

module.exports = {
	async commandsServer(client) {
		for (const server of servidores) {
			const guild = await client.guilds.cache.get(server);
			if(guild){
				rest.put(Routes.applicationGuildCommands(clientId, server), { body: commands })
					.then(() => console.log('Todos os comandos foram registrados na aplicação com sucesso.'))
					.catch(console.error);
			}else{
				console.log("\n⚠️⚠️⚠️ Não foi registrado os commands no servidor: '"+server+"'. ⚠️⚠️⚠️");
			}
		}
	}
  };