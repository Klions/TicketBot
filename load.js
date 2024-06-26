const fs = require('fs-extra');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { url, token } = require('./config/token.json');
const { QuickDB } = require('quick.db');
const jsonc = require('jsonc');
const db = new QuickDB();
var https = require('https');

var express = require('express');
var app     = express();

app.set('port', (process.env.PORT || 5001));

//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
	const urlget = request.query.url;
	if(urlget && urlget.length > 15 && urlget.includes('.html')){
		https.get(urlget, (res)=>{
			var rawHtml = '';
			res.on('data', (chunk) => { rawHtml += chunk; });
			res.on('end', () => {
				try {
					//console.log(rawHtml);
					response.send(rawHtml);
				} catch (e) {
					console.error(e.message);
				}
			});
		});
	}else{
		response.send('Aplicativo rodando normalmente.');
	}
}).listen(app.get('port'), function() {
    console.log('\n\nAplicação rodando na porta: ', app.get('port'));
});
/*
setInterval(function(){
	https.get(url, (res)=>{
		res.on("data", function(chunk) {
			console.log("ManterOnline()");
		});
  	});
}, 15 * 60 * 1000);
*/

process.on('unhandledRejection', (reason, promise, a) => {
  console.log(reason, promise, a)
})

process.stdout.write(`
\x1b[38;2;143;110;250m████████╗██╗ ██████╗██╗  ██╗███████╗████████╗    ██████╗  ██████╗ ████████╗
\x1b[38;2;157;101;254m╚══██╔══╝██║██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝    ██╔══██╗██╔═══██╗╚══██╔══╝
\x1b[38;2;172;90;255m   ██║   ██║██║     █████╔╝ █████╗     ██║       ██████╔╝██║   ██║   ██║   
\x1b[38;2;188;76;255m   ██║   ██║██║     ██╔═██╗ ██╔══╝     ██║       ██╔══██╗██║   ██║   ██║   
\x1b[38;2;205;54;255m   ██║   ██║╚██████╗██║  ██╗███████╗   ██║       ██████╔╝╚██████╔╝   ██║   
\x1b[38;2;222;0;255m   ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝       ╚═════╝  ╚═════╝    ╚═╝\x1b[0m

Conectando ao Discord...`)

const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildInvites,
	GatewayIntentBits.GuildVoiceStates,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent
] });

// All variables stored in the client object
client.db = db;
client.discord = require('discord.js');
client.config = jsonc.parse(fs.readFileSync(path.join(__dirname, 'config/config.jsonc'), 'utf8'));

var mysqlfile = require("./utils/mysql.js");
client.log = require("./utils/logs.js").log;
client.embedcustom = require("./utils/embeds.js").embedcustom;
client.update_ticket = require("./utils/update_ticket.js").update_ticket;
client.mysql_discord = mysqlfile.mysql_discord;
client.mysql_userid = mysqlfile.mysql_userid;
client.mysql_query = mysqlfile.mysql_query;
client.msToHm = function dhm (ms) {
  const days = Math.floor(ms / (24*60*60*1000));
  const daysms = ms % (24*60*60*1000);
  const hours = Math.floor(daysms / (60*60*1000));
  const hoursms = ms % (60*60*1000);
  const minutes = Math.floor(hoursms / (60*1000));
  const minutesms = ms % (60*1000);
  const sec = Math.floor(minutesms / 1000);

  if (days > 0) return `${days}d ${hours}h ${minutes}m ${sec}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${sec}s`;
  if (minutes > 0) return `${minutes}m ${sec}s`;
  if (sec > 0) return `${sec}s`;
  return "0s";
}

setInterval(async function(){
	await mysqlfile.AtualizarCalls(client);
}, 1 * 15 * 1000);

setTimeout(async function(){
	await mysqlfile.AtualizarRoles(client);
	await mysqlfile.AtualizarMembros(client);
}, 1 * 30 * 1000);
setInterval(async function(){
	await mysqlfile.AtualizarRoles(client);
	await mysqlfile.AtualizarMembros(client);
}, 10 * 60 * 1000);


// Command handler
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

// Execute commands
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute(interaction, client);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'Ocorreu um erro ao executar este comando!', ephemeral: true });
	}
});

// Event handler
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

// Login the bot
client.login(token);

var deploycmds = require('./deploy-commands.js');
deploycmds.commandsServer(client);