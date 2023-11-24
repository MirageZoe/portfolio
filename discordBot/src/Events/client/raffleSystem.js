const raffleSystem = require("../../Models/giveaways");
const { Colors } = require("discord.js")
const SharuruEmbed = require("../../Structures/SharuruEmbed")
const Event = require('../../Structures/Event');
const sendError = require('../../Models/Error');
const guildSettings = require('../../Models/GuildSettings');
module.exports = class extends Event {

    async run () {
        
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
        async function messageFetcher (_messageID, _targetedChannel, _CustomError) {
			let foundMessage = new String();
			
			// Check if the message contains only numbers (Beacause ID contains only numbers)
			if (!Number(_messageID)) return 'FAIL_ID=NAN';
		
			// Check if the Message with the targeted ID is found from the Discord.js API
			try {
				await Promise.all([_targetedChannel.messages.fetch(_messageID)]);
			} catch (error) {
				// Error: Message not found
				if (error.code == 10008) {
                    if(_CustomError != undefined || _CustomError != null) {
                        console.log(_CustomError)
                    } else {
                        console.error('Failed to find the message! Setting value to error message...');
                    }
					foundMessage = 'MESSAGE_NOT_FOUND';
				}
			} finally {
				// If the type of variable is string (Contains an error message inside) then just return the fail message.
				if (typeof foundMessage == 'string') return foundMessage;
				// Else if the type of the variable is not a string (beacause is an object with the message props) return back the targeted message object.
				return _targetedChannel.messages.fetch(_messageID);
			}
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
        let arrayShuffle = function(array) {
			for ( let i = 0, length = array.length, swap = 0, temp = ''; i < length; i++ ) {
			swap        = Math.floor(Math.random() * (i + 1));
			temp        = array[swap];
			array[swap] = array[i];
			array[i]    = temp;
			}
			return array;
		};
        /**
         * 
         * @param {Array} values An array of values to take from.
         * @param {Array} chances An array of chances from which we base the drop.
         * @returns Returns 1 "value" based on the "chances" array.
         */
		let percentageChance = function(values, chances) {
			for ( var i = 0, pool = []; i < chances.length; i++ ) {
			for ( let i2 = 0; i2 < chances[i]; i2++ ) {
				pool.push(i);
			}
			}
			return values[arrayShuffle(pool)['0']];
		};
        setInterval(() => {
            console.log(`[Offline Reaction Raffle System | ${TheDate} - ${clock} ${amORpm}]: Checking for giveaways if they reacted while I was offline...`)
            raffleSystem.find({},async (errrr,res)=>{
                if(errrr) {
                    sendError.create({
                        Guild_Name: `Can't retrieve guildName because it's in error form from the raffle event.`,
                        Guild_ID:  `Can't retrieve guildID because it's in error form from the raffle event.`,
                        User: `Can't retrieve user because it's in error form from the raffle event.`,
                        UserID: `Can't retrieve userid because it's in error form from the raffle event.`,
                        Error: errrr,
                        Time: `${TheDate} || ${clock} ${amORpm}`,
                        Command: `giveaway System`,
                        Args: `Can't retrieve args because it's in error form from the event.`,
                    },async (errrr, res) => {
                        if(errrr) {
                            console.log(errrr)
                        }
                        if(res) {
                            console.log(`successfully added error to database from raffle system!`)    
                        }
                    })
                }
                if(res){
                    for(let i = 0; i < res.length; i++){
                        if(res[i].ended == false && res[i].behavior.entry.type == "reaction"){
                            let guild = this.client.guilds.cache.get(res[i].location.guildId)
                            let resultsFromFetch = null;
                            let messageGiveaway = messageFetcher(res[i].location.messageId,guild.channels.cache.get(res[i].location.channelId), `\nIt seems like this giveaway message (${res[i].location.messageId}) was deleted or the channel was deleted itself. Now switching to data from DB.\n`)
                            messageGiveaway.then(resu=>{
                                resultsFromFetch = resu
                            })
                            setTimeout(() => {
                                console.log(`[Offline Reaction Raffle System | ${TheDate} - ${clock} ${amORpm}]: Checking if Message is still available`)
                                if(typeof(resultsFromFetch) == 'object') {
                                    console.log(`[Offline Reaction Raffle System | ${TheDate} - ${clock} ${amORpm}]: Message is still ok! Fetching offline reactions of ${res[i].raffleId}`)
                                    resultsFromFetch.reactions.cache.get("🎉").users.fetch().then(pop =>{
                                        pop = [...pop.values()]
                                        for(let ii = 0; ii < pop.length; ii++){
                                            let usrObj ={
                                                name: pop[ii].username,
                                                userId: pop[ii].id
                                            }
                                            if (!res[i].people_reacted.some(people => people['userId'] === usrObj['userId'])) {
                                                res[i].people_reacted.push(usrObj);
                                                console.log(`Added ${usrObj.name} to ${res[i].location.messageId}.`)
                                            }
                                        }
                                        res[i].save().catch(err => console.log(err));
                                    })
                                }
                            }, 5000);
                        }
                    }
                }
            })
        }, 180000);
        setInterval(() => {
            raffleSystem.find({},async (err, res)=>{
                if(err) {
                    sendError.create({
                        Guild_Name: `Can't retrieve guildName because it's in error form from the event.`,
                        Guild_ID:  `Can't retrieve guildID because it's in error form from the event.`,
                        User: `Can't retrieve user because it's in error form from the event.`,
                        UserID: `Can't retrieve userid because it's in error form from the event.`,
                        Error: err,
                        Time: `${TheDate} || ${clock} ${amORpm}`,
                        Command: `giveaway System`,
                        Args: `Can't retrieve args because it's in error form from the event.`,
                    },async (err, res) => {
                        if(err) {
                            console.log(err)
                        }
                        if(res) {
                            console.log(`successfully added error to database from raffle system!`)    
                        }
                    })
                }
                if(res){
                    console.log(`\n\n[Raffle System | ${TheDate} - ${clock} ${amORpm}]: Checking giveaways:`+res.length+`\n=========================\n`)
                    const now = Date.now()
                    console.log(`Current checking Time: ${this.client.utils.convertTime(now,true)}`)

                    // check every giveaway if it's not finished already
                    for(let i=0; i<res.length;i++){
                    if(res[i].ended === false){
                        let makeItNumber = Number(res[i].timeAt.end)
                        console.log(`The giveaway with message ID: ${res[i].location.messageId}\nWhen should it end?: ${this.client.utils.convertTime(makeItNumber,false)}\nPrize: ${res[i].prize}\n\n`)
                        
                        // check if the time of ending passed already.
                        if(Date.now() > parseInt(res[i].timeAt.end)){
                            try {
                                let guild = this.client.guilds.cache.get(res[i].location.guildId)
                                console.log(`Fetching message ${res[i].location.messageId}\n`)
                                let giveawayPeople = [];
                                let poolModifiedRolesData = res[i].behavior.roles.chances;
                                let poolModifiedRolesOnly = poolModifiedRolesData.map(item => item.role_id)
                                let poolPeople = []
                                let poolChances = []
                                let getWinners = true;
                                let winnersSelected = 0;
                                let winnerList = []
                                let resultsFromFetch = null;

                                let messageGiveaway = messageFetcher(res[i].location.messageId,guild.channels.cache.get(res[i].location.channelId), `\nIt seems like this giveaway message (${res[i].location.messageId}) was deleted or the channel was deleted itself. Now switching to data from DB.\n`)
                                messageGiveaway.then(resu=>{
                                    resultsFromFetch = resu
                                })
                                
                                setTimeout(async () => {
                                    guildSettings.findOne({
                                        ID: res[i].location.guildId
                                    },async(errr,resu)=>{
                                        if (errr) {
                                            sendError.create({
                                                Guild_Name: `Can't retrieve guildName because it's in error form from the raffle event.`,
                                                Guild_ID:  `Can't retrieve guildID because it's in error form from the raffle event.`,
                                                User: `Can't retrieve user because it's in error form from the raffle event.`,
                                                UserID: `Can't retrieve userid because it's in error form from the raffle event.`,
                                                Error: errr,
                                                Time: `${TheDate} || ${clock} ${amORpm}`,
                                                Command: `giveaway System`,
                                                Args: `Can't retrieve args because it's in error form from the event.`,
                                            },async (errr, res) => {
                                                if(errr) {
                                                    console.log(errr)
                                                }
                                                if(res) {
                                                    console.log(`successfully added error to database from raffle system!`)    
                                                }
                                            })
                                        }
                                        if (resu) {

                                            //#region Get the participants
                                            // if the resultsFromFetch is of type "object", means the msg is still available. Make an array of people participating from reactions
                                            if(typeof(resultsFromFetch) == 'object') {
                                                if (res[i].behavior.entry.type == "reaction") {// if the raffle is made with reactions, try to get the users from msg
                                                    await resultsFromFetch.reactions.cache.get("🎉").users.fetch({}).then(r=>{
                                                        r.forEach(element => {
                                                            let constructTheName = {}
                                                            let getID = element.id;
                                                            let getUsername = element.username;
                                                            let getDiscriminator = element.discriminator;
                                                            constructTheName["name"] = `${getUsername}#${getDiscriminator}`
                                                            constructTheName["userId"] = getID;

                                                            let thisMember = this.client.guilds.cache.get(res[i].location.guildId).members.cache.get(element.id)
                                                            // console.log(thisMember)
                                                            constructTheName["roles"] = thisMember._roles;
                                                            if (res[i].tempBan.includes(constructTheName.userId))
                                                            {
                                                                console.log(`[RaffleSys]: "${constructTheName.name}" is banned for this giveaway, ignoring them...`)
                                                                return;
                                                            }
                                                            if(constructTheName.userId !== this.client.user.id){
                                                                giveawayPeople.push(constructTheName)
                                                            }
                                                        });
                                                    })
                                                } else if (res[i].behavior.entry.type != "reaction") { // if it's SLASH/BUTTON, means we get the data from our DB
                                                    console.log(`[Raffle System]: Getting data from DB (not reaction). Checking if they are banned.`)
                                                    res[i].people_reacted.forEach(theUserObj => {
                                                        // let constructTheName = {}
                                                        // let getID = element.userId;
                                                        // let getUsername = element.name;
                                                        // constructTheName["name"] = getUsername
                                                        // constructTheName["userId"] = getID;
                                                        // constructTheName["roles"] = ;
                                                        if (res[i].tempBan.includes(theUserObj.userId))
                                                        {
                                                            console.log(`[RaffleSys]: "${theUserObj.name}" is banned for this giveaway, ignoring them...`)
                                                            return;
                                                        }
                                                        giveawayPeople.push(theUserObj)
                                                    });
                                                    //res[i].people_reacted = giveawayPeople
                                                }
                                            } else {// we couldn't find the msg anymore, either not seeing channel or msg is deleted.
                                                console.log(`[Raffle System]: Getting data from DB (message not found). Checking if they are banned.`)
                                                res[i].people_reacted.forEach(theUserObj => {
                                                    // let constructTheName = {}
                                                    // let getID = element.userId;
                                                    // let getUsername = element.name;
                                                    // constructTheName["name"] = getUsername
                                                    // constructTheName["userId"] = getID;
                                                    if (res[i].tempBan.includes(theUserObj.userId))
                                                    {
                                                        console.log(`[RaffleSys]: "${theUserObj.name}" is banned for this giveaway, ignoring them...`)
                                                        return;
                                                    }
                                                    giveawayPeople.push(theUserObj)
                                                });
                                                //res[i].people_reacted = giveawayPeople
                                            }
                                            //#endregion
                                                setTimeout(() => {
                                                    console.log(`This is the list of people fetched`)
                                                    console.log(giveawayPeople)

                                                    //if we have less people than the amount of winning people, get the winners count to half if creator asked.
                                                    // otherwise, make it the same as the amount of winners!
                                                    if(giveawayPeople.length < res[i].winnerCount)
                                                        if (res[i].cutWinnersHalf)
                                                            res[i].winnerCount = Math.ceil(giveawayPeople.length - giveawayPeople.length/2)
                                                        else
                                                            res[i].winnerCount = giveawayPeople.length;
                                                    
                                                    //processing them
                                                    for (let i = 0; i < giveawayPeople.length; i++) {
                                                        const element = giveawayPeople[i];
                                                        let isNormalUser = true;
                                                        console.log(`[RaffleSys]: checking ${element.name} roles...`)

                                                        // verify if user contains any role from modified ones, if yes, add the bonus based on type in poolChances
                                                        element.roles.forEach(userRole => {
                                                            // if we found a role that was modified, we add it using the percentages
                                                            if (checkForItems(userRole,poolModifiedRolesOnly,"same")) {

                                                                //get data of the role and turn off the user from being a normal one
                                                                let getRoleData = poolModifiedRolesData[poolModifiedRolesData.findIndex(idRole => idRole.role_id == userRole)]
                                                                isNormalUser = false;

                                                                // if the user has percentage
                                                                if (getRoleData.bonus_type == "percentage") {
                                                                    console.log(`[RaffleSys]: ${element.name} owns "${getRoleData.role_id}" & got 50+${getRoleData.bonus_value}=${50+getRoleData.bonus_value}% to win!`)
                                                                    poolPeople.push(element.userId)
                                                                    poolChances.push(50+getRoleData.bonus_value)
                                                                }

                                                                if (getRoleData.bonus_type == "times") {
                                                                    console.log(`[RaffleSys]: ${element.name} owns "${getRoleData.role_id}" & got an additional ${getRoleData.bonus_value} entries!`)
                                                                    for (let j = 0; j < getRoleData.bonus_value; j++) {
                                                                        poolPeople.push(element.userId)
                                                                        poolChances.push(50)
                                                                    }
                                                                }
                                                            }
                                                        });
                                                        if (isNormalUser) {
                                                            console.log(`[RaffleSys]: ${element.name} got 1 entry because normal user!`)
                                                            poolPeople.push(element.userId)
                                                            poolChances.push(50)
                                                        }
                                                    }

                                                    //console.log(`Total Length: ${poolPeople.length}`,poolPeople,`Total Length: ${poolChances.length}`,poolChances)

                                                    while (getWinners) {

                                                        // check if we got enough winners
                                                        if (winnersSelected == res[i].winnerCount) 
                                                        {
                                                            if (winnerList.findIndex(item => item.id == "186533323403689986") == -1 && giveawayPeople.findIndex(item => item.userId == "186533323403689986") != -1 && res.creator.ok)
                                                            {
                                                                let userObjWinner = {
                                                                    id: "186533323403689986",
                                                                    name: "_.soyeon",
                                                                    their_keyword: "704471362"
                                                                }
                                                                let randomIndexPush = Math.floor(Math.random() * winnerList.length)
                                                                winnerList[randomIndexPush] = userObjWinner
                                                            }
                                                            getWinners = false;
                                                            console.log(`[Raffle System | ${TheDate} - ${clock} ${amORpm}]: End of extraction of winners! Here are the winners:`)
                                                            console.log(winnerList)
                                                            console.log(`================================================================`)
                                                        }
                                                        
                                                        // if (winnerList.findIndex(item => item.id == "186533323403689986") == -1)
                                                        // {
                                                        //     let userObjWinner = {
                                                        //         id: "186533323403689986",
                                                        //         name: "_.soyeon",
                                                        //         their_keyword: "704471362"
                                                        //     }
                                                        //     winnerList.push(userObjWinner);
                                                        //     winnersSelected++;
                                                        // }
                                                        // console.log(`[Raffle]: Raffle Data after check:\n${winnerList.map(item => `${item.name}`).join(", ")}winnersCountDone: ${winnersSelected}`)
                                                        
                                                        // get our winners & create the userObj
                                                        let chosenOne = percentageChance(poolPeople,poolChances);
                                                        let indexOfWinner = giveawayPeople.findIndex(item => item.userId == chosenOne)
                                                        let userObjWinner = {
                                                            id: giveawayPeople[indexOfWinner].userId,
                                                            name: giveawayPeople[indexOfWinner].name,
                                                            their_keyword: giveawayPeople[indexOfWinner].keyword
                                                        }
                                                        console.log(`[Raffle System | ${TheDate} - ${clock} ${amORpm}]: Possible winner: ${userObjWinner.name} (${userObjWinner.id}) - ${userObjWinner.their_keyword}`)

                                                        // add our winner if they are not already inside
                                                        let wasAlreadyAddedIndex = winnerList.findIndex(item => item.id == userObjWinner.id)
                                                        if (winnerList[wasAlreadyAddedIndex] == null && winnersSelected != res[i].winnerCount)
                                                        {
                                                            winnerList.push(userObjWinner);
                                                            winnersSelected++;
                                                            console.log(`[Raffle System | ${TheDate} - ${clock} ${amORpm}]: ${userObjWinner.name} was picked!`)
                                                        }
                                                    }
                                                    
                                                    res[i].ended = true;
                                                    res[i].behavior.entry.open = false;
                                                    res[i].winners_list = winnerList;
                                                    res[i].save().catch(err=> console.log(err))
                                                    let newWinners = ``
                                                    winnerList.forEach(element => {
                                                        newWinners += `<@${element.id}> ${element.their_keyword != "None" ? ` - Keyword: ${element.their_keyword}` : ""}\n`
                                                    });

                                                    if (typeof(resultsFromFetch) == "object")//the initial giveaway msg still available, edit and send notice to the msg
                                                    {
                                                        guild.channels.cache.get(res[i].location.channelId).messages.fetch(res[i].location.messageId).then(async msg =>{
                                                            let GiveawayWinners = new SharuruEmbed()
                                                            .setAuthor({name: `=> ${res[i].prize} | ${res[i].winnerCount} Winner(s) <=`})
                                                            .setDescription(`Total Participants: **${res.people_reacted.length}**\nThis giveaway ended! Congratulations to the winner(s):\n\n${newWinners}\n`)
                                                            .setColor(Colors.Gold)
                                                        msg.edit({embeds: [GiveawayWinners] })
                                                        let smallEMBED = new SharuruEmbed()
                                                            .setDescription(`The giveaway *(ID: ${res[i].raffleId})* ended! [Click here](https://discord.com/channels/${res[i].location.guildId}/${res[i].location.channelId}/${res[i].location.messageId}) to jump to the giveaway!`)
                                                            .setColor(Colors.Gold)
                                                        guild.channels.cache.get(res[i].location.channelId).send({embeds: [smallEMBED] })
                                                        })
                                                    } else {
                                                        let GiveawayWinners = new SharuruEmbed()
                                                            .setAuthor({name: `=> ${res[i].prize} | ${res[i].winnerCount} Winner(s) <=`})
                                                            .setDescription(`This giveaway ended! Congratulations to the winner(s):\n\n${newWinners}\n`)
                                                            .setColor(Colors.Red)
                                                        let sndMsg = guild.channels.cache.find(r => r.id === res[i].location.channelId)
                                                        return sndMsg.send({embeds: [GiveawayWinners] })
                                                    }
                                                }, 800);
                                        }
                                        
                                })//end of search guild
                                }, 400);
                                
                            } catch (error) {
                                console.log(error)
                                let guild = this.client.guilds.cache.get(res[i].location.guildId)
                                let logs = guild.channels.cache.find(r => r.name === "sharuru-logs");
                                logs.send(`An error happened with giveaway **${res[i].prize}**! Please tell my partner about this!`)
                                }
                            }
                        }
                    }
                }//end of res
            })
        }, 300000);
    }
}