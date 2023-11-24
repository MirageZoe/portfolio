/* eslint-disable no-unused-vars */
const { MessageEmbed, Collection, PermissionsBitField } = require('discord.js');
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const hastebin = require("hastebin")
const fs = require('fs');
const ms = require('ms');
const SharuruEmbed = require('../../Structures/SharuruEmbed.js');


module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'purge',
			displaying: true,
			description: 'Delete messages. It can also delete an user messages only! ATTENTIONS: It cannot delete messages that are older than 2 weeks',
			options: '\n-\`no mention\` => delete all messages\n-\`@mention\` => delete mentioned user messages only!',
			usage: 'purge 20 => delete 20 messages in the chat',
			example: 'purge 20 @Bob => deletes 20 messages from the member called \`"Bob"\`',
			category: 'moderation',
			userPerms: [PermissionsBitField.Flags.ManageMessages],
			SharuruPerms: [PermissionsBitField.Flags.ManageMessages],
			args: false,
			guildOnly: true,
			ownerOnly: false,
			aliases: ['delete','del','remove']
		});
	}

	async run(message, args) {
		// eslint-disable-next-line id-length

        message.delete()
		var clock = new Date();
		var ss = String(clock.getSeconds()).padStart(2, '0');
		var min = String(clock.getMinutes()).padStart(2, '0');
		var hrs = String(clock.getHours()).padStart(1, '0');
		clock = `${hrs}:${min}:${ss}`;

		var TheDate = new Date();
		var zilelesaptamanii = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		var weekday = zilelesaptamanii[TheDate.getDay()];
		var dd = String(TheDate.getDate()).padStart(2, '0');
		var mon = String(TheDate.getMonth() + 1);
		var year = String(TheDate.getFullYear()).padStart(4, '00');
        TheDate = `${weekday}, ${mon}/${dd}/${year}`;
		let amORpm;
		if (hrs >= 0 && hrs <= 12) {
			amORpm = 'AM';
		} else {
			amORpm = 'PM';
        }
		const issuer = message.author;
        const logs = message.guild.channels.cache.find(channel => channel.name === 'sharuru-logs');
        const user = message.mentions.users.first();
        const CommandChannel = message.channel;
        const sharuru = this.client;
        let amount = parseInt(args[0]);
        let historyChat = []
        let whatIDid;

        if (isNaN(amount)) {
            return message.channel.send(`${issuer}, that doesn\'t seem to be a valid number.`);
        } else if (amount < 10 || amount > 100) { 
            return message.channel.send(`${issuer}, you need to specify a number between 10 and 100.`)
        };
        
        if (!logs) {
            return console.log('The **sharuru-logs** channel does not exist and I\'ll try to create it! If I can\'t do that for some reasons(I don\'t have permissions), please create a channel called \`sharuru-logs\`!')
        }
        if (message.guild.me.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS) && !logs) {
            try{
                guild.channels.create('sharuru-logs', {
                    type: 'text',
                    permissionOverwrites:[{
                        id: message.guild.id,
                        deny: ['VIEW_CHANNEL']
                    }]
                    })
                    .catch(console.error)
            }catch(e){
                message.channel.send(`I don't have enough permissions to make my logs channel or I couldn't find the channel if it was already made so check for spelling to be 'sharuru-logs'.`)
            }
        }
        try {
            if (!amount && !user) return message.channel.send(`${issuer}, must specify a user and amount, or just an amount to delete messages!`);
            CommandChannel.messages.fetch({
                limit: amount,
               }).then(async (messages) => {
                if (user) {
                    whatIDid = `deleted ${amount} messages from ${user} `;
                    const filterBy = user ? user.id : sharuru.user.id; //Client
                    messages = messages.filter(m => m.author.id === filterBy).array().slice(0, amount+1);
                        for(let msg in messages){
                            historyChat.push(`${messages[msg].author.username}#${messages[msg].author.discriminator} | ${this.client.utils.convertTime(messages[msg].createdTimestamp,false)}| ${messages[msg].content}\n`)
                        }
                }
                if(!user){
                    messages = [...messages.values()];//.slice(0, amount+1)
                    for(let msg in messages){
                        historyChat.push(`${messages[msg].author.username}#${messages[msg].author.discriminator} | ${this.client.utils.convertTime(messages[msg].createdTimestamp,false)}| ${messages[msg].content}\n`)
                    }
                    messages = amount
                    whatIDid = `deleted ${amount} messages`
                }
                for(let i = 0; i < Math.ceil(historyChat.length/2); i++){
                    let x = i;
                    x = historyChat[i];
                    historyChat[i] = historyChat[historyChat.length-1-i];
                    historyChat[historyChat.length-1-i] = x;
                    if(i == Math.ceil(historyChat.length/2)-1){
                        setTimeout(() => {
                        console.log(`done`)
                        historyChat = historyChat.join(``);
                        }, 200);
                    }
                }
                message.channel.bulkDelete(messages).catch(error => console.log(error.stack));

                setTimeout(() => {
                    hastebin.createPaste(historyChat,{
                        raw:false,
                        server: `http://sharurubins.ddns.net/`,
                        contentType: `txt`,
                    },{}).then(url=>{
                        let Delembed = new SharuruEmbed()
                        .setAuthor(`This is what happened:`, this.client.user.displayAvatarURL())
                        .setDescription(`A moderator deleted messages in <#${message.channel.id}>`)
                        .addField('Moderator that issued the command: ', `${issuer}`)
                        .addField('Date: ', `${clock} ${amORpm}`,true)
                        .addField(`Action:`,whatIDid)
                        .addField(`Link to the deleted messages:`,url)
                        .setColor(`#FFC0CB`);
                    logs.send({embeds: [Delembed] });
                    }).catch(err=>{
                        message.channel.send(`Unfortunately an error happened: ${err.message}`)
                        console.log(err)
                        let Delembed = new SharuruEmbed()
                        .setAuthor(`This is what happened:`, this.client.user.displayAvatarURL())
                        .setDescription(`A moderator deleted messages in <#${message.channel.id}>`)
                        .addField('Moderator that issued the command: ', `${issuer}`)
                        .addField('Date: ', `${clock} ${amORpm}`,true)
                        .addField(`Action:`,whatIDid)
                        .addField(`Link to the deleted messages:`,`Couldn't Reach SharuruBins`)
                        .setColor(`#FFC0CB`);
                        logs.send(`Since I had a problem while trying to reach Sharurubins, I have sent this here but without link. `)
                        logs.send({embeds: [Delembed] });
                    })
                }, 1000);
               });
        } catch (error) {
            sendError.create({
                Guild_Name: message.guild.name,
                Guild_ID: message.guild.id,
                User: issuer.tag,
                UserID: issuer.id,
                Error: error,
                Time: `${TheDate} || ${clock} ${amORpm}`,
                Command: this.name,
                Args: args,
            },async (err, res) => {
                if(err) {
                    console.log(err)
                    return message.channel.send(`Unfortunately an problem appeared in purge command. Please try again later. If this problem persist, contact my partner!`)
                }
                if(res) {
                    console.log(`successfully added error to database!`)
                }
            })
        }
        
	}
};
