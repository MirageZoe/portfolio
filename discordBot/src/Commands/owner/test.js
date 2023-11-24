/* eslint-disable no-unused-vars */
// const fourstarchar = require("../../Assets/genshin/zhongli_banner4Star.json");
const SharuruEmbed = require("../../Structures/SharuruEmbed");
const testdoc = require("../../Models/school/testdoc");
const ntb = require("../../Models/school/tb")
const Command = require('../../Structures/Command.js');
const giveaways = require('../../Models/giveaways.js');
// const genshin = require('../../Models/genshin');
const pms = require('pretty-ms');
const lodash = require("lodash");
const fetch = require('node-fetch')
const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const fs = require('fs');
const ms = require('ms');
const os = require('os');
const moment = require('moment');
const { PermissionsBitField, REST, Routes, AttachmentBuilder} = require("discord.js")
const { diffWordsWithSpace } = require('diff');
const imgProcessing = require("probe-image-size")
const { createCanvas, Image } = require("canvas")

// const testingmap = require("../../Models/testingmap");
const config = require("../../../config.json")

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'test',
			displaying: true,
            category: 'owner',
            userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			aliases: ['t'],
			args: false,
            guildOnly: true,
            ownerOnly: false,
		});
	}

	async run(message, args) {
		// eslint-disable-next-line id-length
		// if (!message.member.roles.cache.find(r => r.name === 'Disciplinary Committee')) return message.channel.send(`Command locked or it's in development`);

		//#region timeVars
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
		//#endregion
		
		//#region functions
		async function setMessageValue (_messageID, _targetedChannel) {
			let foundMessage = new String();
			
			// Check if the message contains only numbers (Beacause ID contains only numbers)
			if (!Number(_messageID)) return 'FAIL_ID=NAN';
		
			// Check if the Message with the targeted ID is found from the Discord.js API
			try {
				await Promise.all([_targetedChannel.messages.fetch(_messageID)]);
			} catch (error) {
				// Error: Message not found
				if (error.code == 10008) {
					console.error('Failed to find the message! Setting value to error message...');
					foundMessage = 'FAIL_ID';
				}
			} finally {
				// If the type of variable is string (Contains an error message inside) then just return the fail message.
				if (typeof foundMessage == 'string') return foundMessage;
				// Else if the type of the variable is not a string (beacause is an object with the message props) return back the targeted message object.
				return _targetedChannel.messages.fetch(_messageID);
			}
		}
		let arrayShuffle = function(array) {
			for ( let i = 0, length = array.length, swap = 0, temp = ''; i < length; i++ ) {
			swap        = Math.floor(Math.random() * (i + 1));
			temp        = array[swap];
			array[swap] = array[i];
			array[i]    = temp;
			}
			return array;
		};
		let percentageChance = function(values, chances) {
			for ( var i = 0, pool = []; i < chances.length; i++ ) {
			for ( let i2 = 0; i2 < chances[i]; i2++ ) {
				pool.push(i);
			}
			}
			return values[arrayShuffle(pool)['0']];
		};
		function getRandomInt(min, max) {
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}
		function indexOfEnd(string, search) {
			var io = string.indexOf(search);
			return io == -1 ? -1 : io + search.length;
		}
		/**
		 * 
		 * @param {String} userInput The input of the user.
		 * @param {[]} checkfor The items to check, based on condition, what the user input
		 * @param {String} condition The conditions to check for:
		 * 
		 * - 'includes' => checks if the user input is included in one of the following items in the "checkfor" array. Returns true/false
		 * - 'same' => checks if the user input is the same as one of the following items in the 'checkfor' array. Returns true/false
		 * - 'returnOne' => checks if the user input is in the array of items 'checkfor'. If yes, returns that item, otherwise null.
		 * @returns Results based on the condition.
		 */
		function checkForItems(userInput,checkfor,condition) {
			if(userInput.length == 0 || checkfor.length == 0) return 0
			if(condition == 'includes') {
				let notContain = false;
				for (const item of checkfor) {
					if(userInput.includes(item)) notContain = true;	
				}
				return notContain
			}
			if(condition == 'same'){
				let sameItem = false;
				sameLoop: for (let i = 0; i < checkfor.length; i++) {
					const item = checkfor[i].toLowerCase();
					if(userInput.toLowerCase() == item) {
						sameItem = true;
						break sameLoop;
					} 
				}
				return sameItem
			}
			if(condition == 'returnOne') {
				sameLoop: for (let i = 0; i < checkfor.length; i++) {
					const item = checkfor[i];
					if(userInput == item) {
						console.log(`found: ${item}`)
						if (item == 'true' || item == 'yes' || item == '1') return true;
						if (item == 'false' || item == 'no' || item == '0') return false;
						return item;
					} 
				}
				return null
			}
		}
		//#endregion
        let myarray = this.client.teamaker;
        if (args[0] == 'c') {
			// console.log(message.guild.members.me.permissions.toArray())
			// if (message.mentions.users.size > 0) 
			// {
			// 	// console.log(message.mentions.users)
			// 	let usersMentioned = new Map();
			// 	let usersKeys = [];
			// 	let userReport= ``;
			// 	/** check if the same user has been mentioned multiple times by using the find function on the message string
			// 	 * to do that first:
			// 	 * - create a map in which u add each mentioned user  
			// 	 * - go through the string and for each user in the map, record how many times they were mentioned
			// 	 * - make it nice
			// 	 */
			// 	//#region create a map to add each mentioned user & setup to 0 mentions so far
			// 	message.mentions.users.forEach(mem => {
			// 		let keyName = `<@${mem.id}>`
			// 		usersMentioned.set(keyName,0)
			// 		usersKeys.push(keyName)
			// 	});
			// 	//#endregion

			// 	//#region go through the string and for each user in the map, record how many times they were mentioned & look nice
			// 	for (let i = 0; i < usersKeys.length; i++) {
			// 		const regex = new RegExp(usersKeys[i],"gi");
					
			// 		let howManyMentions = message.content.match(regex)?.length;
			// 		usersMentioned.set(usersKeys[i],howManyMentions);
			// 		userReport += `- ${usersKeys[i]}: ${usersMentioned.get(usersKeys[i])} times;\n`
			// 	}
			// 	//#endregion
			// 	console.log(usersMentioned)
			// 	console.log(usersKeys)
			// 	let reportEmbed = new SharuruEmbed()
			// 	.setAuthor({name: "Mention spam report:"})
			// 	.setColor(`Random`)
			// 	.setDescription(`So far I've detected the following members being mentioned multiple times:\n${userReport}`)
			// 	message.channel.send({embeds: [reportEmbed]})
			// }

			const aVar = 1
			const newDurationConvertedToMilliseconds = ms(`${aVar}d`)//
			const startTime = 1698221327493
			const endTime = startTime + newDurationConvertedToMilliseconds
			const baseStartDateObj = new Date(startTime)
			const baseEndDateObj = new Date(endTime)
			const optionsDate = {
				hour12: true,
				day: 'numeric',
				month: 'long',
				year: 'numeric',
				hour: "2-digit",
				minute: '2-digit'
			}
			
			console.log(`new duration: ${newDurationConvertedToMilliseconds} (${aVar} days)
start time: ${startTime} (${new Intl.DateTimeFormat("en",optionsDate).format(baseStartDateObj)})
end time:   ${endTime} (${new Intl.DateTimeFormat("en",optionsDate).format(baseEndDateObj)})`)





			//fs.readFileSync(path.join(__dirname+`../../../Assets/events/halloween/other/temp.png`))
			// const testfile = fs.readFileSync(path.join(__dirname+`../../../Assets/events/halloween/other/temp.png`))
			// console.log(path.join(__dirname+`../../../Assets/events/halloween`))//imageProcessing.sync(test)
			// const rarity = 'collection'
			// const name = "[Ailinn-Lein] Twin Kitties.jpg"
			// const rar2 = "common"
			// const name2 = "[AudioBeatZz] Lisa.PNG"
			// const tempImg = fs.readFileSync(path.join(__dirname+`../../../Assets/events/halloween/${rarity}/${name}`))
			// const tempImg2 = fs.readFileSync(path.join(__dirname+`../../../Assets/events/halloween/${rar2}/${name2}`))
			// const tempAttach = new AttachmentBuilder(tempImg,{name: "image.png"})
			// const tempAttach2 = new AttachmentBuilder(tempImg2,{name: "image2.png"})

			// const tempEmbed = new SharuruEmbed()
			// 	.setImage(`attachment://image.png`)
			// 	.setDescription(`original msg`)
			// message.channel.send({embeds: [tempEmbed],files: [tempAttach]}).then(msg =>{
			// 	setTimeout(() => {
			// 		const tempEmbed2 = new SharuruEmbed()
			// 			.setImage(`attachment://image2.png`)
			// 			.setDescription(`edited later with modified attachments`)
			// 		msg.edit({embeds: [tempEmbed2], files: [tempAttach2]})
			// 	}, 5000);
			// })

			// const searchInverted = fs.existsSync(path.join(__dirname+`../../../Assets/events/halloween/evil/${rarity}/${name}`)) 
			// if (!searchInverted)
			// {
			// 	const tempImg = fs.readFileSync(path.join(__dirname+`../../../Assets/events/halloween/${rarity}/${name}`)) 
			// 	const tempImgData = imgProcessing.sync(tempImg)

			// 	const loadMyImg = new Image()
			// 	loadMyImg.src = tempImg
				
			// 	const canvasInverted = createCanvas(tempImgData.width,tempImgData.height)
			// 	const ctx = canvasInverted.getContext("2d");
				
			// 	ctx.drawImage(loadMyImg,0,0)
			// 	const imgData = ctx.getImageData(0,0,tempImgData.width,tempImgData.height)
				
			// 	for(let i = 0; i < imgData.data.length; i += 4)
			// 	{
			// 		imgData.data[i] = 255-imgData.data[i];
			// 		imgData.data[i+1] = 255-imgData.data[i+1];
			// 		imgData.data[i+2] = 255-imgData.data[i+2];
			// 		imgData.data[i+3] = 255;
			// 	}
			// 	ctx.putImageData(imgData,0,0)

			// 	// Write the image to file & upload as attachment for discord
			// 	const buffer = canvasInverted.toBuffer("image/png");
			// 	fs.writeFileSync(path.join(__dirname+`../../../Assets/events/halloween/evil/${rarity}/${name}`), buffer);
			// } else console.log(`test: file exists already!`)
			console.log(`done process!`)

			return;
			let rulesResponsibility = new SharuruEmbed()
				.setColor("Random")
				.setDescription(`
# <:zed_line:1134446331881082961> **Responsibility** <:zed_line:1134446331881082961>

- <:primo:978605379384651786> If you want to report a member for breaking the rules, ping an online staff member or open a ticket with ModMail!

- <:primo:978605379384651786> You're responsible for your own personal information! Sharing or disclosing personal information is up to you. However, we strongly
suggest each member to be cautious whenever they share such information online.

- <:primo:978605379384651786> Since staff are also people, we cannot monitor 24/7 all the content/exchanges/discussions shared on the server. As such, some explicit/toxic or unacceptable content may not be removed immediately.

- <:primo:978605379384651786> Anything that happens outside the server is not within our jurisdiction.
`)

			let rulesUserBehavior = new SharuruEmbed()
				.setColor("Random")
				.setDescription(`
# <:zed_line:1134446331881082961> **User Behavior** <:zed_line:1134446331881082961>

- <:primo:978605379384651786> __Respect yourself and others__. *Doxxing, racism, sexism, bullying or __**any form of discrimination**__ will not be tolerated. If a member asks you to stop what you're saying/doing to them, please respect that.*

- <:primo:978605379384651786> __Catfishing and any sort of fake identity is forbidden__. Imitating staff or being someone who you're not, is not allowed (Especially if used to take advantage of others).

- <:primo:978605379384651786> __Try your best to keep the chat free of spam (shortly: do not spam)__. Try to keep it to 6 consecutive messages max, there may be exceptions to the spam rule when providing advice, or a list of things with intent to help other members.
Includes caps (excessive), images, links, mass pinging, line breaking, copy pasta, etc. __Ear-raping in VCs or being obnoxious is considered spam__.
`)

			let rulesCommunity = new SharuruEmbed()
				.setColor("Random")
				.setDescription(`
# <:zed_line:1134446331881082961> **Community Rules** <:zed_line:1134446331881082961>

- <:primo:978605379384651786> By joining this server, __you abide by the [**[Discord ToS]**](https://discord.com/terms), [**[Guidelines]**](https://discordapp.com/guidelines), [**[Hoyoverse's ToS]**](https://genshin.hoyoverse.com/en/company/terms) & lastly [**[Zederyx's Server Rules (these)]**](https://discord.gg/zederyx)__!
 - *Some terms of service from Hoyoverse: No leaks (any kind, old/new/reference), mentioning account trading, selling, buying and modifying game files.*
 - *Some terms of service from Discord: No client modification or user under the minimum age of 13.*
 - ***Breaching this rule will have severe consequences.***

- <:primo:978605379384651786> Please __avoid divisive and controversial topics such as__:
 - *__politics__;*
 - *__religion (especially insulting ones)__;*
 - *__public figures (Andrew Tate, etc)__;*
 - *__other sensitive topics as well as excessively vulgar language.__* 
 *The discussion of these topics tends to create unwanted drama which is not welcome here. It is also a Genshin themed, content creator server for Zederyx, NOT a controversial topic server.*

- <:primo:978605379384651786> __No self promotion allowed without staff permission__. 
 - *Do not peddle your wares here (Server invites, social media, invite rewards, etc) & it extends to DMs.*

- <:primo:978605379384651786> __Use the appropriate channels__. 
 - *Each channel has it's own topics and rules which can be found in pins/description.*

- <:primo:978605379384651786> __No NSFW material__. 
 - *What you send/show, your profile (avatar, username & bio) in the server __must be SFW__!* 

- <:primo:978605379384651786> __Alternative accounts are not allowed under any circumstance__. 
 - *(It can be potentially used to evade bans/mutes & abuse economy)* 

- <:primo:978605379384651786> __Do not mini-mod and attempt to handle a situation you are not meant to handle__. 
 - Discriminating against staff members, acting on behalf of staff members, and/or making decisions on behalf of the community is not allowed. If there is someone causing trouble, contact a staff member.

- <:primo:978605379384651786> __No begging for wishes, primos or accounts__. 
 - Just because Zed is a whale and gives away welkins does NOT mean that he will purchase you one, or whale on your account. Do not ask others for their account either, as this is HIGHLY against Hoyoverse ToS (look above for them).

- <:primo:978605379384651786> __Swearing is acceptable, just keep it to a minimum__. 
 - Slurs and other derogatory terms are NOT acceptable here, excuses of "I didn't know" is not an excuse and NEVER will be tolerated.

- <:primo:978605379384651786> __Abuse of pinging staff members__ without a reason will result in punishment.
`)

			let sideNotes = new SharuruEmbed()
				.setColor("Random")
				.setDescription(`
# <:zed_line:1134446331881082961> **Keep in mind** <:zed_line:1134446331881082961>

- <:primo:978605379384651786> Although the server encourages you to freely express yourself, please do not use such freedom as an excuse to disrespect, discriminate, or attack any member in the server.

- <:primo:978605379384651786> We reserve the right to take the necessary action, immediately without warning, if you are found to be harmful to the community!

- <:primo:978605379384651786> If we ask you to stop at one point in whatever you are doing, __please obey and heed the warnings or instructions given by our staff members__. Don't make us repeat a second time.

- <:primo:978605379384651786> __Complaints about the server__ or anything else can be resolved by creating a ticket and waiting for the response from our staff members.

- <:primo:978605379384651786> __Please do not take at heart the actions of any moderator__, as they are doing their job of enforcing the server rules & making sure the server is safe for everyone!

- <:primo:978605379384651786> Lastly, have fun & do not be a douche! We are trying to make this community a good place for everyone where they can have an equally enjoyable experience~

## Rules History:
- Effective since: <t:1691132880> (<t:1691132880:R>)
- Updated on: <t:1691132880> (<t:1691132880:R>)

### Please react to this message with the emote below to verify that you have read the rules and agree to them, this will grant access to the rest of the server!
`)
			//#region giveaway with chances and modifiers
			// console.log(`starting`)
			// let giveawayPeople = [
			// 	{
			// 		userId: "1",
			// 		name: "yue",
			// 		roles: ["0",'7','8']
			// 	},
			// 	{
			// 		userId: "2",
			// 		name: "nadia",
			// 		roles: ['0',"7",'8','9']
			// 	},
			// 	{
			// 		userId: "3",
			// 		name: "drako",
			// 		roles: ['0','7','8','9']
			// 	},
			// 	{
			// 		userId: "4",
			// 		name: "zephy",
			// 		roles: ['0','5']
			// 	},
			// 	{
			// 		userId: "5",
			// 		name: "monstertruck",
			// 		roles: ['0','3']
			// 	},
			// 	{
			// 		userId: "6",
			// 		name: "gwem",
			// 		roles: ['0','4','8']
			// 	},
			// 	{
			// 		userId: "7",
			// 		name: "rikka",
			// 		roles: ['0','6','8']
			// 	},
			// 	{
			// 		userId: "8",
			// 		name: "new User",
			// 		roles: ['0','1']
			// 	},
			// 	{
			// 		userId: "9",
			// 		name: "new User 2",
			// 		roles: ['0']
			// 	}
			// ]
			// let poolModifiedRolesData = [
			// 	{
			// 		bonus_role: "1",
			// 		bonus_type: "times",
			// 		bonus_value: 1
			// 	},
			// 	{
			// 		bonus_role: "2",
			// 		bonus_type: "times",
			// 		bonus_value: 2
			// 	},
			// 	{
			// 		bonus_role: "3",
			// 		bonus_type: "times",
			// 		bonus_value: 3
			// 	},
			// 	{
			// 		bonus_role: "4",
			// 		bonus_type: "times",
			// 		bonus_value: 4
			// 	},
			// 	{
			// 		bonus_role: "5",
			// 		bonus_type: "times",
			// 		bonus_value: 5
			// 	},
			// 	{
			// 		bonus_role: "6",
			// 		bonus_type: "times",
			// 		bonus_value: 6
			// 	},
			// 	{
			// 		bonus_role: "7",
			// 		bonus_type: "times",
			// 		bonus_value: 7
			// 	},
			// 	{
			// 		bonus_role: "8",//yt
			// 		bonus_type: "times",
			// 		bonus_value: 1
			// 	},
			// 	{
			// 		bonus_role: "9",//disc
			// 		bonus_type: "times",
			// 		bonus_value: 1
			// 	},
			// ]
			// let poolModifiedRolesOnly = poolModifiedRolesData.map(item => item.bonus_role)
			// let poolPeople = []
			// let poolChances = []
			// let winnerList = []
			// let getWinners = true;
			// let winnersSelected = 0;
			// const winnersToGet = 3;

			// //processing them
			// for (let i = 0; i < giveawayPeople.length; i++) {
			// 	const element = giveawayPeople[i];
			// 	let isNormalUser = true;
			// 	console.log(`[RaffleSys]: checking ${element.name} roles...`)

			// 	// verify if user contains any role from modified ones, if yes, add the bonus based on type in poolChances
			// 	element.roles.forEach(userRole => {
			// 		// if we found a role that was modified, we add it using the percentages
			// 		if (checkForItems(userRole,poolModifiedRolesOnly,"same")) {

			// 			//get data of the role and turn off the user from being a normal one
			// 			let getRoleData = poolModifiedRolesData[poolModifiedRolesData.findIndex(idRole => idRole.bonus_role == userRole)]
			// 			isNormalUser = false;

			// 			// if the user has percentage
			// 			if (getRoleData.bonus_type == "percentage") {
			// 				console.log(`[RaffleSys]: ${element.name} owns "${getRoleData.bonus_role}" & got 50+${getRoleData.bonus_value}=${50+getRoleData.bonus_value}% to win!`)
			// 				poolPeople.push(element.userId)
			// 				poolChances.push(50+getRoleData.bonus_value)
			// 			}

			// 			if (getRoleData.bonus_type == "times") {
			// 				console.log(`[RaffleSys]: ${element.name} owns "${getRoleData.bonus_role}" & got an additional ${getRoleData.bonus_value} entries!`)
			// 				for (let j = 0; j < getRoleData.bonus_value; j++) {
			// 					poolPeople.push(element.userId)
			// 					poolChances.push(50)
			// 				}
			// 			}
			// 		}
			// 	});
			// 	if (isNormalUser) {
			// 		console.log(`[RaffleSys]: ${element.name} got 1 entry because normal user!`)
			// 		poolPeople.push(element.userId)
			// 		poolChances.push(50)
			// 	}
			// }

			// console.log(`Total Length: ${poolPeople.length}`,poolPeople,`Total Length: ${poolChances.length}`,poolChances)

			// while (getWinners) {

			// 	// check if we got enough winners
			// 	if (winnersSelected == winnersToGet) 
			// 	{

			// 		getWinners = false;
			// 		console.log(`[RaffleSys]: End of extraction of winners! Here are the winners:`)
			// 		console.log(winnerList)
			// 		console.log(`================================================================`)
			// 	}
				
			// 	// get our winners & create the userObj
			// 	let chosenOne = percentageChance(poolPeople,poolChances);
			// 	let indexOfWinner = giveawayPeople.findIndex(item => item.userId == chosenOne)
			// 	let userObjWinner = {
			// 		id: giveawayPeople[indexOfWinner].userId,
			// 		name: giveawayPeople[indexOfWinner].name,
			// 	}
			// 	console.log(`[RaffleSys]: Possible winner: ${userObjWinner.name}`)

			// 	// add our winner if they are not already inside
			// 	let wasAlreadyAddedIndex = winnerList.findIndex(item => item.id == userObjWinner.id)
			// 	if (winnerList[wasAlreadyAddedIndex] == null)
			// 	{
			// 		winnerList.push(userObjWinner);
			// 		winnersSelected++;
			// 		console.log(`[RaffleSys]: ${userObjWinner.name} was picked!`)
			// 	}
			// }
			//#endregion

			//#region possible way to get the UID from channel but do not use it a lot bcs it may be API spam
			// message.channel.messages.fetch().then(msgs =>{
			// 	let myMsgsIds = [...msgs.keys()]
			// 	console.log(`working`)
			// 	console.log(msgs.get(myMsgsIds))

			// 	for (let i = 0; i < myMsgsIds.length; i++) {
			// 		const userId = msgs.get(myMsgsIds[i]).author.id;
			// 		const userName = msgs.get(myMsgsIds[i]).author.username;
			// 		const userUID = msgs.get(myMsgsIds[i]).content;

			// 		console.log(`Entry: ${userName}#${userId}: UID-${userUID}`)
			// 	}
			// 	console.log(`finished`)
			// })
			// console.log(`done`)
			//#endregion
        	
			message.channel.send({embeds: [rulesResponsibility, rulesCommunity]})
			setTimeout(() => {
			message.channel.send({embeds: [rulesUserBehavior, sideNotes]})
			}, 1000);
			// message.channel.messages.fetch("1134474426327511060").then(msg =>{
			// 	msg.edit({embeds: [rulesResponsibility, rulesCommunity, rulesUserBehavior, sideNotes]})
			// })
			//message.channel.send({embeds: [rulesResponsibility, rulesCommunity, rulesUserBehavior, sideNotes]})
			return
			let doneContinuing = false;
			while (!doneContinuing) {
                await message.channel.send(`Please add numbers`).then(async (FirstPhase) => {
                    let filter = m => m.content
                    await message.channel.awaitMessages(filter, {
                        max: 1,
                        time: 30000
                    }).then(async (SecondPhase) => {
                        if (SecondPhase.first()) {
							if(SecondPhase.first().content == 'stop'){
								doneContinuing = true;
								let min= 0;
								let max = 0
								for (let i = 1; i < numbers.length; i++) {
									if(numbers[i] > max)
										max = numbers[i];
									else
									if(numbers[i] < min)
										min = numbers[i];
								}
								return console.log(min,max)
							} else {
								numbers.push(Number(SecondPhase.first().content))
							}
                            
                        }
                    })
                })
            }
			// console.log(reverse(str))
			// console.log(pms(5560261))
			// this.client.impData.set(`twitchA`,`lj76wvortkbznvc5egiugdpwn4ouop`)
			// setTimeout(() => {
			// console.log(this.client.impData)
			if(args[1] == 'id'){
				fetch(`https://api.twitch.tv/helix/users?login=${args[2]}`, {
					method: 'GET',
					headers: {
						'Client-ID': client_id,
						'Authorization': 'Bearer' + ' lj76wvortkbznvc5egiugdpwn4ouop'
					}
				})
				.then(res => res.json())
				.then(res => {
					let myData = res[`data`][0]
					let embed = new SharuruEmbed()
						.setAuthor(`Streamer: ${myData.display_name}`,`https://cdn.discordapp.com/attachments/768885595228864513/804839366819577866/1593628073916.png`)
						.setColor(`RANDOM`)
						.setDescription([
							`**Streamer ID:** ${myData.id}`,
							`${myData.broadcaster_type ? `**Affiliated/Partner?:** ${this.client.utils.capitalise(myData.broadcaster_type)}` : ``}`,
							`**Description**: ${myData.description ? myData.description : `None`}`,
							`**Viewers count:** ${myData.view_count}`,
						])
						.setFooter(`Requested by ${issuer.tag} at `)
						.setTimestamp()
						.setThumbnail(myData.profile_image_url)
					message.channel.send(embed)
				});
				return 
			}
			if(args[1] == 'live'){
				fetch(`https://api.twitch.tv/helix/search/channels?query=${args[2]}`, {
					method: 'GET',
					headers: {
						'Client-ID': client_id,
						'Authorization': 'Bearer' + ' lj76wvortkbznvc5egiugdpwn4ouop'
					}
				})
				 .then(res => res.json())
				 .then(res => {
					let myData = res[`data`].filter(obj => obj.display_name == args[2])
					myData = myData[0]
					fetch(`https://api.twitch.tv/helix/games?id=${myData.game_id}`,{
						method: 'GET',
						headers: {
							'Client-ID': client_id,
							'Authorization': 'Bearer' + ' lj76wvortkbznvc5egiugdpwn4ouop'
						}
					}).then(res2 => res2.json())
					.then(res2 =>{
						let gameData = res2[`data`][0]
						// console.log(myData)
						let embed = new SharuruEmbed()
						 .setAuthor(`Streamer: ${this.client.utils.capitalise(myData.display_name)}`,`https://cdn.discordapp.com/attachments/768885595228864513/804839366819577866/1593628073916.png`)
						 .setThumbnail(myData.thumbnail_url)
						 .setFooter(`Requested by ${issuer.tag} at`, issuer.displayAvatarURL())
						 .setTimestamp()
						 .setColor(myData.is_live ? `RED` : `GRAY`)
						 .setDescription([
							`${myData.is_live ? `🔴` : `🌑`} ${this.client.utils.capitalise(myData.display_name)} is currently ${myData.is_live ? `**live on [Twitch](https://www.twitch.tv/${myData.display_name})**!` : `**not live.**`}`,
							`${myData.is_live ? `**They are streaming:** ${gameData.name}!\n**Title:** ${myData.title}\n**Started at:** ${new Date().toLocaleString('en-US')}` : `🎲 Last time they were streaming **${gameData.name}**!\n❓ You can [click here](https://www.twitch.tv/${myData.display_name}) to view ${this.client.utils.capitalise(myData.display_name)}'s channel and click on **follow** to view more awesome content!`}`,
						 ])
						 message.channel.send(embed)
					})
				 });
			}
			// }, 500);
			return 
			let guildID = message.guild.id
			let userID = args[1]
			fetchit(`https://id.twitch.tv/oauth2/token?client_id=${client_id}&client_secret=${client_secret}&grant_type=client_credentials`,{
				method: 'POST'
			}).then(res => res.json())
			.then(res => {
				console.log(res)
			});
			// let nr = 0;
			//======================================================
			//==========HOW TO FETCH ALL MESSAGES OF A USER=========
			//=======================ATTENTION======================
			//================THIS IS API SPAM UNLESS==============
			//================TALK WITH DISCORD SUPPORT============
			//=-====================================================
			// async function lots_of_messages_getter(limit,userID) {
			// 	let channels = message.guild.channels.cache
			// 	let thingy = true
			// 	let allmsgs
			// 	for(let ch of channels){
			// 		if(ch[1].type == `text`){
			// 			while (thingy == true){
			// 				ch[1].messages.fetch({limit: 100}).then(msg=>{
			// 					const msgs = msg.filter(m => m.author.id === userID)
			// 					for(let x of msgs){
			// 						nr++
			// 					console.log(`[${nr}] [${x[1].channel.name}] || Author: ${x[1].author.username}, Msg: ${x[1].content}`)
			// 					}
			// 					// console.log(msgs)
			// 				})
			// 			}	
			// 		}
			// 	}
			// }
			// console.log(`[${nr}] Author: ${msg.author.username}, Msg: ${msg.content}`)

			return //lots_of_messages_getter(500,args[1]) //userMessages(guildID,userID,this.client) //console.log(`All messages of ${userID}: ${allmsgs.length}`)

		}
		if (args[0] == 'vot'){
			function ucn(number) {
				let p = number;
				let a = 0;
				let b = 0;
				while (p % 2 == 0){
					a = a+1;
					p = p/2;
				}
				while (p % 5 == 0){
					b = b+1;
					p = p/5;
				}
				let c = p % 10;
				if(a == b) return console.log(`c= ${c}`);
				else 
					if(a<b) return console.log(`5`);
				else {
					for(let i = 1; i < (a-b) % 4; i++){
						c=2*c;
					}
					return console.log("a > b: "+(6 * c) % 10);
				}
			}
			return console.log(ucn(args[1]))
		}
		function abbreviateNumber(value) {
			let newValue = `${value}`;
			let returnThis = ``
			console.log(newValue)
			if(value > 999999999){
				console.log(`o7`)
				returnThis = newValue.substring(0,1)+" billion";
			}else if(value > 99999999){
				console.log(`o6`)
				returnThis = newValue.substring(0,3)+" million"
			} else if(value > 9999999){
				console.log(`o5`)
				returnThis = newValue.substring(0,2)+"."+newValue.substring(2,3)+" million"
			} else if(value > 999999){ //at like 1m+
				console.log(`o4`)
				returnThis = newValue.substring(0,1)+"."+newValue.substring(1,2)+" million"
			} else if(value > 99999){//above 100k
				console.log(`o3`)
				returnThis = newValue.substring(0,3)+"."+newValue.substring(3,4)+"k"
			} else if(value > 9999) { //above 10k
				returnThis = newValue.substring(0,2)+"."+newValue.substring(2,3)+"k"
				console.log(`o2`)
			} else if(value > 999) { //above 1k
				returnThis = newValue.substring(0,1)+"."+newValue.substring(1,2)+"k"
				console.log(`o1`)
			}else {
				returnThis = value
			}
			return returnThis;
		}
        
        if (args[0] == 'a') {
			let maxLevel = args[1];
			let baseStats = {
				level: 8,
				hp: 224,
				mp: 240,
				strength: 11,
				agility: 9,
				intelligence: 10,
				willPower: 12
			}
			let newStats = {}
			Object.assign(newStats,baseStats)

			for (let i = 0; i < maxLevel; i++) {
				console.log(`stats++`)
				newStats.level += 1;
				newStats.hp +=  + 32;
				newStats.mp +=  + 32;
				newStats.strength += 2;
				newStats.agility += 1;
				newStats.intelligence += 1;
				newStats.willPower += 2;
			}
			console.log(newStats)

			let newStatsEmbed = new SharuruEmbed()
				.setDescription(`New stats:
				**Level**: ${newStats.level}
				**HP**: ${newStats.hp} 
				**MP**: ${newStats.mp} (+10)
				**Strength**: ${newStats.strength}
				**Agility**: ${newStats.agility}
				**Intelligence**: ${newStats.intelligence}
				**Willpower**: ${newStats.willPower}`)
				message.channel.send({embeds: [newStatsEmbed]})
		}
		if(args[0] == 'd'){

			// array where we dump data
			const commands = [];

			// grab the commands path
			const grabAllCommands = await glob(`${path.join(__dirname,"../../CommandsSlash")}/**/*.js`);

			// grab the output of each command and convert to JSON data
			for (const file of grabAllCommands) {
				const command = require(file);
				// console.log(command)
				commands.push(command.data.toJSON());
			}

			// Construct and prepare an instance of the REST module
			const rest = new REST({ version: '10' }).setToken(config.token);

			// and deploy your commands!
			(async () => {
				try {
					console.log(`Started refreshing ${commands.length} application (/) commands.`);

					// The put method is used to fully refresh all commands in the guild with the current set
					const data = await rest.put(
						Routes.applicationGuildCommands(this.client.user.id, config.myGuilds.dev_guild),
						{ body: commands },
					);

					console.log(`Successfully reloaded ${data.length} application (/) commands.`);
				} catch (error) {
					// And of course, make sure you catch and log any errors!
					console.error(error);
				}
			})();

			/**
			 * // to add globally
			 * await rest.put(
					Routes.applicationCommands(clientId),
					{ body: commands },
				);

			 */
			console.log(`done`)
		}
		
		if(args[0] == 'b'){
			// let word = "is"
			// let reg = new RegExp(`\\S+${word}|(\\S+${word}+\\S+)|${word}\\S+|${word}`,"g")
			// let themsg = `this is a test iswhich shoisuld helpis in testingis`
			// console.log(message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
			console.log(this.client.application.commands)
		}

		/**
		 * things to remember:
		 * ====================
		 * how to split time (#1 method: 1min-2sec || #2 method: 1min 2sec)
		 * ====================
		 * // let totalAmount = 0;
				// let thing = args[1].split(`-`);
				// for(let i = 0; i< thing.length; i++) {
				// 	totalAmount += ms(thing[i])
				// };
				// console.log(`time (milliseconds):${totalAmount};`)
				// console.log(`time :${pms(totalAmount)};`)
				let thing = args.splice(1).join(" ").split(" ");
				let result = 0;
				for(let i = 0; i< thing.length; i++) {
					result += ms(thing[i])
				};
				console.log(result)
			
		   ==================================
		   how to modify a property of an object inside array
		   ==================================

		   genshin.findOne({
				userID: issuer.id
			},(err,res)=>{
				if(err)console.log(err)
				if(res){
					let getIndex = res.inventory.findIndex(item => item.id == Number(args[1]))
					console.log(getIndex)
					let getItemAmount = res.inventory[getIndex].amount

					genshin.updateOne({
						'inventory.id': `${res.inventory[getIndex].id}`
					},{$set: 
						{	'inventory.$.amount': res.inventory[getIndex].amount+1
					 }
					},(erro,resu) =>{
					if(erro) console.log(erro)
					if(resu) console.log(resu)
					})
				}
			})
		 */
	}

};
