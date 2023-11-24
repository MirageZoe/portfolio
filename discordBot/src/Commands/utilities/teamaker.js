/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const { PermissionsBitField, Colors } = require('discord.js');
const fs = require('fs');
const ms = require('ms');
const SharuruEmbed = require('../../Structures/SharuruEmbed.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'teamaker',
			displaying: true,
			description: 'Create 2 or more organized teams! Just start the command, let people know that they can participate by typing "count me" (case sensitive, they must type exactly "count me" to work!) and if the one who started said "stop", they will be asked an amount of teams, min 2, max 16. Otherwise if the time runs out and nobody said anything else, Sharuru will make 2 teams.',
			options: '~',
			usage: '',
			example: '',
			category: 'utilities',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages,PermissionsBitField.Flags.ManageMessages],
			args: false,
			guildOnly: true,
			ownerOnly: false,
			aliases: ['teams','party']
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
    
        function deletePlayer(TheArray, theNumber) {
            for (let i = theNumber; i < TheArray.length; i++) {
                TheArray[i - 1] = TheArray[i]
            }
            TheArray.pop()
        }
        let teamsEmbed = new SharuruEmbed()
            .setAuthor({name: `Team maker!`})
            .setColor(Colors.LuminousVividPink)
            .setTimestamp()
        let players;
        // db.set(`playersTeamMakerUnique`, [])
        console.log(`Preparing the teamaker array for ${message.guild.name}:`)
        if(!this.client.teamaker.has(`${message.guild.id}`)){
            this.client.teamaker.set(`${message.guild.id}`,[])
        }
        let theOneThatStarted = issuer.id;
        let doneContinuing = false;
        let theObjectsReceived = this.client.teamaker.get(`${message.guild.id}`);

        teamsEmbed.setDescription(`Anyone who wanna join a team, type \`"count me"\` to enter!\n\n\`Players :${theObjectsReceived.length}\``)
        let msgSent = await message.channel.send({embeds: [teamsEmbed]})

        try {
            while (!doneContinuing) {
                // players = db.fetch(`playersTeamMakerUnique`)
                players = theObjectsReceived;
                teamsEmbed.setDescription(`Anyone who wanna join a team, type \`"count me"\` to enter!\n\n\`Players :${players.length}\``)
                await msgSent.edit({embeds: [teamsEmbed]}).then(async (FirstPhase) => {
                    let filter = m => m.content
                    await message.channel.awaitMessages({
                        filter,
                        max: 1,
                        time: 30_000
                    }).then(async (SecondPhase) => {
                        if (SecondPhase.first()) {
                            // await FirstPhase.delete();
                            // await SecondPhase.delete();
                            let ContinueQM = SecondPhase.first().content;
                            let memberJoined = SecondPhase.first().author.id;
                            if (ContinueQM.toLowerCase() === 'stop' && SecondPhase.first().author.id === theOneThatStarted) {
                                await SecondPhase.first().delete();
                                doneContinuing = true;
                            } else { //if you want to stop say only "stop"
                                if (ContinueQM.toLowerCase() === "count me") {
                                    await SecondPhase.first().delete();
                                    console.log(`Before adding:`)
                                    console.log(theObjectsReceived)
                                    if(!theObjectsReceived.includes(memberJoined)){
                                        theObjectsReceived.push(memberJoined)
                                    }
                                    console.log(`Before after adding:`)
                                    console.log(theObjectsReceived)
                                    // let becomeArray = Object.values(theObjectsReceived)
                                    // let becomeUniqueArray = [...new Set(becomeArray)]
                                    // db.set(`playersTeamMakerUnique`, becomeUniqueArray)becomeUniqueArray
                                    this.client.teamaker.set(`${message.guild.id}`,theObjectsReceived)
                                }
                            }
                        } else {
                            doneContinuing = true;
                        }
                    })
                })
            }
    
            console.log(`okay, out of the loop`)
            // players = db.fetch(`playersTeamMakerUnique`)
            players = this.client.teamaker.get(`${message.guild.id}`)
            console.log(`players: ` + players)
            if(players.length < 2) {
                this.client.teamaker.delete(`${message.guild.id}`)
                teamsEmbed.setDescription(`${issuer}, I'm sorry but I cannot proceed more if there are not at least 2 people to make teams!`)
                return message.channel.send({embeds: [teamsEmbed]});
            }
    
            let TeamsCondition = false;
            let howManyContent = 0;
            teamsEmbed.setDescription(`How many teams do you want to make? *(min 2, max 16)*\n\n*P.S: you cannot make more teams than the amount of current players*\nP.S 2: You can cancel at any time by typing "cancel".`)
            while(!TeamsCondition){
                await message.channel.send({embeds: [teamsEmbed]}).then(async (FirstPhase)=>{
                    let filter = m => m.author.id === theOneThatStarted;
                    await message.channel.awaitMessages({filter,max: 1, time: 30_000}).then(async (SecondPhase)=>{
                        if (SecondPhase.first()) {
                            await FirstPhase.delete();
                            howManyContent = SecondPhase.first().content;
                            if(howManyContent == 'cancel' || howManyContent == 'stop') return message.channel.send(`${issuer}, Okay, stopped making the teams!`)
                            if(howManyContent >= 2 && howManyContent <=16 && howManyContent <= players.length){
                                await SecondPhase.delete();
                                TeamsCondition=true;
                            }
                        }else{
                            await FirstPhase.delete();
                            howManyContent = 2;
                            TeamsCondition=true;
                        }
                    })    
                })
            }

    
            let teams = [];
            for (let i=0; i<howManyContent;i++){
                teams.push([]);
            }
    
            let ii=0;
    
            while(players.length > 0){
            let x = Math.floor(Math.random() * players.length);
            let randomplayer = players[x];
            let makeItAName = `<@${randomplayer}>`
            teams[ii].push(makeItAName);
    
            ii = (ii + 1) % howManyContent;
    
            deletePlayer(players,x+1)
            }
            teamsEmbed
                .setFooter({text: `Teams created at ${issuer.tag} request!`, iconURL: issuer.displayAvatarURL({dynamic: true})})
                .setDescription(`These are the teams:\n`)
            const teamsProcessed = []
            for(let i=0; i<howManyContent;i++){
            // message.channel.send(`Team ${i+1}:${teams[i]}\n`)
                let processTeam = {
                    name: `Team ${i+1}:`, value: teams[i].join("\n"), inline: true
                }
                teamsProcessed.push(processTeam)
            }
            teamsEmbed.addFields(teamsProcessed)
            this.client.teamaker.delete(`${message.guild.id}`)
            await message.channel.send({embeds: [teamsEmbed] })
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
                    return message.channel.send(`Unfortunately an problem appeared while making the teams in teamaker command. Please try again later. If this problem persist, contact my partner!`)
                }
                if(res) {
                    console.log(`successfully added error to database!`)
                }
            })
        }
	}

};
