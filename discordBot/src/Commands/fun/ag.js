/* eslint-disable no-unused-vars */
const fs = require('fs');
const ms = require('ms');
const _ = require('lodash');
const sendError = require('../../Models/Error');
const Command = require('../../Structures/Command.js');
const SharuruEmbed = require('../../Structures/SharuruEmbed.js');
const data_mainStats = require('../../Assets/artgen_data/mainstat.json');
const data_substats_upgrade = require('../../Assets/artgen_data/substats_upgrades.json');
const db_player_inv = require("../../Models/artifact_gen/artifact_player_data");
const db_substats_drop = require('../../Models/artifact_gen/substats_drop');
const { PermissionsBitField, Colors } = require("discord.js")

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'ag',
			displaying: true,
			cooldown: 1000,
			description: 'Artifact generator for Genshin Impact',
			options: `- \`no option\` => generates a random artifact + 0.
			\`<type: flower/feather/sands/goblet/circlet> [level: 0-20]\` => generates an artifact of that type. If level is provided, it will also be leveled up to that point.`,
			usage: '-',
			example: ' flower 20 => generates a flower + 20',
			category: 'fun',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
			guildOnly: true,
			ownerOnly: false,
			aliases: ['artifactgenerator']
		});
	}

	async run(message, args) {
		// eslint-disable-next-line id-length
		// if (!message.member.roles.cache.find(r => r.name === 'Disciplinary Committee')) return message.channel.send(`Command locked or it's in development`);

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

		let amORpm;
		if (hrs >= 0 && hrs <= 12) {
			amORpm = 'AM';
		} else {
			amORpm = 'PM';
		}

		// let test = [1,2,3,4,5,"3"]
		let test2 = [6,2,7,"3","1"]
		

		// return console.log(test2.length)

		const typeToName = {
			flower : "Flower of Life",
			feather : "Plume of Death",
			sands : "Sands of Eon",
			goblet : "Goblet of Eonothem",
			circlet : "Circlet of Logos",
		}

		if (args[0] == 'upgrade') {

			db_player_inv.findOne({
				userID: issuer.id
			},async(err,res) =>{
				if (err) {
					console.log(err)
					return logChannel.send(`Error, sowwy broke :(\nIf this persist, please tell my partner about this error:\n\`TYPE: ${err.name}\`\n\`ERR: ${err.message}\`\n\`CAUSE?: ${err.stack}\``)
				}
				if (res) {
					if (res.artifact.artType == "N/A") {
						rep(`you have no artifact, roll one + 0 to add to your inventory!`)
						return;
					}
					let art_main_stat = res.artifact.artMain.stat
					let art_main_stat_value = res.artifact.artMain.value;
					let art_substats = {
						substats: Object.values(res.artifact.artSub),
						values: Object.values(res.artifact.artVal)
					}
					let art_name = res.artifact.name;
					let art_type = res.artifact.artType;
					let art_level = res.artifact.artLevel
					let upginfo = ``
					// some limiting
					let nextFourLevels = args[1]
					if (!nextFourLevels) nextFourLevels = art_level+4
					if (nextFourLevels <= art_level || nextFourLevels > 20 ) return rep(`you cannot use levels equal or below the artifact's level or bigger than 20!`)
					let chooseChances = [25,25,25,25];

					// upgrading
					for(let i = art_level+1; i <= nextFourLevels; i++) {
						if (i % 4 == 0) {
							if (art_substats.substats.includes("N/A")) {
								art_substats.substats.pop()
								chooseChances = [25,25,25]
							} 
							let upgradeThis = percentageChance( art_substats.substats, chooseChances)
							console.log(`arr:`,art_substats.substats)
							let findStatIndex = art_substats.substats.findIndex(i => i == upgradeThis);
							let getStatNum = art_substats.values[findStatIndex]
							console.log(upgradeThis)
							let sumWithThis = percentageChance(data_substats_upgrade.find(stat => stat.name == upgradeThis).values,[25,25,25,25]);
							art_substats.values[findStatIndex] = Math.round((getStatNum + sumWithThis) * 10) / 10
							// console.log(`Upgraded ${upgradeThis}:  ${getStatNum} => ${art_substats.values[findStatIndex]}`)
							upginfo += `${upgradeThis}: ${getStatNum} => ${art_substats.values[findStatIndex]}\n`
						}
					}
					art_main_stat_value = data_mainStats.find(st => st.name == art_main_stat).values[nextFourLevels]
					let artUpg = new SharuruEmbed()
						.setColor(Colors.LuminousVividPink)
						.setTitle(`${art_name}  +${nextFourLevels}`)
						.addFields(
							{name:`Main Stat:`, value: `${art_main_stat.includes("%") ? art_main_stat = art_main_stat.replace("%","") + ` + ${art_main_stat_value}` : ['flower','feather'].includes(art_type) ? art_main_stat + " +"+art_main_stat_value : art_main_stat+ ` + ${art_main_stat_value}`}`},
							{name: "Substats:",value:`
							· ${art_substats.substats[0].includes("%") ? `${art_substats.substats[0] = art_substats.substats[0].replace("%","")} ${art_substats.values[0]}%` : `${art_substats.substats[0]} + ${art_substats.values[0]}`}
							· ${art_substats.substats[1].includes("%") ? `${art_substats.substats[1] = art_substats.substats[1].replace("%","")} ${art_substats.values[1]}%` : `${art_substats.substats[1]} + ${art_substats.values[1]}`}
							· ${art_substats.substats[2].includes("%") ? `${art_substats.substats[2] = art_substats.substats[2].replace("%","")} ${art_substats.values[2]}%` : `${art_substats.substats[2]} + ${art_substats.values[2]}`}
							${art_substats.substats.length > 3 ? art_substats.substats[3].includes("%") ? `· ${art_substats.substats[3] = art_substats.substats[3].replace("%","")} ${art_substats.values[3]}%` : `· ${art_substats.substats[3]} + ${art_substats.values[3]}` : ``}
							`},
							{name: "Upgrade Details:",value: upginfo}
						)
						.setFooter({text: `Upgraded by ${issuer.tag}`})
					if (nextFourLevels >= 20) {
						res.artifact.artType = "N/A"
						artUpg.addFields(
							{name: `Notice:`,value: `Because the artifact hit the max level (20), it was removed from your inventory.`}
						)
					} else {
						res.artifact.artMain.value = art_main_stat_value
						res.artifact.artLevel = nextFourLevels;
						let newObj = {
							value1: art_substats.values[0],
							value2: art_substats.values[1],
							value3: art_substats.values[2],
							value4: art_substats.values[3]
						}
						res.artifact.artVal = newObj;
					}
					res.save().catch(err=> console.log(err));
					return rep(null,artUpg);
				} else {
					rep(`you have no artifact in inventory. Come back after getting one +0!`)
				}
			})
			return;
		}

		let artType = args[0];
		if (!artType) artType = percentageChance(["flower","feather","sands","goblet","circlet"],[20,20,20,20,20]);
		if (!["flower","feather","sands","goblet","circlet"].includes(artType)) {
			let noArty = new SharuruEmbed()
				.setColor(Colors.LuminousVividPink)
				.setDescription(`<@${issuer.id}> this isn't a valid artifact type! Specify one from: \`flower, feather, sands, goblet, circlet\`\n\nIn case you wanted an artifact + 20, please specify first the type of artifact then the level:\n\`ag flower 20\``)
			return rep(null,noArty)
		}
		let artLevel = args[1];
		if (!artLevel) artLevel = 0;
		if (isNaN(artLevel) || artLevel < 0 || artLevel > 20) return rep(`there isn't any artifact with level lower than 0 and neither higher than 20!`)

		let artTitle;
		let artMainStat;
		let artMainStatValue;

		// Setting the main stat values

		({ artTitle, artMainStat, artMainStatValue } = generateMainStat(artType, artTitle, typeToName, artMainStat, artMainStatValue, artLevel, percentageChance));

		//do the magic
		generateSubstats(artType,artLevel,true);

		function rep(msg,embed) {
			if (embed) {
				message.channel.send({embeds: [embed]})
			} else {
				message.channel.send(`<@${issuer.id}>, `+msg)
			}
		}

		function generateSubstats(artiType, artiLevel, log) {
			const howManySubstats = percentageChance([3,4],[75,25])
			let statsAdded = [];
			let statsNumbers = []
			statsAdded.push(artMainStat);
			db_substats_drop.findOne({
				artType: artType
			},async(err,res) =>{
				if (err) {
					console.log(err)
					return logChannel.send(`Error, sowwy broke :(\nIf this persist, please tell my partner about this error:\n\`TYPE: ${err.name}\`\n\`ERR: ${err.message}\``)
				}
				if (res) {
					//first for, to select the stats
					for (let i = 0; i < howManySubstats; i++) {
						coreGenerateSubstats(artiType, res, statsAdded, percentageChance, statsNumbers, artMainStat);
					}
					//removing main stat
					statsAdded = statsAdded.slice(1)
					// upgrade stats for x level
					if (artLevel > 0) {
						artMainStatValue = data_mainStats.find(st => st.name == artMainStat).values[artLevel];
						let checkStatsNR = howManySubstats;
						for(let i = 1; i <= artiLevel; i++) {
							if (i % 4 == 0) {
								if (checkStatsNR == 4) {
									let upgradeThis = percentageChance(statsAdded, [25,25,25,25])
									let findStatIndex = statsAdded.findIndex(i => i == upgradeThis);
									let getStatNum = statsNumbers[findStatIndex]
									let sumWithThis = percentageChance(data_substats_upgrade.find(stat => stat.name == upgradeThis).values,[25,25,25,25]);
									statsNumbers[findStatIndex] = Math.round((getStatNum + sumWithThis) * 10) / 10
									console.log(`[Artifact-Gen]: Upgraded ${upgradeThis}: ${getStatNum} + ${sumWithThis}`)
								} else if (checkStatsNR == 3) {
									let oldArr = Object.assign({},statsAdded)
									let newTest = coreGenerateSubstats(artiType, res, statsAdded, percentageChance, statsNumbers, artMainStat);
									oldArr = Object.values(oldArr)
									let difference = _.difference(newTest.sa, oldArr)
									console.log(`[Core-Generator]: Generated +1 stat (${difference}) at ${i}`)
									statsAdded = newTest.sa
									statsNumbers = newTest.sn
									checkStatsNR++;
								}
							}
						}
					}


					if (log) {
						console.log("\n==========================================================")
						console.log(`[Artifact Generator]: Generated a ${artTitle} artifact (s:${howManySubstats}) with:`)
						console.log(`Main Stat: ${artMainStat.includes("%") ? artMainStat.replace("%","") : ['flower','feather'].includes(artType) ? artMainStat + " +" + artMainStatValue : artMainStat}`)
						console.log("Sub-stats:\n",statsAdded)
						console.log("Sub-stats Numbers:\n",statsNumbers)
						// console.log("Final Values:\n",statsFinal)
						console.log("\n==========================================================\n")
					}

					let work = {
						stat1: statsAdded[0], 
						stat2: statsAdded[1],
						stat3: statsAdded[2], 
						stat4: statsAdded.length > 3 ? statsAdded[3] : "N/A", 
					}
					// put it in inv if user doens't have one already
					if (artLevel == 0) {
						db_player_inv.findOne({
							userID: issuer.id
						},async (err2,res2) =>{
							if (err2) {
								console.log(err2)
								return logChannel.send(`Error, sowwy broke :(\n\`ERR: ${err2.stack}\``)
							}
							if (res2) { // if member is found in db,
								if (res2.artifact.artType == "N/A") { // if we have no art, add
									let newArt = {
										name: artTitle,
										artType: artType,
										artLevel: 0,
										artMain: {
											stat: artMainStat,
											value: parseInt(artMainStatValue)
										},
										artSub: work,
										artVal: {
											value1: statsNumbers[0],
											value2: statsNumbers[1],
											value3: statsNumbers[2],
											value4: statsNumbers.length > 3 ? statsNumbers[3] : 0,
										}
									}
									res2.artifact = newArt;
									res2.save().catch(err3 => console.log(err3))
									return rep(`I have added this artifact to your inventory since u had nothing. When you want to upgrade it, type \`${prefix}ag upgrade\`!`)
								} else console.log("alredy have")
							} else { // if not, create new entry for member
								let newArt = {
									name: artTitle,
									artType: artType,
									artLevel: 0,
									artMain: {
										stat: artMainStat,
										value: artMainStatValue
									},
									artSub: work,
									artVal: {
										value1: statsNumbers[0],
										value2: statsNumbers[1],
										value3: statsNumbers[2],
										value4: statsNumbers.length > 3 ? statsNumbers[3] : 0,
									}
								}
								db_player_inv.create({
									userID: issuer.id,
									userName: issuer.tag,
									artifact: newArt
								},(err4,res3)=>{
									if (err4) {
										console.log(err4)
										return logChannel.send(`Error, sowwy broke :(\nIf this persist, please tell my partner about this error:\n\`TYPE: ${err4.name}\`\n\`ERR: ${err4.message}\`\n\`CAUSE?: ${err4.stack}\``)
									}
									if (res3) {
										console.log(`[ArtifactGen]: Successfully added new member to db.`)
										// console.log(res3)
										return rep(`I have added this artifact to your inventory. When you want to upgrade it, type \`${prefix}ag upgrade\`!`)
									}
								})
							}
						})
					}
					
					let artgenerated = new SharuruEmbed()
						.setColor(Colors.LuminousVividPink)
						.setTitle(`${artTitle} + ${artLevel}`)
						.addFields(
							{name: `Main Stat:`, value: `${artMainStat.includes("%") ? artMainStat.replace("%","") + ` + ${artMainStatValue}` : ['flower','feather'].includes(artType) ? artMainStat + " +" + artMainStatValue : artMainStat + ` ${artMainStatValue}`}`},
							{name: "Substats:", value: `
							· ${statsAdded[0].includes("%") ? `${statsAdded[0] = statsAdded[0].replace("%","")} ${statsNumbers[0]}%` : `${statsAdded[0]} + ${statsNumbers[0]}`}
							· ${statsAdded[1].includes("%") ? `${statsAdded[1] = statsAdded[1].replace("%","")} ${statsNumbers[1]}%` : `${statsAdded[1]} + ${statsNumbers[1]}`}
							· ${statsAdded[2].includes("%") ? `${statsAdded[2] = statsAdded[2].replace("%","")} ${statsNumbers[2]}%` : `${statsAdded[2]} + ${statsNumbers[2]}`}
							${statsAdded.length > 3 ? statsAdded[3].includes("%") ? `· ${statsAdded[3] = statsAdded[3].replace("%","")} ${statsNumbers[3]}%` : `· ${statsAdded[3]} + ${statsNumbers[3]}` : ``}
							`}
						)
						.setFooter({text: `Created by ${issuer.tag}`})
					
					
					return await message.channel.send({embeds: [artgenerated]});
				}
			})
		}
	}

};

