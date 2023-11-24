/* eslint-disable no-unused-vars */
const SharuruEmbed = require("../../Structures/SharuruEmbed");
const suggestionDoc = require("../../Models/suggestion")
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const _ = require('lodash')
const fs = require('fs');
const ms = require('ms');
const { PermissionsBitField, Colors } = require('discord.js');


module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'suggestions',
			displaying: true,
			description: 'Send your suggestions to my partner and if my partner likes your suggestion, you will see it in future!',
			// options: '',
			usage: ' I want more coins!',
			// example: ' @bob because he told me that I\'m ugly',
			category: 'utilities',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
			guildOnly: true,
			ownerOnly: false,
			aliases: ['suggest']
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
		const issuer = message.author;

		let amORpm;
		if (hrs >= 0 && hrs <= 12) {
			amORpm = 'AM';
		} else {
			amORpm = 'PM';
        }
        const logs = message.guild.channels.cache.find(ch => ch.name === 'sharuru-logs')
        const myIdea = args.join(" ")
        suggestionDoc.find({
            id: issuer.id,
        },(err,res)=>{
            if(err){
                sendError.create({
                Guild_Name: message.guild.name,
                Guild_ID: message.guild.id,
                User: issuer.tag,
                UserID: issuer.id,
                Error: err,
                Time: `${TheDate} || ${clock} ${amORpm}`,
                Command: this.name,
                Args: args,
            },async (err, res) => {
                if(err) {
                    console.log(err)
                    logs.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                    return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                }
                if(res) {
                    console.log(`successfully added error to database!`)
                }
            })
            return
            }

            if(res){
                if(res.length >= 3) {
                    return message.channel.send(`${issuer}, You already suggested **3** ideas sent. Wait some time and try again later. After your ideas were accepted/rejected, you will be able to make more suggestions after that.`)
                }
                let addIdea = new suggestionDoc({
                    person: issuer.tag,
                    id: issuer.id,
                    guild: message.guild.id,
                    date: `on ${TheDate} at ${clock} ${amORpm}`,
                    suggestion: myIdea
                })
                addIdea.save().catch(err => console.log(err))
                let embed = new SharuruEmbed()
                .setAuthor({name:`Message Sent!`,iconURL: issuer.displayAvatarURL()})
                .setDescription(`Thank you for your suggestion!`)
                .setColor(Colors.LuminousVividPink)
                .setTimestamp()
                return message.channel.send({embeds: [embed]})
                
            }
        })
        

	}

};
