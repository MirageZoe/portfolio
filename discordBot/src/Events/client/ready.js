const Event = require('../../Structures/Event');
const GuildConfig = require('../../Models/GuildSettings');
const roleMenuDocs = require("../../Models/roleMenuDocs");
const sendError = require("../../Models/Error")
require('dotenv').config()
module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			once: true
		});
	}

	run() {
		let myguilds = []
		this.client.guilds.cache.map((guild) => myguilds.push(` - ${guild.name} (${guild.id});`))
		console.log([
			`Logged in as ${this.client.user.tag} at date: ${this.client.utils.convertTime(Date.now(),false)}`,
			`Loaded ${this.client.commands.size} commands!`,
			`Loaded ${this.client.events.size} events!`,
			`Active in ${this.client.guilds.cache.size} guilds:\n${myguilds.join("\n")}`
		].join('\n'));

		const activities = [
			`UwU`,
			`with ${this.client.users.cache.size} people!`,
			`in ${this.client.guilds.cache.size} servers!`,
			'anime in Extalia',
			'with fire.',
			"with other people's dreams",
			`${this.client.channels.cache.size} channels!`,
			`${this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} users!`
		];

		let i = 0;
		setInterval(() => this.client.user.setActivity(`${this.client.prefix}help | ${activities[i++ % activities.length]}`, { type: 'WATCHING' }), 15000);
		
		this.client.emit(`multiSystem`)
		this.client.emit(`raffleSystem`)
		this.client.emit(`guildStreamCheck`)
		// setting up the guilds in database if they are not yet
		let arrayGuilds = [...this.client.guilds.cache.keys()]
		for (let i = 0; i < arrayGuilds.length; i++) {
			const guild_id = arrayGuilds[i];
			GuildConfig.findOne({
				ID: guild_id
			}, (err, res) =>{
				if (err) console.log(err);
				let thisGuildName = this.client.guilds.cache.find(x => x.id === guild_id).name;
				if (!res) {
					const newGuild = new GuildConfig({
						Guild_Name: thisGuildName,
						ID: guild_id,
					});
					this.client.prefixes.set(guild_id,`c!`)
					return newGuild.save().catch(err => console.log(`I couldn't log some guilds: \n\n${err}`))
				} else {
					this.client.prefixes.set(guild_id,res.prefix)
				}
			})
		}

		//invite tracker
		this.client.guilds.cache.forEach(guild =>{
			try {
				guild.invites.fetch().then(invites => {
					// this.client.GuildInvites.set(guild.id, [...invites.values()])
					invites = [...invites.values()]
					for (const i of invites) {
						let oldCache = this.client.GuildInvites.get(i.guild.id)
						if(!oldCache) {
							// console.log(`old cache for ${i.guild.name} is null, creating an empty one!`)
							oldCache = []
						}
						let inv = {
							id: i.guild.id,
							code: i.code,
							uses: i.uses,
							maxAge: i.maxAge,
							maxUses: i.maxUses,
							inviter: i.inviter,
							channel: i.channel,
							createdAt: i.createdTimestamp
						}
						if (!oldCache.find(oldInv => oldInv.code == i.code)) oldCache.push(inv)
						this.client.GuildInvites.set(i.guild.id,oldCache)
					}
				}).catch(err => {
					//  console.log(err)
					console.log(`[SHARURU-ERROR-INVITES]: It seems like I couldn't fetch "${guild.id} (${guild.name})" invites because I don't have permissions! Skipping...
ERR:${err.name}\n${err.method}:${err.path}\nCode:${err.httpStatus}`)
				});
			} catch (error) {
				console.log("[SHARURU-ERROR-INVITES]: I couldn't fetch at all anything! New method or function from discord js?")
				console.log(error)
			}
			

		//get impData for each guild
		let myData = this.client.impData.get(guild.id)
		if(!myData) myData = {}
		let highestRoleOrder = 0
		let highestRole = 0;
		for(let i = 0; i < guild.members.me._roles.length; i++){
			let getRolePos = guild.roles.cache.get(guild.members.me._roles[i]).position
			if (getRolePos > highestRoleOrder) {
				highestRoleOrder = getRolePos;
				highestRole = guild.members.me._roles[i]
			}
		}

		// console.log(guild)
		myData.totalRolesNumber = guild.members.me._roles.length;
		myData.highestRoleOrder = highestRoleOrder;
		myData.highestRole = highestRole;
		this.client.impData.set(guild.id,myData)
		console.log(`[impData: "${guild.name}"] I've found the highest role: ${highestRole}, Pos: ${highestRoleOrder}, # of roles: ${guild.members.me._roles.length}`)
		})

		//roleMenu
		roleMenuDocs.find({},async (err,res)=>{
			let clock = new Date();
			let ss = String(clock.getSeconds()).padStart(2, '0');
			let min = String(clock.getMinutes()).padStart(2, '0');
			let hrs = String(clock.getHours()).padStart(1, '0');
			clock = `${hrs}:${min}:${ss}`;

			let TheDate = new Date();
			let zilelesaptamanii = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
			let weekday = zilelesaptamanii[TheDate.getDay()];
			let dd = String(TheDate.getDate()).padStart(2, '0');
			let mon = String(TheDate.getMonth() + 1);
			let year = String(TheDate.getFullYear()).padStart(4, '00');
			TheDate = `${weekday}, ${mon}/${dd}/${year}`;
			let amORpm;
			if (hrs >= 0 && hrs <= 12) {
				amORpm = 'AM';
			} else {
				amORpm = 'PM';
			}
			if (err) {
				sendError.create({
					Guild_Name: `Can't retrieve guildName because it's in error  from the event.`,
					Guild_ID:  `Can't retrieve guildID because it's in error  from the event.`,
					User: `Can't retrieve user because it's in error  from the event.`,
					UserID: `Can't retrieve userid because it's in error  from the event.`,
					Error: err,
					Time: `${TheDate} || ${clock} ${amORpm}`,
					Command: `mute system => roleMenu system`,
					Args: `Can't retrieve args because it's in error  from the event.`,
				},async (err, res) => {
					if(err) {
						console.log(err)
					}
					if(res) {
						console.log(`successfully added error to database from mute system!`)    
					}
				})
			}
			if(res){
				for(let i = 0; i < res.length; i++){                        
					let menus = this.client.roleMenuData.get(res[i].group_guildID.toString())
					if (menus == undefined) menus = {}
					if(!menus.hasOwnProperty(res[i].group_channelID.toString())) menus[res[i].group_channelID.toString()] = []
					if (menus.hasOwnProperty(res[i].group_channelID.toString()) && !menus[res[i].group_channelID.toString()].find(msgid => msgid == res[i].group_messageID.toString())) menus[res[i].group_channelID.toString()].push(res[i].group_messageID.toString())
					this.client.roleMenuData.set(res[i].group_guildID.toString(),menus)
				}
			}
		})
		setInterval(() => {
			let msgs_to_delete = this.client.msgGarbageCollector;
			let array_with_ids = Array.from(msgs_to_delete.keys())
			// console.log(`printing some data:`)
			// console.log(msgs_to_delete,array_with_ids)
			if (array_with_ids.length > 0) {
				//console.log(`\n\n===================\n[Message-Garbage-Collector:${this.client.utils.convertTime(Date.now(),false)}]: Found about ${array_with_ids.length} messages to be deleted. Checking...`)
				for (let i = 0; i < array_with_ids.length; i++) {
					
					let get_a_msg = msgs_to_delete.get(array_with_ids[i])
					// console.log(`\nMessage id ${get_a_msg.messageID} is to expire on ${this.client.utils.convertTime(get_a_msg.expireDate,false)}!`)
					if (get_a_msg.expireDate < Date.now()) {
						let getGuildRef = this.client.guilds.cache.get(get_a_msg.guildID)
						let getChannelRef = getGuildRef.channels.cache.get(get_a_msg.channelID)
						let getMessageRef = getChannelRef.messages.cache.get(get_a_msg.messageID);
						if (getMessageRef != undefined || getMessageRef != null) {
							getMessageRef.delete()
							console.log(`\n\n===================\n[Message-Garbage-Collector::${this.client.utils.convertTime(Date.now(),false)}]: Deleted message with id ${get_a_msg.messageID}!(GID: ${get_a_msg.guildID} | CHID: ${get_a_msg.channelID} | Exp: ${this.client.utils.convertTime(get_a_msg.expireDate,false)})`)
							this.client.msgGarbageCollector.delete(array_with_ids[i])
						} else {
							console.log(`\n\n===================\n[Message-Garbage-Collector::${this.client.utils.convertTime(Date.now(),false)}]: Message id ${get_a_msg.messageID} (GID: ${get_a_msg.guildID} | CHID: ${get_a_msg.channelID}) couldn't be found anymore in cache. Deleting from registry...\n\n`)
							this.client.msgGarbageCollector.delete(array_with_ids[i])
						}
					} //else {
						// console.log(`This message, ${get_a_msg.messageID} is not yet ready to expire`)
					//}
				}
			} //else
				//console.log(`\n\n===================\n[Message-Garbage-Collector:${this.client.utils.convertTime(Date.now(),false)}]: No messages to delete.\n\n`)
		}, process.env.MESSAGE_DELETE_DELAY);
	}

};
