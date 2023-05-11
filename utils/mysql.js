var mysql = require('mysql');
const { conexao, bancos } = require('../config/token.json');

var pool = mysql.createPool({
  connectionLimit : 10,
  host            : conexao[0],
  user            : conexao[1],
  password        : conexao[2],
  database        : conexao[3]
});

var exportardb;
var timeout_banco = 5;

setInterval(function(){
    if(timeout_banco > 0){
        timeout_banco--;
    }else{
        AtualizarDB();
        timeout_banco = 5*60;
    }
}, 1 * 1000);

async function AtualizarDB(){
    console.log('AtualizarDB()');
    pool.getConnection(async function(err, connection) {
        if(err){
            console.log('Erro no banco de dados: '+err);
        }else{
            if(connection != undefined){
                exportardb = [];
                bancos.forEach(async banco => {
                    //console.log('SELECT * from '+banco);
                    connection.query( 'SELECT * from '+banco, function(err2, rows) {
                        if(!err2){
                            exportardb.push({banco: banco, values: rows});
                        }
                    });
                });
            }
        }
    });
}

async function getUserIDPorDiscord(discord_id){
    if(exportardb && exportardb.length > 0){
        for (let dado of exportardb) {
            if(dado.banco === 'vrp_user_ids'){
                for (let value of dado.values) {
                    if(value.identifier.includes(discord_id)){
                        return parseInt(value.user_id);
                    }
                }
            }
        }
    }
    return false;
}

async function MySQL(query){
    if(query){
      pool.getConnection(function(err, connection) {
        if(connection !== undefined){
          if(err) console.log('MySQL Connection(): '+err);
          connection.query( query, function(err2, rows) {
            if(err2) console.log('MySQL(): '+query+' ERRO: '+err2);
          });
          connection.release();
          timeout_banco = 10;
        }
      });
    }
}

function tbl_userID(user_id){
    var tbl = {};
    if(exportardb && exportardb.length > 0){
        tbl.veiculos = [];
        tbl.registration = "N/A";
        tbl.telefone = "N/A";
        tbl.nome = "Sem";
        tbl.sobrenome = "Registro";
        tbl.idade = 0;
        for (let dado of exportardb) {
            for (let value of dado.values) {
                if(dado.banco === 'vrp_users'){
                    if(value.id == user_id){
                        if(value.id) tbl.user_id = value.id;
                        if(value.last_login) tbl.last_login = value.last_login;
                        if(value.ip) tbl.ip = value.ip;
                        if(value.whitelisted) tbl.whitelisted = value.whitelisted;
                        if(value.banned) tbl.banned = value.banned;
                    }
                }else if(dado.banco === 'vrp_user_data'){
                    if(value.user_id == user_id){
                        if(value.dkey.includes('datatable')){
                            tbl.datatable = JSON.parse(value.dvalue);
                            if(tbl.datatable){
                                if(tbl.datatable.groups) tbl.grupos = tbl.datatable.groups;
                                if(tbl.datatable.health) tbl.vida = tbl.datatable.health;
                                if(tbl.datatable.armour) tbl.colete = tbl.datatable.armour;
                                if(tbl.datatable.morto) tbl.morto = tbl.datatable.morto;
                                if(tbl.datatable.inventory) tbl.inventario = tbl.datatable.inventory;
                            }
                        }else if(value.dkey.includes('prisao')){
                            tbl.prisao = parseInt(value.dvalue);
                        }
                    }
                }else if(dado.banco === 'vrp_user_dinheiro'){
                    if(value.user_id == user_id){
                        if(value.carteira) tbl.carteira = value.carteira;
                        if(value.banco) tbl.banco = value.banco;
                    }
                }else if(dado.banco === 'vrp_user_identities'){
                    if(value.user_id == user_id){
                        if(value.registration) tbl.registration = value.registration;
                        if(value.phone) tbl.telefone = value.phone;
                        if(value.name) tbl.nome = value.name;
                        if(value.firstname) tbl.sobrenome = value.firstname;
                        if(value.age) tbl.idade = value.age;
                    }
                }else if(dado.banco === 'vrp_user_vehicles'){
                    if(value.user_id == user_id){
                        tbl.veiculos.push(value);
                    }
                }else if(dado.banco === 'vrp_user_ids'){
                    if(value.user_id == user_id){
                        if(value.identifier.includes('discord:')){
                            tbl.discord = value.identifier.replace("discord:", "");
                        }else if(value.identifier.includes('xbl:')){
                            tbl.xbl = value.identifier.replace("xbl:", "");
                        }else if(value.identifier.includes('license:')){
                            tbl.license = value.identifier.replace("license:", "");
                        }
                    }
                }
            }
        }
    }
    return tbl;
}

function GETcb_discord(){
    if(exportardb && exportardb.length > 0){
        for (let dado of exportardb) {
            if(dado.banco === 'cb_discord'){
                return JSON.parse(dado.values);
            }
        }
    }
    return false;
}

async function CargoIDByName(cargo_nome){
    var CargosDB = GETcb_discord();
    if(CargosDB){
        for (const cargo of CargosDB) {
            Object.keys(CargosDB).sort().forEach((key)=>{
                if(cargo_nome === key) return CargosDB[key];
            });
        }
    }
    return false;
}