function coreGenerateSubstats(artiType, res, statsAdded, percentageChance, statsNumbers, artMainStat) {
	if (artiType == "flower") {
		let flowerStats = res.other;
		let flowerValues = res.values;
		flowerStats.some(thisStat => {
			if (statsAdded.includes(thisStat)) {
				let index = flowerStats.findIndex(ii => ii == thisStat);
				flowerStats.splice(index, 1);
				flowerValues.splice(index, 1);
			}
		});

		let selectStat = percentageChance(flowerStats, flowerValues);
		statsAdded.push(selectStat);
		let selectAmount = percentageChance(data_substats_upgrade.find(stat => stat.name == selectStat).values, [25, 25, 25, 25]);
		statsNumbers.push(selectAmount);
	}

	if (artiType == "feather") {
		let featherStats = res.other;
		let featherValues = res.values;
		featherStats.some(thisStat => {
			if (statsAdded.includes(thisStat)) {
				let index = featherStats.findIndex(ii => ii == thisStat);
				featherStats.splice(index, 1);
				featherValues.splice(index, 1);
			}
		});
		let selectStat = percentageChance(featherStats, featherValues);
		statsAdded.push(selectStat);
		let selectAmount = percentageChance(data_substats_upgrade.find(stat => stat.name == selectStat).values, [25, 25, 25, 25]);
		statsNumbers.push(selectAmount);
	}

	if (artiType == 'sands') {
		let sandsStats = res.other;
		let sandsValues = res.values;
		if (sandsStats.includes("ATK%") && artMainStat == "ATK%") {
			sandsStats[3] = "HP%";
		}
		if (sandsStats.includes("DEF%") && artMainStat == "DEF%") {
			sandsStats[3] = "HP%";
			sandsStats[4] = "ATK%";
		}
		if (sandsStats.includes("Energy Recharge%") && artMainStat == "Energy Recharge%") {
			sandsStats[3] = "HP%";
			sandsStats[4] = "ATK%";
			sandsStats[5] = "DEF%";
		}
		if (sandsStats.includes("Elemental Mastery") && artMainStat == "Elemental Mastery") {
			sandsStats[3] = "HP%";
			sandsStats[4] = "ATK%";
			sandsStats[5] = "DEF%";
			sandsStats[6] = "Energy Recharge%";
		}
		sandsStats.some(thisStat => {
			if (statsAdded.includes(thisStat)) {
				let index = sandsStats.findIndex(ii => ii == thisStat);
				sandsStats.splice(index, 1);
				sandsValues.splice(index, 1);
			}
		});
		let selectStat = percentageChance(sandsStats, sandsValues);
		statsAdded.push(selectStat);
		let selectAmount = percentageChance(data_substats_upgrade.find(stat => stat.name == selectStat).values, [25, 25, 25, 25]);
		statsNumbers.push(selectAmount);
	}

	if (artiType == "goblet") {
		let goblet_other = res.other;
		let goblet_values = res.values;
		let goblet_EPDMGBONUS = res.EPDMGBONUS;
		let goblet_values2 = res.values2;
		// if we get elemetal (pyro, electro etc) DMG bonus or physical, select and that's it
		if (artMainStat == "Pyro DMG Bonus" ||
			artMainStat == "Electro DMG Bonus" ||
			artMainStat == "Cryo DMG Bonus" ||
			artMainStat == "Hydro DMG Bonus" ||
			artMainStat == "Anemo DMG Bonus" ||
			artMainStat == "Geo DMG Bonus" || artMainStat == "Physical DMG Bonus") {
			goblet_EPDMGBONUS.some(thisStat => {
				if (statsAdded.includes(thisStat)) {
					let index = goblet_EPDMGBONUS.findIndex(ii => ii == thisStat);
					goblet_EPDMGBONUS.splice(index, 1);
					goblet_values2.splice(index, 1);
				}
			});
			let selectStat = percentageChance(goblet_EPDMGBONUS, goblet_values2);
			statsAdded.push(selectStat);
			let selectAmount = percentageChance(data_substats_upgrade.find(stat => stat.name == selectStat).values, [25, 25, 25, 25]);
			statsNumbers.push(selectAmount);
		} else {
			// modify based on main stat
			if (goblet_other.includes("ATK%") && artMainStat == "ATK%") {
				goblet_other[3] = "HP%";
			}
			if (goblet_other.includes("DEF%") && artMainStat == "DEF%") {
				goblet_other[3] = "HP%";
				goblet_other[4] = "ATK%";
			}
			if (goblet_other.includes("Elemental Mastery") && artMainStat == "Elemental Mastery") {
				goblet_other[3] = "HP%";
				goblet_other[4] = "ATK%";
				goblet_other[5] = "DEF%";
				goblet_other[6] = "Energy Recharge%";
			}
			goblet_other.some(thisStat => {
				if (statsAdded.includes(thisStat)) {
					let index = goblet_other.findIndex(ii => ii == thisStat);
					goblet_other.splice(index, 1);
					goblet_values.splice(index, 1);
				}
			});
			let selectStat = percentageChance(goblet_other, goblet_values);
			statsAdded.push(selectStat);
			let selectAmount = percentageChance(data_substats_upgrade.find(stat => stat.name == selectStat).values, [25, 25, 25, 25]);
			statsNumbers.push(selectAmount);
		}
	}

	if (artiType == "circlet") {
		let circlet_other = res.other;
		let circlet_CRITRD = res.CRITRD;
		let circlet_HEAL = res.HEAL;
		let circlet_values = res.values;
		let circlet_values2 = res.values2;
		let circlet_values3 = res.values3;
		if (artMainStat == "CRIT Rate%" || artMainStat == "CRIT DMG%") {
			if (circlet_CRITRD.includes("CRIT Rate%") && artMainStat == "CRIT Rate%") {
				circlet_CRITRD[8] = "CRIT DMG%";
			} else if (circlet_CRITRD.includes("CRIT DMG%") && artMainStat == "CRIT DMG%") {
				circlet_CRITRD[8] = "CRIT Rate%";
			}
			circlet_CRITRD.some(thisStat => {
				if (statsAdded.includes(thisStat)) {
					let index = circlet_CRITRD.findIndex(ii => ii == thisStat);
					circlet_CRITRD.splice(index, 1);
					circlet_values2.splice(index, 1);
				}
			});
			let selectStat = percentageChance(circlet_CRITRD, circlet_values2);
			statsAdded.push(selectStat);
			let selectAmount = percentageChance(data_substats_upgrade.find(stat => stat.name == selectStat).values, [25, 25, 25, 25]);
			statsNumbers.push(selectAmount);
		} else if (artMainStat == "Healing Bonus") {
			circlet_HEAL.some(thisStat => {
				if (statsAdded.includes(thisStat)) {
					let index = circlet_HEAL.findIndex(ii => ii == thisStat);
					circlet_HEAL.splice(index, 1);
					circlet_values3.splice(index, 1);
				}
			});
			let selectStat = percentageChance(circlet_HEAL, circlet_values3);
			statsAdded.push(selectStat);
			let selectAmount = percentageChance(data_substats_upgrade.find(stat => stat.name == selectStat).values, [25, 25, 25, 25]);
			statsNumbers.push(selectAmount);
		} else {
			if (circlet_other.includes("ATK%") && artMainStat == "ATK%")
				circlet_other[3] = "HP%";
			if (circlet_other.includes("DEF%") && artMainStat == "DEF%") {
				circlet_other[3] = "HP%";
				circlet_other[4] = "ATK%";
			}
			if (circlet_other.includes("Elemental Mastery") && artMainStat == "Elemental Mastery") {
				circlet_other[3] = "HP%";
				circlet_other[4] = "ATK%";
				circlet_other[5] = "DEF%";
				circlet_other[6] = "Energy Recharge%";
			}
			circlet_other.some(thisStat => {
				if (statsAdded.includes(thisStat)) {
					let index = circlet_other.findIndex(ii => ii == thisStat);
					circlet_other.splice(index, 1);
					circlet_values.splice(index, 1);
				}
			});
			let selectStat = percentageChance(circlet_other, circlet_values);
			statsAdded.push(selectStat);
			let selectAmount = percentageChance(data_substats_upgrade.find(stat => stat.name == selectStat).values, [25, 25, 25, 25]);
			statsNumbers.push(selectAmount);
		}
	}
	let newStats = {
		sa: statsAdded,
		sn: statsNumbers
	}
	return newStats
}

