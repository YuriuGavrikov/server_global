import TelegramApi from "node-telegram-bot-api";
import cron from "node-cron";

export function BotFu() {
  //Ключ к боту
  const TOKEN = "6421481723:AAGecmtKjMac1rE9aRD9F3gfuOJ0hc28bsk";

  //Ключи к погоде
  const API_KEY_WEATHER = "55ab1ec4e25b6c808fd1b9f730101ee2";
  const BASE_URL_WEATHER = "https://api.openweathermap.org/data/2.5/weather";

  const bot = new TelegramApi(TOKEN, { polling: true, parse_mode: "HTML" });

  //Обьект с данными о состоянии уведомления в чате
  const activeChats = new Map();

  //Функция ежедневного уведомления
  function dailyNotification(chatId, users) {
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
    {
      command: "/getweather",
      description: "Какая погода?",
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
        bot
          .getChatAdministrators(chatId)
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
        if (text === "/ontimetotalk" || text === "/ontimetotalk@the_gnzd_bot") {
          //Добавляет и включает ежедневное уведомление
          if (!activeChats.has(chatId)) {
            getUsers
              .then((data) => {
                activeChats.set(chatId, new dailyNotification(chatId, data));
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
    if (text === "/getweather" || text === "/getweather@the_gnzd_bot") {
      const arrCity = ["Moscow", "Saint Petersburg", "Tbilisi"];
      const arrWeather = [];

      function getWeather(city) {
        return fetch(
          `${BASE_URL_WEATHER}?q=${city}&units=metric&appid=${API_KEY_WEATHER}`
        )
          .then((response) => response.json())
          .then(
            (data) => `<b>${city}</b> ( ${Math.round(data?.main?.temp)}°С )`
          );
      }

      arrCity.forEach(async (city) => {
        await getWeather(city).then((value) => arrWeather.push(value));
        if (arrWeather.length === arrCity.length) {
          bot.sendMessage(
            chatId,
            `Погода: 
${arrWeather.join(" || ")}`,
            { parse_mode: "HTML" }
          );
        }
      });
    }
  });
}