module.exports = {
    async userid_discord(discord_id) {
        var user_id = await getUserIDPorDiscord(discord_id);
        if(user_id){
            return user_id;
        }
        return false;
    },
    async mysql_discord(discord_id) {
        var user_id = await getUserIDPorDiscord(discord_id);
        if(user_id){
            return tbl_userID(user_id);
        }
        return false;
    },
    async mysql_userid(user_id) {
        if(user_id){
            return tbl_userID(user_id);
        }
        return false;
    },
    async mysql_query(discord_id, QUERY) {
        var user_id = await getUserIDPorDiscord(discord_id);
        if(user_id){
            MySQL(QUERY.replace('USERID', user_id));
        }
        return false;
    },
    async mysql(query){
        if(query){
          pool.getConnection(function(err, connection) {
            if(connection !== undefined){
              if(err) console.log('MySQL Connection(): '+err);
              connection.query( query, function(err2, rows) {
                if(err2) console.log('MySQL(): '+query+' ERRO: '+err2);
              });
              connection.release();
              timeout_banco = 10;
            }
          });
        }
    },
    async AtualizarCalls(client){
        if (client.config.servidores && client.config.servidores.length > 0) {
            client.guilds.cache.forEach(guild => {
                guild.members.fetch();
                guild.channels.fetch();
                guild.roles.fetch();
            });
            for (const server of client.config.servidores) {
                var tabela = [];
                const list = await client.guilds.cache.get(server);
                if(list){
                    var canais = [];
                    const channels = await list.channels.cache.filter((c) => c.type === client.discord.ChannelType.GuildVoice);
                    for (const [canalID, canal] of channels) {
                        var membros = [];
                        if(canal.members.size > 0){
                            console.log(canal.name+': '+canal.members.size);
                            for (const [memberID, member] of canal.members) {
                                var userid = await getUserIDPorDiscord(member.id);
                                if(userid && parseInt(userid) > 0){
                                    membros.push({ discord: member.id, user_id: userid });
                                }
                            }
                            canais.push({ 
                                channel_id: canal.id,
                                channel_name: canal.name,
                                members: membros
                            });
                            
                        }
                    }
                    tabela.push({ guild: server, channels: canais });
                }
                await MySQL(`INSERT INTO cb_discord(servidor, config, time) VALUES('call_${server}', '${JSON.stringify(tabela)}', '${Math.floor(Date.now() / 1000)}') ON DUPLICATE KEY UPDATE config = '${JSON.stringify(tabela)}', time = '${Math.floor(Date.now() / 1000)}';`);
            }
        }
    },
    async AtualizarRoles(client){
        if (client.config.servidores && client.config.servidores.length > 0) {
            console.log('AtualizarRoles()');
            for (const server of client.config.servidores) {
                var tabela = [];
                const list = await client.guilds.cache.get(server);
                if(list){
                    var rolesdb = [];
                    const roles = list.roles.cache;
                    for (const [roleID, role] of roles) {
                        rolesdb.push({ 
                            role_id: role.id,
                            role_name: role.name,
                            color: role.hexColor
                        });
                    }
                    tabela.push({ guild: server, roles: rolesdb });
                }
                await MySQL(`INSERT INTO cb_discord(servidor, config, time) VALUES('roles_${server}', '${JSON.stringify(tabela)}', '${Math.floor(Date.now() / 1000)}') ON DUPLICATE KEY UPDATE config = '${JSON.stringify(tabela)}', time = '${Math.floor(Date.now() / 1000)}';`);
            }
        }
    },
    async AtualizarMembros(client){
        if (client.config.servidores && client.config.servidores.length > 0) {
            console.log('AtualizarMembros()');
            for (const server of client.config.servidores) {
                var tabela = [];
                const list = await client.guilds.cache.get(server);
                if(list){
                    var membersdb = [];
                    const members = await list.members.cache;
                    if(members){
                        for (const [memberID, member] of members) {
                            var userid = await getUserIDPorDiscord(member.id);
                            if(userid && parseInt(userid) > 0){
                                membersdb.push({ 
                                    discord: member.id, 
                                    user_id: userid,
                                    roles: member._roles
                                });
                            }
                        }
                    }
                    tabela.push({ guild: server, members: membersdb });
                }
                await MySQL(`INSERT INTO cb_discord(servidor, config, time) VALUES('members_${server}', '${JSON.stringify(tabela)}', '${Math.floor(Date.now() / 1000)}') ON DUPLICATE KEY UPDATE config = '${JSON.stringify(tabela)}', time = '${Math.floor(Date.now() / 1000)}';`);
            }
        }
    },
    async AtualizarMembrosDiscord(){
        if (client.config.servidores && client.config.servidores.length > 0) {
            console.log('AtualizarMembrosDiscord()');

            var CargosDB = GETcb_discord();
            for (const server of client.config.servidores) {
                const list = await client.guilds.cache.get(server);
                if(list){
                    
                }
            }
            
        }
    }
}