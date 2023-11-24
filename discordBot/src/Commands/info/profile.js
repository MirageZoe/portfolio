/* eslint-disable no-unused-vars */
const mongoose = require('mongoose')
require('mongoose-long')(mongoose);
require("dotenv").config()
const { MessageEmbed, MessageAttachment, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Command = require('../../Structures/Command.js');
const { createCanvas, loadImage } = require('canvas');
const profileSys = require("../../Models/profiles");
const shopData = require("../../Models/profileStore");
const sendError = require('../../Models/Error');
const concat = require('concat-stream');
const path = require("path");
const toml = require('toml');
const fs = require('fs');
const ms = require('ms');
const pms = require("pretty-ms");
const GuildSettings = require('../../Models/GuildSettings.js');
const SharuruEmbed = require('../../Structures/SharuruEmbed.js');
const sharuruConfig = require("../../../config.json")
const { PermissionsBitField } = require('discord.js')
const shopOverlay = {
  notOwned: `https://media.discordapp.net/attachments/768885595228864513/797622678240362516/n.png`,
  owned: `https://media.discordapp.net/attachments/768885595228864513/797618079223513108/available.png`,
  anime: `https://media.discordapp.net/attachments/768885595228864513/797617863631831090/animeCover.png?width=720&height=405`,
  wow: ``,
  nature: ``
}
let shopButtons = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
  .setCustomId(`first`)
  .setLabel(`First Item`)
  .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
  .setCustomId(`back`)
  .setLabel(`Previous Item`)
  .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
  .setCustomId(`buy`)
  .setLabel(`Buy`)
  .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
  .setCustomId(`next`)
  .setLabel(`Next Item`)
  .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
  .setCustomId(`last`)
  .setLabel(`Last Item`)
  .setStyle(ButtonStyle.Secondary)
)

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'profile',
      displaying: true,
      cooldown: 6000,
			description: 'It\'s your profile! Customize to your heart content!',
			options: '\n- \`store/shop\` => Open the shop interface to choose a new background!\n - \`use <id of bg>\` => start using the background you want at the moment!\n - \`titles <no argument/select nr>\` => If you don\'t give an argument, it shows the list of your titles owned. If you put the sub-option "select" as argument & a number corresponding the title, you will set the title to that!\n - \`desc <text>\` => set the description! It can contain up to 180 characters\n - \`color list\` => shows available colors to choose from for text/numbers.\n - \`color code <name of color>\` => Gives you the hex code to be used with \`color\` command.\n - \`color <text/number> <code>\` => Sets the color for text or numbers.',
			usage: 'shop => open  the shop interface!',
			example: ' use 1 => start using the bg with id 1!',
			category: 'info',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
			guildOnly: true,
			ownerOnly: false,
			aliases: ['pf']
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
    const tools = this.client.utils

      // let badges = [
      //   `https://cdn.discordapp.com/attachments/768885595228864513/796808270484340806/early_supporter_badge_25x25.png`,
      //   `https://cdn.discordapp.com/attachments/768885595228864513/796808559081947187/verified_developer_badge_25x25.png`,
      //   `https://cdn.discordapp.com/attachments/768885595228864513/796808182584311819/BalanceLogo_25x25.png`,
      //   `https://cdn.discordapp.com/attachments/768885595228864513/796808173297205288/BrillianceLogo_25x25.png`,
      //   `https://cdn.discordapp.com/attachments/768885595228864513/796808128896172042/BraveryLogo_25x25.png`,
      //   `https://cdn.discordapp.com/attachments/768885595228864513/796807861249245204/bug_hunter_badge_25x25.png`,
      //   `https://cdn.discordapp.com/attachments/768885595228864513/796807771428487198/hypesquad_badge_25x25.png`,
      //   `https://cdn.discordapp.com/attachments/768885595228864513/796805773195214888/new_partner_badge_25x25.png`,
      //   `https://cdn.discordapp.com/attachments/768885595228864513/796805421452230716/staff_badge_25x25.png`,
      //   `https://cdn.discordapp.com/attachments/768885595228864513/796805421452230716/staff_badge_25x25.png`,
      //   `https://cdn.discordapp.com/attachments/768885595228864513/796805421452230716/staff_badge_25x25.png`,
      //   `https://cdn.discordapp.com/attachments/768885595228864513/796805421452230716/staff_badge_25x25.png`
      // ]
    let DiscordBadges = {
      DISCORD_EMPLOYEE: `https://cdn.discordapp.com/attachments/768885595228864513/796805421452230716/staff_badge_25x25.png`,
      PARTNERED_SERVER_OWNER: `https://cdn.discordapp.com/attachments/768885595228864513/796805773195214888/new_partner_badge_25x25.png`,
      HYPESQUAD_EVENTS: `https://cdn.discordapp.com/attachments/768885595228864513/796807771428487198/hypesquad_badge_25x25.png`,
      BUGHUNTER_LEVEL_1: `https://cdn.discordapp.com/attachments/768885595228864513/796807861249245204/bug_hunter_badge_25x25.png`,
      HOUSE_BRAVERY: `https://cdn.discordapp.com/attachments/768885595228864513/796808128896172042/BraveryLogo_25x25.png`,
      HOUSE_BRILLIANCE: `https://cdn.discordapp.com/attachments/768885595228864513/796808173297205288/BrillianceLogo_25x25.png`,
      HOUSE_BALANCE: `https://cdn.discordapp.com/attachments/768885595228864513/796808182584311819/BalanceLogo_25x25.png`,
      EARLY_SUPPORTER: `https://cdn.discordapp.com/attachments/768885595228864513/796808270484340806/early_supporter_badge_25x25.png`,
      BUGHUNTER_LEVEL_2: `https://cdn.discordapp.com/attachments/768885595228864513/796807861249245204/bug_hunter_badge_25x25.png`,
      VERIFIED_BOT: `https://cdn.discordapp.com/attachments/768885595228864513/796808307213467688/verified_bot.JPG`,
      EARLY_VERIFIED_BOT_DEVELOPER: `https://cdn.discordapp.com/attachments/768885595228864513/796808559081947187/verified_developer_badge_25x25.png`,
    }
    let tempBadges = Object.keys(DiscordBadges);
    var colours = { 
      "aliceblue":"#f0f8ff", "antiquewhite":"#faebd7", "aqua":"#00ffff", "aquamarine":"#7fffd4", "azure":"#f0ffff",  "beige":"#f5f5dc", "bisque":"#ffe4c4", "black":"#000000", "blanchedalmond":"#ffebcd", "blue":"#0000ff", "blueviolet":"#8a2be2", "brown":"#a52a2a", "burlywood":"#deb887",  "cadetblue":"#5f9ea0", "chartreuse":"#7fff00", "chocolate":"#d2691e", "coral":"#ff7f50", "cornflowerblue":"#6495ed", "cornsilk":"#fff8dc", "crimson":"#dc143c", "cyan":"#00ffff",  "darkblue":"#00008b", "darkcyan":"#008b8b", "darkgoldenrod":"#b8860b", "darkgray":"#a9a9a9", "darkgreen":"#006400", "darkkhaki":"#bdb76b", "darkmagenta":"#8b008b", "darkolivegreen":"#556b2f",  "darkorange":"#ff8c00", "darkorchid":"#9932cc", "darkred":"#8b0000", "darksalmon":"#e9967a", "darkseagreen":"#8fbc8f", "darkslateblue":"#483d8b", "darkslategray":"#2f4f4f", "darkturquoise":"#00ced1",  "darkviolet":"#9400d3", "deeppink":"#ff1493", "deepskyblue":"#00bfff", "dimgray":"#696969", "dodgerblue":"#1e90ff",  "firebrick":"#b22222", "floralwhite":"#fffaf0", "forestgreen":"#228b22", "fuchsia":"#ff00ff",  "gainsboro":"#dcdcdc", "ghostwhite":"#f8f8ff", "gold":"#ffd700", "goldenrod":"#daa520", "gray":"#808080", "green":"#008000", "greenyellow":"#adff2f", 
      "honeydew":"#f0fff0", "hotpink":"#ff69b4", "indianred ":"#cd5c5c", "indigo":"#4b0082", "ivory":"#fffff0", "khaki":"#f0e68c",  "lavender":"#e6e6fa", "lavenderblush":"#fff0f5", "lawngreen":"#7cfc00", "lemonchiffon":"#fffacd", "lightblue":"#add8e6", "lightcoral":"#f08080", "lightcyan":"#e0ffff", "lightgoldenrodyellow":"#fafad2",  "lightgrey":"#d3d3d3", "lightgreen":"#90ee90", "lightpink":"#ffb6c1", "lightsalmon":"#ffa07a", "lightseagreen":"#20b2aa", "lightskyblue":"#87cefa", "lightslategray":"#778899", "lightsteelblue":"#b0c4de",  "lightyellow":"#ffffe0", "lime":"#00ff00", "limegreen":"#32cd32", "linen":"#faf0e6",  "magenta":"#ff00ff", "maroon":"#800000", "mediumaquamarine":"#66cdaa", "mediumblue":"#0000cd", "mediumorchid":"#ba55d3", "mediumpurple":"#9370d8", "mediumseagreen":"#3cb371", "mediumslateblue":"#7b68ee",        "mediumspringgreen":"#00fa9a", "mediumturquoise":"#48d1cc", "mediumvioletred":"#c71585", "midnightblue":"#191970", "mintcream":"#f5fffa", "mistyrose":"#ffe4e1", "moccasin":"#ffe4b5", "navajowhite":"#ffdead", "navy":"#000080",  "oldlace":"#fdf5e6", "olive":"#808000", "olivedrab":"#6b8e23", "orange":"#ffa500", "orangered":"#ff4500", "orchid":"#da70d6",  "palegoldenrod":"#eee8aa", 
      "palegreen":"#98fb98", "paleturquoise":"#afeeee", "palevioletred":"#d87093", "papayawhip":"#ffefd5", "peachpuff":"#ffdab9", "peru":"#cd853f", "pink":"#ffc0cb", "plum":"#dda0dd", "powderblue":"#b0e0e6", "purple":"#800080",  "rebeccapurple":"#663399", "red":"#ff0000", "rosybrown":"#bc8f8f", "royalblue":"#4169e1",  "saddlebrown":"#8b4513", "salmon":"#fa8072", "sandybrown":"#f4a460", "seagreen":"#2e8b57", "seashell":"#fff5ee", "sienna":"#a0522d", "silver":"#c0c0c0", "skyblue":"#87ceeb", "slateblue":"#6a5acd", "slategray":"#708090", "snow":"#fffafa", "springgreen":"#00ff7f", "steelblue":"#4682b4",   "tan":"#d2b48c", "teal":"#008080", "thistle":"#d8bfd8", "tomato":"#ff6347", "turquoise":"#40e0d0", "violet":"#ee82ee",   "wheat":"#f5deb3", "white":"#ffffff", "whitesmoke":"#f5f5f5", "yellow":"#ffff00", "yellowgreen":"#9acd32" 
    }; 

        const applyText = (canvas, text) => {
            const ctx = canvas.getContext('2d');
        
            // Declare a base size of the font
            let fontSize = 75;
        
            do {
                // Assign the font to the context and decrement it so it can be measured again
                ctx.font = `${fontSize -= 3}px Changa`;
                // Compare pixel width of the text to the canvas minus the approximate avatar size
            } while (ctx.measureText(text).width > canvas.width - 780);
        
            // Return the result to use in the actual canvas
            return ctx.font;
        };
        function SimpleJsonToToml(object) {
          let toString = JSON.stringify(object);
          toString = toString.replace(/(^\{+|\}+$)/gi,'')
          toString = toString.replace(/"/gi,'')
          toString = toString.replace(/:/gi,' = ')
          toString = toString.replace(/,/gi,'\n')
          // console.log(`done:`)
          // console.log(toString)
          return toString
        }
        function convertColor(color) {
          if (typeof colours[color.toLowerCase()] != 'undefined') 
              return colours[color.toLowerCase()]; 
          return rep(`Sadly I don't have this color at the moment, please ask my partner to add this color!`); 
        } 
        function roundedImage(ctx,x,y,width,height,radius){
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        }
        var noSpecial = /[^\u0000-\u00ff]/; // Small performance gain from pre-compiling the regex
        function containsDoubleByte(str) {
            if (!str.length) return false;
            if (str.charCodeAt(0) > 255) return true;
            return noSpecial.test(str);
        }

        function abbreviateNumber(value) {
          let newValue = `${value}`;
          let returnThis = ``
          console.log(newValue)
          if(value > 99999999999){ // above 100 billion
            console.log(`o9`)
            returnThis = newValue.substring(0,3)+" billion"
          } else if(value > 9999999999){// above 10 billion
            console.log(`o8`)
            returnThis = newValue.substring(0,2)+"."+newValue.substring(2,3)+" billion"
          } else if(value > 999999999){ // above 1 billion
            console.log(`o7`)
            returnThis = newValue.substring(0,1)+"."+newValue.substring(1,2)+" billion";
          } else if(value > 99999999){ // above 100k million (100.000.000)
            console.log(`o6`)
            returnThis = newValue.substring(0,3)+" million"
          } else if(value > 9999999){// ABOVE 10k million (10.000.000)
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
          } else {
            returnThis = value
          }
          return returnThis;
        }
        async function applyBadges(canvas,badges) {
            if(badges.length > 8) badges.length = 8;
            let startDistance = 0;
            let x = 800;//280;
            let y = 415;//95
            console.log(`Starting to display, ${badges.length} to add...`)
                let myBadge = await Promise.all(Object.entries(DiscordBadges).filter(([key, value]) => badges.includes(key)).map(([key, value]) => loadImage(value)))
                for(let i = 0; i < myBadge.length; i++){
                    canvas.save();
                    if(startDistance == 4){
                      y += 105
                      startDistance = 0;
                      console.log(`reached 4, new coords ${x + startDistance*110}, ${y}`)
                    }
                    canvas.drawImage(myBadge[i], x + startDistance *110, y, 90 , 90);
                    startDistance++;
                    canvas.restore();
                    console.log(`Applied badge ${i+1}.`)
            }
        }
        const prefix = this.client.prefixes.get(message.guild.id)

        if(args[0] == 'test'){
          //bgAvailabilityInShop
          // shopData.find({},(err,res) =>{
          //   if (err) console.log(err)
          //   if (res) {
          //     for (let i = 0; i < res.length; i++) {
          //       let getItem = res[i]

          //       console.log(`modifying bg ${getItem.bgID}`)
          //       getItem.bgAvailabilityInShop = -1           
          //       res[i].save().catch(err2=> console.log(err2))
          //     }
          //   }
          // })
          console.log(this.client.cooldownCMDS)
          return console.log(`test`)
        }
        if(args[0] == 't' && issuer.id == `186533323403689986`){
          // console.time('test')
          shopData.find({
            bgCategory: args[1]
          },async(err,res)=>{
            if(err) return console.log(err)
            if(res){
              profileSys.findOne({
                userID: issuer.id
              },async(err2,res2)=>{
                if(err2) return console.log(err2)
                // let loading = new MessageAttachment(`https://cdn.discordapp.com/attachments/768885595228864513/798498966483763210/loading.gif`);
                // rep(loading).then(m=>m.delete({timeout: 6500}));
                // const canvas = createCanvas(1920,1080);
                // const ctx = canvas.getContext('2d');
                // const background = await loadImage(`https://cdn.discordapp.com/attachments/768885595228864513/799365873583783956/bgShop.jpg`)
                // const owned = await loadImage(shopOverlay.owned)
                // const notOwned = await loadImage(shopOverlay.notOwned)
                // roundedImage(ctx, 5, 5, 1910, 1070, 10)
                // ctx.clip();
                // ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                // let x = 5;
                // let y = 105;
                // let xMark = 350;
                // let yMark = 150;
                // let xBox = 20;
                // let yBox = 360;
                // let z = 0
                
                // for (let i = 0; i < res.length; i++) {
                //   ctx.save()
                //   if(z == 4){
                //     console.log(`reached 4, reseting....`)
                //     y+= 295;
                //     yBox+= 300;
                //     yMark+= 300
                //     z = 0;
                //   }
                //   console.log(`applying mark ${i}`)
                //   const element = res[i];
                //   const img = await loadImage(element.bgLink)
                //   ctx.drawImage(img, x + 480*z, y, 480, 300)
                //   if(res2.backgroundsOwned.includes(res[i].bgID)){
                //     ctx.drawImage(owned,xMark + 475 * z,yMark, 100, 100);
                //   } else {
                //     ctx.drawImage(notOwned, xMark + 475 * z,yMark, 115, 60);
                //     ctx.fillStyle = "#FFFFFF";
                //     ctx.fillRect(xBox + 480 * z, yBox, 75, 28);
                //     ctx.font = `15px Changa`;
                //     ctx.fillStyle = `#000000`;
                //     ctx.fillText(`ID: ${res[i].bgID}`,xBox + 480 * z,yBox + 13)
                //     ctx.fillText(`Price: ${res[i].bgPrice}`,xBox + 480 * z,yBox + 26)
                //   }
                //   z++;
                //   ctx.restore()
                // }

                //   const attachmentDd = new MessageAttachment(canvas.toBuffer(),`shop.png`)
                //   message.channel.send(attachmentDd)
                //   console.log(`done`)
                //   console.timeEnd(`test`)
              })
            }
          })
          return
        }
        if(args[0] == 'a' && issuer.id == `186533323403689986`){
          fs.createReadStream("./src/Assets/minData.toml",'utf8').pipe(concat((data)=>{
            let parsed = toml.parse(data);
            shopData.create({
                bgID: parsed.bgid,
                bgLink: args[2],
                bgCategory: args[1],
                bgPrice: 1000,
                bgAvailability: -1,
              },(err,res)=>{
                if(err) console.log(err)
                if(res){
                  console.log(`Added ${parsed.bgid - 1} to database!\nType: ${args[1]}`)
                }
              })
            parsed.bgid += 1;
            let newData = SimpleJsonToToml(parsed);
            let mypath = path.join(__dirname,'../../Assets/minData.toml')
            fs.writeFile(mypath,newData,(err,res)=>{
                if(err) return console.log(err)
                if(res) console.log(res)
                console.log(`Done writing!`)
            })
          }));
            return;
        }

        try {
        // if (args[])
            profileSys.findOne({
                userID: issuer.id
            },async(err,res)=>{
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
                      return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                  }
                  if(res) {
                      console.log(`successfully added error to database!`)
                  }
              })
              }
              if(res){
                let myXp = res.servers_data.get(message.guild.id) ? res.servers_data.get(message.guild.id).exp : 1//res.exp
                let myLevel = res.servers_data.get(message.guild.id) ? res.servers_data.get(message.guild.id).level : 1
                let myMoney = res.servers_data.get(message.guild.id) ? res.servers_data.get(message.guild.id).money : 1
                if(args[0] == `color`){
                  if(!args[1]) return rep(`What you wanna do more specifically? You can choose between:\n- list => shows available colors;\n- code <color name> => gives the code of the color you said;\n- text <color code> => set the color of your text on profile;\n- numbers <color code> => set the color of your numbers on profile;!`).then(m=>tools.deleteMsg(m,'3.5s'))
                  if(args[1] == `list`){
                    return rep(`This are the colors that I know so far:\n\n-${Object.keys(colours).join(`\n-`)}`)
                  }
                  if(args[1] == `code`){
                    let color = args[2]
                    if(!color) return rep(`You want the color of what exactly? Choose from \`${prefix}profile color list\``)
                    let giveCode = convertColor(color)
                    return rep(`This should be your color hex code if I'm not mistaken: ${giveCode}! Use **${prefix}profile color \`text/numbers\` <code>**`)
                  }
                  if(args[1] == `text`){
                    if(!args[2]) return rep(`you forgot to write a color code!`)
                    if(!/^#[0-9A-F]{6}$/i.test(args[2])) return rep(`please give me a valid hex color code!`).then(m=> tools.deleteMsg(m,'3.5s'))
                      res.textColor = args[2]
                  }
                  if(args[1] == `numbers`){
                    if(!args[2]) return rep(`you forgot to write a color code!`)
                    if(!/^#[0-9A-F]{6}$/i.test(args[2])) return rep(`please give me a valid hex color code!`).then(m=>tools.deleteMsg(m,'3.5s'))
                      res.numberColor = args[2]
                  }
                  res.save().catch(err=>console.log(err))
                  return rep(`Done! I have set the ${args[1]} color to \`${args[2]}\`!`).then(m=>tools.deleteMsg(m,'3.5s'))
                }
                if(args[0] == `use`){
                  if(isNaN(args[1])) return rep(`this is not a number, make sure you type a number!`)
                  if(res.backgroundsOwned.includes(args[1])){
                    shopData.findOne({
                      bgID: args[1]
                    },(err2,res2)=>{
                      if(err2) return console.log(err2)
                      if(res2) {
                        res.backgroundSelected = res2.bgLink;
                        res.save().catch(err=>console.log(err))
                        return rep(`done! I have set your new background!`)
                      }
                    })
                  } else {
                    return rep(`You don't have this background in your inventory.`)
                  }
                  return;
                }
                if(args[0] == 'store' || args[0] == `shop`){
                  let shopEmbed = new MessageEmbed()
                  .setTitle(`Profile Background Shop! ತ_ತ`)
                  .setColor("LUMINOUS_VIVID_PINK")
                  let dataShop = this.client.profileShopClients

                  // handle if user closes earlier
                  if (args[1] == "close") {
                    if (dataShop.has(issuer.id)) {
                    shopEmbed.setDescription(`Okay I've closed the shop window at ${issuer.tag} request!`)
                        .setFooter(`Requested by ${issuer.tag}`)
                        .setColor("LUMINOUS_VIVID_PINK")
                        let test2 = this.client.timeouts.get(`profile_${issuer.id}`);
                        test2.trigger();
                    } else {
                    shopEmbed.setDescription(`You didn't open a shop window yet so nothing to close!`)
                        .setFooter(`Requested by ${issuer.tag}`)
                        .setColor("LUMINOUS_VIVID_PINK")
                    }
                    return rep("",shopEmbed,true,"10s")
                  }

                  if (dataShop.has(issuer.id)) {
                    shopEmbed.setDescription(`You already have a shop opened [[here](https://discord.com/channels/${dataShop.get(issuer.id).shopLocation.guildID}/${dataShop.get(issuer.id).shopLocation.channelID}/${dataShop.get(issuer.id).shopLocation.messageID})]! \nYou can open another one after the current one expired!`)
                    .setFooter(`Requested by ${issuer.tag} | ヽ(ಠ_ಠ)ノ`)
                    return rep("",shopEmbed,true,"10s")
                  }
                  shopData.find({},(err,res2) =>{
                    if (err) {
                      sendError.create({
                        Guild_Name: message.guild.name,
                        Guild_ID: message.guild.id,
                        User: issuer.tag,
                        UserID: issuer.id,
                        Error: err,
                        Time: `${TheDate} || ${clock} ${amORpm}`,
                        Command: this.name + " profile store command",
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
                    if (res2) {
                      let bgGenres = Array.from(res2.map(it => it.bgCategory).values())
                      bgGenres = new Set(bgGenres)
                      let bgs = new Map();
                      for (const x of bgGenres) {
                        bgs.set(x,[])
                      }
                      for (const y of bgs.keys()) {
                        let things = bgs.get(y)
                        things = res2.filter(item => item.bgCategory == y)
                        bgs.set(y,things)
                      }
                      shopEmbed.setDescription(`Hello dear customer! Please select a category from existent ones by typing it's name:\n\n${Array.from(bgGenres.values()).join(",\n")}`)
                      .setFooter(`Requested by ${issuer.tag} || You have 1 minute to choose!`)
                      let filter = m => m.author.id === issuer.id
                      message.channel.send({embeds:[shopEmbed]}).then(m => {
                        m.channel.awaitMessages({filter,max: 1, time: 60000, errors:['time']}).then(collected =>{
                          let choice = collected.first().content?.toLowerCase();
                          collected.first().delete()
                          if (choice == 'cancel')
                            return rep(`Ok, you changed your mind.`,false, true,"3.5s")
                          
                          if (!bgGenres.has(choice)) 
                            return rep(`There is no such a category! Please retry again after checking the category name you wish to write!`,false,true,"7.5s")

                          let bgRefs = bgs.get(choice);
                          shopEmbed.setDescription(`ID: ${bgRefs[0].bgID}\nPrice: ${bgRefs[0].bgPrice}\nTemporary [[?](https://www.google.com "This is referring to the amount of time the backgrond remains after purchase. After the time passed, the background will expire and you will have to purchase it again!")]: ${checkAvailability(bgRefs[0].bgAvailability)}\nAvailability [[?](http://www.google.com "The time this background will remain available to purchase. After the time is gone, it will magically vanish!")]: ${checkAvailability(bgRefs[0].bgAvailabilityInShop)}`)
                          .setImage(bgRefs[0].bgLink)
                          .setTitle(`Profile Background Shop: ${choice} category!`)
                          .setFooter(`Requested by ${issuer.tag}`)
                          if (res.backgroundsOwned.includes(bgRefs[0].bgID)) {
                            shopButtons.components.find(item => item.customId == "buy").label = "Owned"; 
                            shopButtons.components.find(item => item.customId == "buy").disabled = true; 
                          }
                          
                          message.channel.send({embeds: [shopEmbed],components: [shopButtons]}).then(shopMSG =>{
                              m.delete()
                              let shopData = {
                                user: issuer.id,
                                stage: "profileShop",
                                currentState: `in_category`,
                                bgsData: bgs,
                                bgsOwned: res.backgroundsOwned,
                                currentCategory: choice,
                                currentPosition: 0,
                                shopLocation: {
                                  messageID: shopMSG.id,
                                  channelID: message.channel.id,
                                  guildID: message.guild.id
                                } 
                              }
                            this.client.profileShopClients.set(issuer.id,shopData);

                            let testTime2 = newTimeout(() =>{
                              if (this.client.profileShopClients.has(issuer.id))
                                this.client.profileShopClients.delete(issuer.id)
                                shopEmbed.setDescription(`This shop window has exceeded the time allowed to browse and now it's inactive! If you wish to shop again, retry the command!`)
                                .setTitle(`૮ ˶ᵔ ᵕ ᵔ˶ ა Thank you for shopping! See ya another time!  ପ(๑•ᴗ•๑)ଓ ♡`)
                                .setFooter(`Requested by ${issuer.tag} | ૮ • ﻌ - ა | ૮꒰ ˶• ༝ •˶꒱ა`)
                                .setColor("LUMINOUS_VIVID_PINK")
                                shopMSG.edit({embeds: [shopEmbed], components: [], attachments: []})
                            }, process.env.PROFILE_SHOP_WINDOWTIME)
                            // let testTime = setTimeout(() => {
                            //   if (this.client.profileShopClients.get(issuer.id))
                            //       this.client.profileShopClients.delete(issuer.id)
                            //     shopEmbed.setDescription(`This shop window has exceeded the time allowed to browse and now it's inactive! If you wish to shop again, retry the command!`)
                            //     .setTitle(`૮ ˶ᵔ ᵕ ᵔ˶ ა Thank you for shopping! See ya another time!  ପ(๑•ᴗ•๑)ଓ ♡`)
                            //     .setFooter(`Requested by ${issuer.tag} | ૮ • ﻌ - ა | ૮꒰ ˶• ༝ •˶꒱ა`)
                            //     .setColor("LUMINOUS_VIVID_PINK")
                            //     shopMSG.edit({embeds: [shopEmbed], components: [], attachments: []})
                            // }, process.env.PROFILE_SHOP_WINDOWTIME);
                            this.client.timeouts.set(`profile_${issuer.id}`,testTime2);
                          });
                          
                        }).catch(err2 =>{
                          console.log(`[Profile-shop]: It seems like ${issuer.tag} (${message.guild.id}) didn't type in time`)
                          shopEmbed.setDescription(`Dear customer, it seems like you either forgot or didn't choose in time a category! The window is now inactive and you will have to retype the command!`)
                          .setFooter(`Requested by ${issuer.tag}`)
                          m.edit({embeds: [shopEmbed]})
                        }) //collect msg
                      })//send msg

                    }
                  })//search db
                  return
                }

                if(args[0] == 'badges'){
                  let badgeEmbed = new SharuruEmbed()

                  if (!res.badges) {
                    res.badges.list = []
                    res.badges.currentBadges = []
                  }
                  if (!args[1]) {
                    let badgeList = []
                    if (res.badges.list.length > 0) {
                      for (let i = 0; i < res.badges.list.length; i++) {
                        const element = res.badges.list[i];
                        badgeList.push(`${i+1}) ${element}`)
                      }
                      badgeEmbed.setTitle(`A list of badges owned by ${issuer.tag}`)
                      .setColor(`LUMINOUS_VIVID_PINK`)
                      .setFooter(`Requested by ${issuer.tag}`)
                      .setDescription(badgeList.join(",\n"))
                      .addField(sharuruConfig.extra.emptyField,sharuruConfig.extra.emptyField)
                      .addField(`In order to equip a badge, you will have to use the following:`,
                      `\`${prefix}profile badges select #badgeNumber\`\n\nWhereas the \`#badgesNumber\` corresponds to the number of the badge you wish to equip!\n\nP.S: Do the same if u wish to un-equip one you have already equipp ed!`)
                    } else {
                      badgeEmbed.setTitle(`A list of badges owned by ${issuer.tag}`)
                      .setColor(`LUMINOUS_VIVID_PINK`)
                      .setFooter(`Requested by ${issuer.tag}`)
                      .setDescription(`Sadly, you don't own any badge at the moment. When you receive a badge, it will appear here!`)
                    }
                    return rep("",badgeEmbed);
                  }
                  if (args[1] == "select") {
                      let choice = Number(args[2]) - 1;
                      if (res.badges.list.length == 0) {
                        badgeEmbed.setTitle(`A list of badges owned by ${issuer.tag}`)
                          .setColor(`LUMINOUS_VIVID_PINK`)
                          .setFooter(`Requested by ${issuer.tag}`)
                          .setDescription(`Sadly, you don't own any badge at the moment. When you receive a badge, it will appear here!`)
                        return rep("",badgeEmbed,true,"15s");
                      }
                      if (choice < 0 || choice > res.badges.list.length) {
                        badgeEmbed.setTitle(`A list of badges owned by ${issuer.tag}`)
                          .setColor(`LUMINOUS_VIVID_PINK`)
                          .setFooter(`Requested by ${issuer.tag}`)
                          .setDescription(`You provided a number that is either lower than 1 or higher than the total size of your badges! Make sure you provide a number that's assigned to a badge you own!`)
                        return rep("",badgeEmbed,true,"15s");
                      }
                      res.badges.currentTitle = res.badges.list[choice];
                      res.save().catch(err2 => console.log(err2));
                      badgeEmbed.setTitle(`A list of badges owned by ${issuer.tag}`)
                          .setColor(`LUMINOUS_VIVID_PINK`)
                          .setFooter(`Requested by ${issuer.tag}`)
                          .setDescription(`Congrats! You have equipped the following badge: \`${res.badges.list[choice]}\``)
                        return rep("",badgeEmbed,true,"15s");
                  }
                  return;
                }
                //#region Create Canvas & apply the bg img with the name

                const canvas = createCanvas(1280,720); //old 429/291
                const ctx = canvas.getContext('2d');
                const background = await loadImage(res.backgroundSelected)//loadImage(path.join(__dirname,`../../Assets/profileBG.png`));
                const grad_bg = await loadImage(path.join(__dirname,`../../Assets/profileAddons/grad_box.png`));

                let getmember = message.guild.members.cache.get(issuer.id)
                let userName = getmember.nickname != null ? getmember.nickname : issuer.username
                if(containsDoubleByte(userName)) userName = `Random Member`

                //image rounded
                roundedImage(ctx, 5, 5, 1270, 710, 10)//old 419/281
                ctx.clip();
                ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                ctx.drawImage(grad_bg, 0, 0, canvas.width, canvas.height)

                ctx.font = applyText(canvas, `${userName}`)
                ctx.fillStyle = res.textColor;
                ctx.fillText(`${userName}`,30, 240)
                ctx.save();
                //#endregion

                if(args[0] == 'titles'){
                  let titleEmbed = new SharuruEmbed()

                  if (!args[1]) {
                    let titleList = []
                    if (res.title.list.length > 0) {
                      for (let i = 0; i < res.title.list.length; i++) {
                        const element = res.title.list[i];
                        titleList.push(`${i+1}) ${element}`)
                      }
                      titleEmbed.setTitle(`A list of titles owned by ${issuer.tag}`)
                      .setColor(`LUMINOUS_VIVID_PINK`)
                      .setFooter(`Requested by ${issuer.tag}`)
                      .setDescription(titleList.join(",\n"))
                      .addField(sharuruConfig.extra.emptyField,sharuruConfig.extra.emptyField)
                      .addField(`In order to equip a title, you will have to use the following:`,
                      `\`${prefix}profile titles select #titleNumber\`\n\nWhereas the \`#titleNumber\` corresponds to the title you wish to equip!`)
                    } else {
                      titleEmbed.setTitle(`A list of titles owned by ${issuer.tag}`)
                      .setColor(`LUMINOUS_VIVID_PINK`)
                      .setFooter(`Requested by ${issuer.tag}`)
                      .setDescription(`Sadly, you don't own any title at the moment. When you receive a title, it will appear here!`)
                    }
                    return rep("",titleEmbed);
                  }
                  if (args[1] == "select") {
                      let choice = Number(args[2]) - 1;
                      if (res.title.list.length == 0) {
                        titleEmbed.setTitle(`A list of titles owned by ${issuer.tag}`)
                          .setColor(`LUMINOUS_VIVID_PINK`)
                          .setFooter(`Requested by ${issuer.tag}`)
                          .setDescription(`Sadly, you don't own any title at the moment. When you receive a title, it will appear here!`)
                        return rep("",titleEmbed,true,"15s");
                      }
                      if (choice < 0 || choice > res.title.list.length) {
                        titleEmbed.setTitle(`A list of titles owned by ${issuer.tag}`)
                          .setColor(`LUMINOUS_VIVID_PINK`)
                          .setFooter(`Requested by ${issuer.tag}`)
                          .setDescription(`You provided a number that is either lower than 1 or higher than the total size of your titles! Make sure you provide a number that's assigned to a title you own!`)
                        return rep("",titleEmbed,true,"15s");
                      }
                      res.title.currentTitle = res.title.list[choice];
                      res.save().catch(err2 => console.log(err2));
                      titleEmbed.setTitle(`A list of titles owned by ${issuer.tag}`)
                          .setColor(`LUMINOUS_VIVID_PINK`)
                          .setFooter(`Requested by ${issuer.tag}`)
                          .setDescription(`Congrats! You have equipped the following title: \`${res.title.list[choice]}\``)
                        return rep("",titleEmbed,true,"15s");
                  }
                  return;
                }
                if(args[0] == 'desc'){
                  let desc = args.slice(1).join(" ")//3.72
                  if(ctx.measureText(desc).width > 240 * 3.32) return rep(`That description is a bit too much! You're allowed to a total of 180 characters!`);
                  res.description2 = desc
                  res.save().catch(err=>console.log(err))
                  return rep(`done`)
                }

                //#region Draw a rectangle & add Avatar Inside
                // roundRect(ctx, 189, 90, 75, 75)
                const avatar = await loadImage(issuer.displayAvatarURL({dynamic: true, format: "png"}));
                let radius = 10;
                ctx.save();
                ctx.beginPath();
                ctx.strokeStyle = `black`;
                ctx.lineWidth = 2;
                ctx.moveTo(691,200);
                // right line
                ctx.arcTo(720, 200, 720, 400,radius); // TRC-BRC
                // bottom line
                ctx.arcTo(720, 400, 520, 400,radius); // BRC-BLC
                // left line
                ctx.arcTo(520, 400, 520, 200,radius); // BLC-TLC
                // top line
                ctx.arcTo(520, 200, 720, 200,radius); // TLC-TRC 
                ctx.closePath();
                ctx.stroke();
                ctx.clip();
                ctx.drawImage(avatar, 520, 200, 200, 200);//placement: TLC

                ctx.restore();
                //#endregion
                
                //#region Draw a circle for level and fill it
                let limitXP = 1000
                GuildSettings.findOne({
                  ID: message.guild.id
                },(err2,res2)=>{
                  if (err2){
                    sendError.create({
                    Guild_Name: message.guild.name,
                    Guild_ID: message.guild.id,
                    User: issuer.tag,
                    UserID: issuer.id,
                    Error: err2,
                    Time: `${TheDate} || ${clock} ${amORpm}`,
                    Command: this.name+" guild settings search",
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
                  if (res2) {
                    limitXP = res2.systems.exp.expLimit;
                  }
                })

                // let findNumber = percentageProvided / 100;
                // let finalAnswer = findNumber * initialNumber

                //what Percent of X is Y? => Y/X = P*100
                let findPercentage = ( myXp / limitXP)*100; 

                //find out % in PI;
                let myPI = Math.PI * 2; //100%
                let findNumber = Number((findPercentage).toFixed(2)) / 100;
                let finalAnswer = findNumber * myPI
                //loading circle experience
                ctx.beginPath();
                ctx.strokeStyle = 'black'
                ctx.lineWidth = 4.5//1.3
                ctx.arc(1000,200,154,0,Math.PI * 2,false);//390 (79.4),252 (86.6), 22   //// 1020
                ctx.arc(1000,200,105,0,Math.PI * 2,false);//390,252, 15
                ctx.stroke();
                ctx.closePath();
                ctx.beginPath();
                ctx.strokeStyle = `#52ff4a`;//52ff4a
                ctx.lineWidth = 30.5;//5.5
                ctx.arc(1000,200,129.5,0, finalAnswer,false);//390,252,18.5
                ctx.stroke();
                ctx.closePath();
                //#endregion
                
                //#region Display level in circle
                ctx.font = `84px Changa`;
                ctx.fillText(`Lv.`,950,200) // 378,256
                ctx.fillStyle = res.numberColor;//52ff4a
                ctx.font = `64px Changa`;
                if (myLevel < 10)
                  ctx.fillText(myLevel,975,270)
                if (myLevel > 10)
                  ctx.fillText(myLevel,955,270)
                ctx.fillStyle = res.textColor;//52ff4a
                //#endregion
                ctx.font = 'italic 40px Arial';//changa
                if(res.title.currentTitle != ""){ // title
                  let title = res.title.currentTitle.trim();
                  let space = 0;
                  let desc1_1 = ``;
                  while(!title.length == 0){
                      desc1_1 = desc1_1 + title.substr(0,1);
                      title = title.substr(1);
                      if(ctx.measureText(desc1_1).width > 440) {
                        if(title.length > 0 && desc1_1[desc1_1.length-1] != ' ' && title[0] != ' ') desc1_1 = desc1_1 + `-`;
                        ctx.fillText(desc1_1, 30, 320 + space * 35);//15
                        title = title.trim();
                        space++;
                        desc1_1 = ``;
                      }
                  }
                  ctx.fillText(desc1_1, 30, 320 + space * 35);
                }
                ctx.font = '50px Changa'
                if(res.description2){ // desc
                  ctx.font = '35px Changa'
                  ctx.fillText("About me", 30, 400) // to do: about me title and add the text of about me in a box? 
                  //#region draw a box for desc
                  let radius = 10;
                  ctx.save();
                  ctx.beginPath();
                  ctx.strokeStyle = `white`;
                  ctx.lineWidth = 2;
                  ctx.moveTo(700,405);
                  // right line
                  ctx.arcTo(720, 405, 720, 660,radius); // TRC-BRC
                  // bottom line
                  ctx.arcTo(720, 660, 27, 660,radius); // BRC-BLC
                  // left line
                  ctx.arcTo(27, 660, 27, 405,radius); // BLC-TLC
                  // top line
                  ctx.arcTo(27, 405, 720, 405,radius); // TLC-TRC 
                  ctx.closePath();
                  ctx.stroke();
                  ctx.clip();
                  ctx.restore();
                  //#endregion                  
                  ctx.font = '45px Changa'
                  let desc2 = res.description2.trim();
                  let space = 0;
                  let desc2_2 = ``;
                  while(!desc2.length == 0){
                      desc2_2 = desc2_2 + desc2.substr(0,1);
                      desc2 = desc2.substr(1);
                      if(ctx.measureText(desc2_2).width > 650) {
                        if(desc2.length > 0 && desc2_2[desc2_2.length-1] != ' ' && desc2[0] != ' ') desc2_2 = desc2_2 + `-`;
                        ctx.fillText(desc2_2, 30, 450 + space * 40);
                        desc2 = desc2.trim();
                        space++;
                        desc2_2 = ``;
                      }
                  }
                  ctx.fillText(desc2_2, 30, 450 + space * 40);
                }
                let bgURLDATA = canvas.toDataURL()
                let data = bgURLDATA.replace(/^data:image\/\w+;base64,/, "");
                let buf = new Buffer.from(data, 'base64');
                //#region Write to disk and apply badges
                fs.writeFile(`./src/Assets/temp/${issuer.id}.png`, buf, async(err,res2)=>{
                  if(err) console.log(err)
                  // if (res2) {
                    console.log(`done loading img`)
                    const canvas2 = createCanvas(1280,720);
                    const ctx2 = canvas2.getContext('2d');
                    const background2 = await loadImage(path.join(__dirname,`../../Assets/temp/${issuer.id}.png`));
                    ctx2.drawImage(background2, 0, 0, canvas2.width, canvas2.height);
                    console.time('test')
                    if(res.badges.currentBadges.length > 0) await applyBadges(ctx2,res.badges.currentBadges)
                    console.timeEnd('test')
                    const attachmentD = new MessageAttachment(canvas2.toBuffer(), 'profile.png')
                    message.channel.send({files: [attachmentD]})
                    console.log(`sent message`)
                    let thispath = `./src/Assets/temp/${issuer.id}.png`
                    fs.unlink(thispath, (err)=>{
                      if(err){return console.log(err)}
                      console.log(`The file should be removed now!`)
                    })
                  // }
                });
                //#endregion
              } else {
                message.channel.send(`I made your profile, please re-use the command to see it!`).then(m=> tools.deleteMsg(m,'3.5s'))
                let newMap = new Map()
                let newobj = {
                  exp: 0,
                  money: 1000,
                  level: 1,
                  loan: 0,
                  loanTurns: 0,
                  guildName: message.guild.name
                }
                newMap.set(message.guild.id,newobj)
                  profileSys.create({
                    username: issuer.tag,
                    userID: issuer.id,
                    guildID: message.guild.id,
                    guildName: message.guild.name,
                    backgroundsOwned: [`13`],
                    backgroundSelected: `https://cdn.discordapp.com/attachments/768885615759982634/799379961483231272/na_1.jpg`,
                    servers_data: newMap
                  },(err,res)=>{
                    if(err) console.log(err)
                    if(res){
                      console.log(res)
                      console.log(`done!`)
                    }
                  })
              }
            })
            
        } catch (error) {
            console.log(error)
        }
        /**
         * 
         * @param {string} msg the message to send
         * @param {MessageEmbedded} embed the embed to send
         * @param {Boolean} deleteAfter if you want to delete, true/false
         * @param {string/number} timeout the time after which to delete
         */
        function rep(msg,embed,deleteAfter,timeout) {
          let thismsg;
          if (embed) {
            thismsg = message.channel.send({embeds: [embed]})
          } else {
            thismsg = message.channel.send(`<@${issuer.id}>, `+msg)
          }
          if (deleteAfter) {
            setTimeout(() => {
              thismsg.then(m =>m.delete())
            }, ms(timeout));
          }
        }
        function checkAvailability(time) {
          if (time == -1 || time == 0) return "Forever"
          if (time > 0) return `${pms(time,{verbose: true})}`
        }

        /**
         * A custom function using timeout which includes a new method "trigger()" to end earlier the timeout than anticipated.
         * @param {Object} handler The function to be triggered after the delay ended.
         * @param {Number} delay The time (in milliseconds) which the handler is set to be executed after.
         * @returns The handler triggered earlier by using "trigger()" function.
         */
        let newTimeout = (handler, delay) => {
          let id = setTimeout(handler, delay), clear = clearTimeout.bind(null, id);
          return {id, clear, trigger: () => (clear(), handler())};
      };
	}

};
