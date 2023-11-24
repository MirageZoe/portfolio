const SharuruEmbed = require('../../Structures/SharuruEmbed');
const GuildSettings = require('../../Models/GuildSettings')
const { AttachmentBuilder, Colors } = require('discord.js');
const Event = require('../../Structures/Event');
const keygen = require("keygenerator");
const Canvas = require("canvas");
const path = require("path");
const fs = require("fs");
const halloweenDoc = require('../../Models/events/halloween/halloween_queue');
const config = require('../../../config.json')

module.exports = class extends Event {

    constructor(...args) {
        super(...args, {
            event_type: 'client'
        });
    }

    async run(options) {
        let myGuild = this.client.guilds.cache.get(options.guild);
        let randomCH = options.channels.length > 1 ? this.getRandomInt(0,options.channels.length-1) : 0
        let halloChannel = myGuild.channels.cache.get(options.channels[randomCH]);
        let userlog = myGuild.channels.cache.find(r=> r.name === 'sharuru-logs');

        // console.log(Date.now())
		if (Date.now() > config.event_dates.halloweenEnd) return console.log(`[Halloween-event]: The event is over! Not spawning anymore! (halloween.js)!`)

        // choose the random chances
        let theCode = keygen._({length: 7});
        let cardRarity = this.percentageChance(['common','uncommon','rare','collection'],[49, 33, 13, 5])
        let chooseFav = this.percentageChance(['trick','treat'],[50,50]);
        let isGoodOrEvil = Math.floor(Math.random() * 2) == 0 ? -1 : 1
        let timeToExpire = Date.now() + 600000; // last 10min;
        let givenPoints = 1

        if(cardRarity == 'uncommon') 
        {
            givenPoints = 2
            timeToExpire = Date.now() + 300000 // last 5min
        }
        else if(cardRarity == 'rare')
        {
            givenPoints = 3
            timeToExpire = Date.now() + 150000 // last 2.5min
        }
        else if(cardRarity == 'collection')
        {
            givenPoints = 5
            timeToExpire = Date.now() + 45000 // last 45sec
        }
        
        // read dir and get the card as attachment
        let getCardDIr = fs.readdirSync(path.join(__dirname+`../../../Assets/events/halloween/${cardRarity}`))//
        let getCardFullName = getCardDIr[this.getRandomInt(0,getCardDIr.length-1)]// most likely name
        // console.log(getCardFullName.slice(-4))
        let getCard = fs.readFileSync(path.join(__dirname+`../../../Assets/events/halloween/${cardRarity}/${getCardFullName}`))//${cardRarity}
        let attachCard = new AttachmentBuilder(getCard,{name: `image${getCardFullName.slice(-4).toLowerCase()}`})

        // get author
        let ArtistPoint = getCardFullName.indexOf('[')
        let soulStartPoint = getCardFullName.indexOf(`]`)
        let entire_name = null;
        let andInd = null;
        let submittedby = null;

        let soulName = getCardFullName.slice(soulStartPoint+1,-4)
        let ArtistName = getCardFullName.slice(ArtistPoint+1,soulStartPoint)
        if(ArtistName.includes(`&`)){
            andInd = ArtistName.indexOf(`&`)
            ArtistName = ArtistName.slice(ArtistPoint,andInd-1)
            submittedby = getCardFullName.slice(andInd+2,soulStartPoint)
            entire_name = ArtistName + ` (Submitted by: ${submittedby})`
        } else {
            entire_name = getCardFullName.slice(ArtistPoint+1, soulStartPoint)
        }

        GuildSettings.findOne({
            ID: options.guild
        },async (err,res)=>{
            if (err) {
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
                
                let amORpm;
                if (hrs >= 0 && hrs <= 12) {
                    amORpm = 'AM';
                } else {
                    amORpm = 'PM';
                }
                //#endregion
				sendError.create({
					Guild_Name: `halloween event file - no name`,
					Guild_ID: options.guild,
					User: `halloween event file - no user`,
					UserID: `halloween event file - no user`,
					Error: err,
					Time: `${TheDate} || ${clock} ${amORpm}`,
					Command: this.name+" looking in guild db",
					Args: options,
				},async (err, res) => {
					if(err) {
						console.log(err)
						return userlog.send(`[Halloween-Event]: Unfortunately an problem appeared while saving an internal error. Please try again later. If this problem persist, contact my partner!`)
					}
					if(res) {
						console.log(`successfully added error to database!`)
						return userlog.send(`[Halloween-Event]: Unfortunately an problem appeared while sending the soul. Please try again later. If this problem persist, contact my partner!`)
					}
				})
			}
            if (res) {

                if (!res.events.halloween.enableEvilSouls) res.events.halloween.enableEvilSouls = false;
                res.save().catch(err2 => {
                    sendError.create({
                        Guild_Name: `halloween event file - no name`,
                        Guild_ID: options.guild,
                        User: `halloween event file - no user`,
                        UserID: `halloween event file - no user`,
                        Error: err2,
                        Time: `${TheDate} || ${clock} ${amORpm}`,
                        Command: this.name+" saving the new variable state bcs it wasn't found",
                        Args: options,
                    },async (err3, res3) => {
                        if(err3) {
                            console.log(err3)
                            return userlog.send(`[Halloween-Event]: Unfortunately an problem appeared while saving an internal error. Please try again later. If this problem persist, contact my partner!`)
                        }
                        if(res3) {
                            console.log(`successfully added error to database!`)
                            return userlog.send(`[Halloween-Event]: Unfortunately an problem appeared while sending the soul. Please try again later. If this problem persist, contact my partner!`)
                        }
                    })
                })
                let haloEmbed = new SharuruEmbed()
                const ghostFolder = fs.readdirSync(path.join(__dirname+`../../../Assets/events/halloween/other/pickNeutralFromhere`))
                const neutralSoulPic = fs.readFileSync(path.join(__dirname+`../../../Assets/events/halloween/other/pickNeutralFromhere/${ghostFolder[this.getRandomInt(0,ghostFolder.length-1)]}`))
                const neutralSoulPicAttachment = new AttachmentBuilder(neutralSoulPic,{name: `temp.png`})
                const bonusRateCandies = res.events.halloween?.bonusRate ?? 1
                

                console.log(`[halloween event]: What type of soul: ${cardRarity}`)
                console.log(`[halloween event]: bonus Rate: ${bonusRateCandies}`)
                console.log(`[halloween event]: points given: ${givenPoints}`)
                if (bonusRateCandies != 1)
                {
                    // add the bonus candies accordingly to the specific rate
                    // if it's 1, add, if it's more than 1, multiply
                    if (givenPoints == 1) givenPoints += bonusRateCandies
                    else givenPoints *= bonusRateCandies
                }

                //#region creating the code
                const canvas = Canvas.createCanvas(130, 50);
                const ctx = canvas.getContext("2d");

                // let decideIfYouAddSpace = this.percentageChance(['add',`not add`],[25,75])
                // console.log(`I have decided to: ` + decideIfYouAddSpace)
                // let newCode = theCode;
                // if (decideIfYouAddSpace == "add")
                // newCode = this.insertSpaces(theCode, 3,`-`)

                //this part is for code
                ctx.font = 'bold 18px khmer ui';//blessed day
                ctx.fillStyle = '#e5e5e5';
                ctx.fillText(theCode, 10, 30);

                //this part is for the lines over the code
                ctx.lineWidth = 1.5;//make line thicker

                ctx.beginPath();
                ctx.strokeStyle = this.randomColor();
                ctx.moveTo(6,10);
                ctx.lineTo(120,10);//1
                ctx.stroke();
                ctx.closePath();

                ctx.beginPath();
                ctx.strokeStyle = this.randomColor();
                ctx.moveTo(6,20);
                ctx.lineTo(120,20);//2
                ctx.stroke();
                ctx.closePath();
                
                ctx.beginPath();
                ctx.strokeStyle = this.randomColor();
                ctx.moveTo(6,30);
                ctx.lineTo(120,30);//3
                ctx.stroke();
                ctx.closePath();

                ctx.beginPath();
                ctx.strokeStyle = this.randomColor();
                ctx.moveTo(6,40);
                ctx.lineTo(120,40);//4
                ctx.stroke();
                ctx.closePath();
                //#endregion

                const codeImg = new AttachmentBuilder(canvas.toBuffer(),{name: 'image.png'});
                console.log(`[halloween event]: total points given: ${givenPoints}`)

                if (res.events.halloween.enableEvilSouls == false)//if it's normal
                {
                    haloEmbed.setImage(`attachment://image${getCardFullName.slice(-4).toLowerCase()}`)
                    .setColor(Colors.LuminousVividPink)
                    .setDescription(`Open the door and greet them with ${options.prefix}${chooseFav}!`)
                    .setAuthor({name: `A trick-or-treater has appeared!`})
                    .setFooter({text: `Credits to the artist: ${ArtistName}`})

                    halloChannel.send({embeds: [haloEmbed],files: [attachCard]}).then(m =>{//,files: [attachCard]
                        halloChannel.send({files: [codeImg]})
                        console.log(`[Halloween-event] Spawned in: ${halloChannel.name}`)
                        halloweenDoc.create({
                            server: options.guild,
                            points: givenPoints,
                            expireAt: timeToExpire,
                            code: theCode.trim(),
                            fav: chooseFav,
                            message: {
                                link: `https://discord.com/channels/${options.guild}/${halloChannel.id}/${m.id}`,
                                channel: halloChannel.id,
                                id: m.id
                            },
                            cardDisplayDataPath: {
                                rarity: cardRarity,
                                fullname: getCardFullName
                            },
                            name: soulName,
                            artist: ArtistName
                        })
                    });
                } 
                else 
                {// if we have evil souls as well, subtract the points instead of giving
                    
                    haloEmbed.setImage(`attachment://temp.png`)
                    .setColor(Colors.LuminousVividPink)
                    .setDescription(`Open the door and greet them with ${options.prefix}${chooseFav}!`)
                    .setAuthor({name: `A trick-or-treater has appeared!`})

                    givenPoints *= isGoodOrEvil
                    if (isGoodOrEvil == -1)
                        console.log(`[halloween event]: spawned an evil soul! Candies to lose: ${givenPoints}`)

                    halloChannel.send({embeds: [haloEmbed],files: [neutralSoulPicAttachment]}).then(m =>{//,files: [attachCard]
                        halloChannel.send({files: [codeImg]})
                        console.log(`[Halloween-event] Spawned in: ${halloChannel.name}`)
                        halloweenDoc.create({
                            server: options.guild,
                            points: givenPoints,
                            expireAt: timeToExpire,
                            code: theCode.trim(),
                            fav: chooseFav,
                            message: {
                                link: `https://discord.com/channels/${options.guild}/${halloChannel.id}/${m.id}`,
                                channel: halloChannel.id,
                                id: m.id
                            },
                            cardDisplayDataPath: {
                                rarity: cardRarity,
                                fullname: getCardFullName
                            },
                            name: soulName,
                            artist: ArtistName
                        })
                    });
                }
                
            }
        })
        

    }
    arrayShuffle = function(array) {
        for ( let i = 0, length = array.length, swap = 0, temp = ''; i < length; i++ ) {
        swap        = Math.floor(Math.random() * (i + 1));
        temp        = array[swap];
        array[swap] = array[i];
        array[i]    = temp;
        }
        return array;
    };
    percentageChance = function(values, chances) {
        for ( var i = 0, pool = []; i < chances.length; i++ ) {
        for ( let i2 = 0; i2 < chances[i]; i2++ ) {
            pool.push(i);
        }
        }
        return values[this.arrayShuffle(pool)['0']];
    };
    getRandomInt = function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    insertSpaces = function(str, n, char) {
        for(var i = 0; i < n; i++){
            var randPos = Math.floor(Math.random() * (str.length + 1)); // get random index to insert
            str = str.substring(0, randPos) + char + str.substring(randPos, str.length); // insert the repeated sting
        }  
        return str;        
    }

    randomColor = function() {
        return "#"+Math.floor(Math.random()*16777215).toString(16);
    }
}