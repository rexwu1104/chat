let c = require("./config.json");
let discord = require("discord.js");
let rl = require("readline");
let bot = new discord.Client();
let io = rl.createInterface(process.stdin, process.stdout);
io.setPrompt("Discord> ");

let chat = {
	guild: null,
	channel: null
}

let tmp = {

}

bot.on("ready", async () => {
	console.log(bot.guilds.cache.map(g => {return {name: g.name, id: g.id}}));
	io.on("line", l => {
		switch(l.trim().split(" ")[0]) {
			case "guild":
				if(l.replace("guild ", "")) {
					l = l.split(" ");
					if(isNaN(l[1])) {
						console.log("[warn] use \"guild <guild_id>\"");
						break;
					}
					bot.guilds.fetch(l[1])
						.then(g => {
							chat.guild = g;
							console.log(chat.guild.channels.cache.filter(c => c.type == "text").map(c => {
								return {cate: c.parent.name, name: c.name, id: c.id};
							}));
						}).catch(err => {console.error(err), console.log("Guild not found.")});
				}
				break;
			case "channel":
				if(!chat.guild) {
					console.log("[warn] use \"guild <guild_id>\"");
					break;
				}
				if(l.replace("channel ", "")) {
					l = l.split(" ");
					if(isNaN(l[1])) {
						console.log("[warn] use \"channel <channel_id>\"");
						break;
					}
					try {
						let c = chat.guild.channels.resolve(l[1]);
						chat.channel = c;
						console.log("You can start chating.");
					} catch(err) {
						console.log("Channel not found.");
					}
				}
				break;
			case "msg":
				if(!chat.guild || !chat.channel) {
					console.log("Not enough information.");
					break;
				}
				if(!l.replace("msg ", "")) {
					console.log("Cannot send empty message.");
					break;
				}
				chat.channel.fetchWebhooks()
					.then(hooks => {
						let wh = hooks.first();
						if(!wh) {
							chat.channel.createWebhook("bot use")
								.then(h => h.send(l.replace("msg ", "")));
							break;
						}
						wh.send(l.replace("msg ", ""));
					})
				break;
		}
		io.prompt();
	})
	io.prompt();
})

bot.login(c.token);