function generateMainStat(artType, artTitle, typeToName, artMainStat, artMainStatValue, artLevel, percentageChance) {
	if (artType == "flower") {
		artTitle = typeToName.flower;
		artMainStat = "HP";
		artMainStatValue = data_mainStats.find(i => i.name == 'HP').values[artLevel];
	}
	if (artType == "feather") {
		artTitle = typeToName.feather;
		artMainStat = "ATK";
		artMainStatValue = data_mainStats.find(i => i.name == 'ATK').values[artLevel];
	}
	if (artType == "sands") {
		artTitle = typeToName.sands;
		artMainStat = percentageChance([
			"HP%",
			"ATK%",
			"DEF%",
			"Energy Recharge%",
			"Elemental Mastery"
		], [
			26.68,
			26.66,
			26.66,
			10,
			10
		]);
		artMainStatValue = data_mainStats.find(i => i.name == artMainStat).values[artLevel];
	}
	if (artType == "goblet") {
		artTitle = typeToName.goblet;
		artMainStat = percentageChance([
			"HP%",
			"ATK%",
			"DEF%",
			"Pyro DMG Bonus",
			"Electro DMG Bonus",
			"Cryo DMG Bonus",
			"Hydro DMG Bonus",
			"Anemo DMG Bonus",
			"Geo DMG Bonus",
			"Physical DMG Bonus",
			"Elemental Mastery"
		], [
			21.25,
			21.25,
			5,
			5,
			5,
			5,
			5,
			5,
			5,
			2.5
		]);
		console.log(artMainStat)
		artMainStatValue = data_mainStats.find(i => i.name == artMainStat).values[artLevel];
	}
	if (artType == "circlet") {
		artTitle = typeToName.circlet;
		artMainStat = percentageChance([
			"HP%",
			"ATK%",
			"DEF%",
			"CRIT Rate%",
			"CRIT DMG%",
			"Healing Bonus%",
			"Elemental Mastery"
		], [
			22,
			22,
			22,
			10,
			10,
			10,
			4
		]);
		console.log("Circlet stat?:"+artMainStat)
		artMainStatValue = data_mainStats.find(i => i.name == artMainStat).values[artLevel];
	}
	return { artTitle, artMainStat, artMainStatValue };
}

