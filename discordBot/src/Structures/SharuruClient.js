const { Client, Collection, GatewayIntentBits, Partials, PermissionsBitField } = require('discord.js');
const Util = require('./Util.js');

module.exports = class SharuruClient extends Client {

	constructor(options = {}) {
		super({
			allowedMentions: {parse: ['users','roles'], repliedUser: true},
			//partials: ['MESSAGE','CHANNEL','REACTION'],
			retryLimit: 5,
			//declare intents if needed | old intents initialization from v13 and down
			//intents: ["GUILD_PRESENCES","GUILDS","GUILD_MESSAGES","GUILD_MESSAGE_REACTIONS","GUILD_INVITES","GUILD_EMOJIS_AND_STICKERS","GUILD_MEMBERS"]
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildInvites,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildPresences,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.GuildVoiceStates,
				GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.GuildEmojisAndStickers,
			],
			partials: [Partials.Message, Partials.Channel, Partials.Reaction]
		});
		this.validate(options);

		this.commands = new Collection();
		
		this.slashCommands = new Collection();

		this.aliases = new Collection();

		this.events = new Collection();

		this.utils = new Util(this);

		this.owners = options.owners;

		let clock = new Date();
		const ss = String(clock.getSeconds()).padStart(2, '0');
		const min = String(clock.getMinutes()).padStart(2, '0');
		const hrs = String(clock.getHours()).padStart(1, '0');
		clock = `${hrs}:${min}:${ss}`;

		let TheDate = new Date();
		const zilelesaptamanii = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		const weekday = zilelesaptamanii[TheDate.getDay()];
		const dd = String(TheDate.getDate()).padStart(2, '0');
		const mon = String(TheDate.getMonth() + 1);
		const year = String(TheDate.getFullYear()).padStart(4, '00');
		TheDate = `${weekday}, ${mon}/${dd}/${year}`;

		let amORpm;
		if (hrs >= 0 && hrs <= 12) {
			amORpm = 'AM';
		} else {
			// eslint-disable-next-line no-unused-vars
			amORpm = 'PM';
		}
	}

	validate(options) {
		if (typeof options !== 'object') throw new TypeError(`Options should be a type of Object. Currently it's ${typeof options}`);

		if (!options.token) throw new Error('Please add a token for the client!');
		this.token = options.token;

		if (!options.prefix) throw new Error('Please add a prefix for the client!');
		if (typeof options.prefix !== 'string') throw new TypeError(`Prefix should be a type of string! Currently ${typeof options.prefix}!`);
		this.prefix = options.prefix;

		if (!options.defaultPerms) throw new Error('You must pass default perms(s) for the Client.');
		this.defaultPerms = new PermissionsBitField(this.convertPerm(options.defaultPerms)).freeze()//new Permissions(options.defaultPerms).freeze();
	}

	convertPerm(perm) {
		const { PermissionsBitField } = require("discord.js")
		const oldPerms = {
			CREATE_INSTANT_INVITE: PermissionsBitField.Flags.CreateInstantInvite,
			KICK_MEMBERS: PermissionsBitField.Flags.KickMembers,
			BAN_MEMBERS: PermissionsBitField.Flags.BanMembers,
			ADMINISTRATOR: PermissionsBitField.Flags.Administrator,
			MANAGE_CHANNELS: PermissionsBitField.Flags.ManageChannels,
			MANAGE_GUILD: PermissionsBitField.Flags.ManageGuild,
			ADD_REACTIONS: PermissionsBitField.Flags.AddReactions,
			VIEW_AUDIT_LOG: PermissionsBitField.Flags.ViewAuditLog,
			PRIORITY_SPEAKER: PermissionsBitField.Flags.PrioritySpeaker,
			STREAM: PermissionsBitField.Flags.Stream,
			VIEW_CHANNEL: PermissionsBitField.Flags.ViewChannel,
			SEND_MESSAGES: PermissionsBitField.Flags.SendMessages,
			SEND_TTS_MESSAGES: PermissionsBitField.Flags.SendTTSMessages,
			MANAGE_MESSAGES: PermissionsBitField.Flags.ManageMessages,
			EMBED_LINKS: PermissionsBitField.Flags.EmbedLinks,
			ATTACH_FILES: PermissionsBitField.Flags.AttachFiles,
			READ_MESSAGE_HISTORY: PermissionsBitField.Flags.ReadMessageHistory,
			MENTION_EVERYONE: PermissionsBitField.Flags.MentionEveryone,
			USE_EXTERNAL_EMOJIS: PermissionsBitField.Flags.UseExternalEmojis,
			VIEW_GUILD_INSIGHTS: PermissionsBitField.Flags.ViewGuildInsights,
			CONNECT: PermissionsBitField.Flags.Connect,
			SPEAK: PermissionsBitField.Flags.Speak,
			MUTE_MEMBERS: PermissionsBitField.Flags.MuteMembers,
			DEAFEN_MEMBERS: PermissionsBitField.Flags.DeafenMembers,
			MOVE_MEMBERS: PermissionsBitField.Flags.MoveMembers,
			USE_VAD: PermissionsBitField.Flags.UseVAD,
			CHANGE_NICKNAME: PermissionsBitField.Flags.ChangeNickname,
			MANAGE_NICKNAMES: PermissionsBitField.Flags.ManageNicknames,
			MANAGE_ROLES: PermissionsBitField.Flags.ManageRoles,
			MANAGE_WEBHOOKS: PermissionsBitField.Flags.ManageWebhooks,
			MANAGE_EMOJIS_AND_STICKERS: PermissionsBitField.Flags.ManageEmojisAndStickers,
			USE_APPLICATION_COMMANDS: PermissionsBitField.Flags.UseApplicationCommands,
			REQUEST_TO_SPEAK: PermissionsBitField.Flags.RequestToSpeak,
			MANAGE_EVENTS: PermissionsBitField.Flags.ManageEvents,
			MANAGE_THREADS: PermissionsBitField.Flags.ManageThreads,
			CREATE_PUBLIC_THREADS: PermissionsBitField.Flags.CreatePublicThreads,
			CREATE_PRIVATE_THREADS: PermissionsBitField.Flags.CreatePrivateThreads,
			USE_EXTERNAL_STICKERS: PermissionsBitField.Flags.UseExternalStickers,
			SEND_MESSAGES_IN_THREADS: PermissionsBitField.Flags.SendMessagesInThreads,
			USE_EMBEDDED_ACTIVITIES: PermissionsBitField.Flags.UseEmbeddedActivities,
			MODERATE_MEMBERS: PermissionsBitField.Flags.ModerateMembers,
		}
		let newPerms = []
		for (let i = 0; i < perm.length; i++) {
			const element = perm[i];
			newPerms.push(oldPerms[element])
		}

		console.log(`first perms`,perm,`final perms:`,newPerms)
		return newPerms
	}

	async start(token = this.token) {
		this.utils.loadCommands();
		this.utils.loadSlashCommands();
		this.utils.loadEvents();
		super.login(token);
	}

};
