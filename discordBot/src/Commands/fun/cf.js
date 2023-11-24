/* eslint-disable no-unused-vars */
const SharuruEmbed = require('../../Structures/SharuruEmbed')
const Command = require('../../Structures/Command.js');
const profileSys = require("../../Models/profiles");
const sendError = require('../../Models/Error');
const fs = require('fs');
const ms = require('ms');
const config = require("../../../config.json")
const { PermissionsBitField } = require("discord.js")


module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'cf',
			displaying: true,
			cooldown: 1000,
			description: 'What\'s going to be? Cats? Tails? or maybe the most rare thing, Claws? Bet and win *(if the luck in on your side obviously...)*',
			options: '~',
			usage: '~',
			example: '~',
			category: 'fun',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
			guildOnly: true,
			staffRoleOnly: false,
			ownerOnly: true,
			roleDependable: '0', // not 0, either id or name
			allowTesters: true,
			aliases: [""]
		});
	}

	async run(message, args) {
		// eslint-disable-next-line id-length
		// if (!message.member.roles.cache.find(r => r.name === 'Disciplinary Committee')) return message.channel.send(`Command locked or it's in development`);

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
		const logChannel = message.guild.channels.cache.find(ch => ch.name == "sharuru-logs");
		const prefix = this.client.prefixes.get(message.guild.id);
        const myUtils = this.client.utils;

		let amORpm;
		if (hrs >= 0 && hrs <= 12) {
			amORpm = 'AM';
		} else {
			amORpm = 'PM';
		}

		let cf_embed = new SharuruEmbed()
			.setColor(`LUMINOUS_VIVID_PINK`)
			.setFooter(`Requested by ${issuer.tag}`)
			.setTitle(`The coin was thrown!`)

		let option = args[0]?.toLowerCase();
		let amount = Number(args[1]);
		const sides = [`cats`,`tails`];
		let coinImage = "";

		console.log(`test`)
		if (!option) {
			let coinDropped = sides[Math.floor(Math.random() * sides.length)]
			coinImage = `https://cdn.discordapp.com/attachments/768885595228864513/809106856417034260/cat_coin_face2.gif`
			if(coinDropped == 'tails')
				coinImage = `https://cdn.discordapp.com/attachments/768885595228864513/809106874334183484/cat_coin_tail.gif`
			cf_embed.setDescription(`${issuer} tossed a coin and it landed on:`)
			.setThumbnail(coinImage)
			return rep({embeds: [cf_embed]})
		}

		profileSys.findOne({
			userID: issuer.id
		},async(err,res)=>{
			if (err){
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
						return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
					}
					if(res) {
						console.log(`successfully added error to database!`)
					}
				})
			}
			if (res) {
				let userServersData = res.servers_data;
				// check if user has equal or more than the amount specified.
				if (amount > userServersData.get(message.guild.id).money) {
					cf_embed.setDescription(`Sadly you don't own **${amount} coin(s)**!
Currently have: **${userServersData.get(message.guild.id).money} coin(s)**
Needed: **${amount- userServersData.get(message.guild.id).money} coin(s)**`)
				return rep({embeds: [cf_embed]},"10s")
				}

				let coinDropped = percentageChance(['cats','claws','tails'], [46.5, 77, 46.5]);
				let luckyOrNot = percentageChance(['lucky','unlucky','nothing'], [15,15,70]);

				// if the user guessed the side
				if (coinDropped == option) {
					
				}
			}
		})


		
		//#region functions ready
		/**
         * 
         * @param {Object} msg The object option that can contain: contents (string msg only) or embeds
         * @param {String} deleteAfter Leave 0 to not be deleted after or specify a time in seconds in string format
         */
		 function rep(options,deleteAfter = "0s") {
			let thismsg;
			thismsg = message.channel.send(options)
			if (deleteAfter != "0s") {
				thismsg.then(m => {
					myUtils.mgoAdd(message.guild.id,message.channel.id,m.id,ms(deleteAfter))
				})
			}
		}
		function getRandomInt(min, max) {
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}

		function arrayShuffle(array) {
			for ( let i = 0, length = array.length, swap = 0, temp = ''; i < length; i++ ) {
			swap        = Math.floor(Math.random() * (i + 1));
			temp        = array[swap];
			array[swap] = array[i];
			array[i]    = temp;
			}
			return array;
		}
		function percentageChance(values, chances) {
			for ( var i = 0, pool = []; i < chances.length; i++ ) {
			for ( let i2 = 0; i2 < chances[i]; i2++ ) {
				pool.push(i);
			}
			}
			return values[arrayShuffle(pool)['0']];
		}
		function roundNumber(num, scale) {
			if(!("" + num).includes("e")) {
			  return +(Math.round(num + "e+" + scale)  + "e-" + scale);
			} else {
			  var arr = ("" + num).split("e");
			  var sig = ""
			  if(+arr[1] + scale > 0) {
				sig = "+";
			  }
			  return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
			}
		}
		//#endregion
	}

};
