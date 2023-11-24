/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const { PermissionsBitField } = require('discord.js');
const querystring = require('querystring');
const r2          = require('r2');
const DOG_API_URL   = "https://api.thedogapi.com/"
const DOG_API_KEY   = process.env.DOG_API_KEY;
const fs = require('fs');
const ms = require('ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'dog',
			displaying: true,
			description: 'Doggos!',
			// options: '',
			// usage: '',
			// example: '',
			category: 'fun',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
			guildOnly: true,
			ownerOnly: false,
			aliases: ['doggo']
		});
	}

	async run(message, args) {
		// eslint-disable-next-line id-length

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
		console.log(DOG_API_KEY)
		
		async function loadImage(sub_id){
			// you need an API key to get access to all the iamges, or see the requests you've made in the stats for your account
			var headers = {
			'X-API-KEY': DOG_API_KEY,
			}
			var query_params = {
			'has_breeds':true, // we only want images with at least one breed data object - name, temperament etc
			'mime_types':'jpg,png', // we only want static images as Discord doesn't like gifs
			'size':'small',   // get the small images as the size is prefect for Discord's 390x256 limit
			'sub_id': sub_id, // pass the message senders username so you can see how many images each user has asked for in the stats
			'limit' : 1       // only need one
			}
			// convert this obejc to query string 
			let queryString = querystring.stringify(query_params);

			try {
			// construct the API Get request url
			let _url = DOG_API_URL + `v1/images/search?${queryString}`;
			// make the request passing the url, and headers object which contains the API_KEY
			var response = await r2.get(_url , {headers} ).json
			} catch (e) {
			console.log(e)
			}
			return response;
		}
		async function messageRecieved(message) {
			try{
			// pass the name of the user who sent the message for stats later, expect an array of images to be returned.
			var images = await loadImage(message.author.username);
			
			// get the Image, and first Breed from the returned object.
			var image = images[0];
			var breed = image.breeds[0];
			
			console.log('message processed','showing',breed)
			// use the *** to make text bold, and * to make italic
			// message.channel.send( "***Name:"+breed.name +"***\r"+"*Life time:"+breed.life_span+"*"+"\r*Temperament:"+breed.temperament+"*", { files: [ image.url ] } );
			// if you didn't want to see the text, just send the file
			let cEmbed = new MessageEmbed()
					.setColor(`RANDOM`)
					.setAuthor(`You got a doggo!!`, message.guild.iconURL())
					.setImage(image.url)
					.setDescription(`
					${breed.name ? `**Name**: *${breed.name}*` : `**Name**: *No data*`}
					${breed.bred_group ? `**Family**: *${breed.bred_group}*` : `**Family**: *No data*`}
					${breed.bred_for ? `**Bred for**: *${breed.bred_for}*` : `**Bred for**: *No data*`}
					${breed.life_span ? `**Life time**: *${breed.life_span}*` : `**Life time**: *No data*`}
					${breed.temperament ? `**Temperament**: *${breed.temperament}*` : `**Temperament**: *No data*`}
					${breed.weight ? `**Weight**: *${breed.weight.imperial} (imperial) | ${breed.weight.metric} (metric)*` : `**Weight**: *No data*`}
					${breed.height ? `**Height**: *${breed.height.imperial} (imperial) | ${breed.height.metric} (metric)*` : `**Height**: *No data*`}`)
					.setTimestamp()
					.setFooter(`Requested by ${issuer.tag} at `,issuer.displayAvatarURL({dynamic: true}))
			
						message.channel.send({embeds: [cEmbed]})
			
			}catch(error)
			{
			console.log(error)
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
					return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
				}
				if(res) {
					console.log(`successfully added error to database!`)
				}
			})
			}
		}
		messageRecieved(message)
	}

};
