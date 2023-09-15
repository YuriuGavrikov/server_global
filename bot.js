import TelegramApi from "node-telegram-bot-api";
import cron from "node-cron";

export function botFu() {
	const TOKEN = "6421481723:AAGecmtKjMac1rE9aRD9F3gfuOJ0hc28bsk";

	const bot = new TelegramApi(TOKEN, { polling: true, parse_mode: "HTML" });

	//Обьект с данными о состоянии уведомления в чате
	const activeChats = new Map();

	function dailyNotification(chatId, users) {
		//Функция ежедневного уведомления
		return cron.schedule(
			"00 11 * * *",
			() => {
				const user = users[Math.floor(Math.random() * users.length)];
				bot.sendMessage(
					chatId,
					`🎉 <b>${user.name}</b> тебе повезло 🎉, записывай кружок ⭕
@${user.username ? user.username : "У этого человека нет username"}`,
					{ parse_mode: "HTML" }
				);
			},
			{
				scheduled: false,
			}
		);
	}

	bot.setMyCommands([
		{
			command: "/start",
			description: "Начальное приветствие",
		},
		{
			command: "/whatismyname",
			description: "Как меня зовут",
		},
		{
			command: "/ontimetotalk",
			description: "Включить уведомление о кружке",
		},
		{
			command: "/offtimetotalk",
			description: "Отключить уведомление о кружке",
		},
	]);

	bot.on("message", async (msg) => {
		const text = msg.text;
		const chatId = msg.chat.id;
		const name = msg.from.first_name;

		const getUsers = new Promise(function (resolve, reject) {
			//Получает всех юзеров в чате кроме ботов
			const users = [];

			if (/^-/.test(chatId)) {
				bot.getChatAdministrators(chatId)
					.then((data) => {
						data.forEach((item) => {
							if (item.user.is_bot === false)
								users.push({
									name: item.user.first_name,
									username: item.user.username,
								});
						});
					})
					.then(() => {
						resolve(users);
					});
			} else {
				return resolve(users);
			}
		});

		if (text === "/start" || text === "/start@the_gnzd_bot") {
			return bot.sendMessage(chatId, `Привет, я бот GNZD`);
		}
		if (text === "/whatismyname" || text === "/whatismyname@the_gnzd_bot") {
			return bot.sendMessage(chatId, `Тебя зовут ${name} 🎉`);
		}
		if (
			text === "/ontimetotalk" ||
			text === "/ontimetotalk@the_gnzd_bot" ||
			text === "/offtimetotalk" ||
			text === "/offtimetotalk@the_gnzd_bot"
		) {
			if (/^-/.test(chatId) !== true) {
				//Проверяет групповой это чат или нет
				bot.sendMessage(chatId, "Это работает только в груповых чатах");
			} else {
				if (
					text === "/ontimetotalk" ||
					text === "/ontimetotalk@the_gnzd_bot"
				) {
					//Добавляет и включает ежедневное уведомление
					if (!activeChats.has(chatId)) {
						getUsers
							.then((data) => {
								activeChats.set(
									chatId,
									new dailyNotification(chatId, data)
								);
							})
							.then(() => {
								activeChats.get(chatId).start();

								bot.sendMessage(chatId, "Уведомление включено");
							});
					} else {
						bot.sendMessage(chatId, "Уведомление уже включено");
					}
				} else if (
					text === "/offtimetotalk" ||
					text === "/offtimetotalk@the_gnzd_bot"
				) {
					//Отключает и удаляет ежедневное уведомление
					if (activeChats.has(chatId)) {
						activeChats.get(chatId).stop();
						activeChats.delete(chatId);

						bot.sendMessage(chatId, "Уведомление отключено");
					} else {
						bot.sendMessage(chatId, "Уведомление уже отключено");
					}
				}
			}
		}
	});
}
