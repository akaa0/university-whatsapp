const qrcode = require("qrcode-terminal");
const { Client, List, Buttons } = require("whatsapp-web.js");
const fs = require("fs");
const mysql = require("mysql");
// hello 
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "wg",
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected");
});
 
const SESSION_FILE_PATH = "./session.json";
let sessionData;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionData = require(SESSION_FILE_PATH);
}
const client = new Client({
  session: sessionData,
  puppeteer: {
    args: ["--no-sandbox"],
  },
  Port: process.env.PORT || 3000,
});
client.initialize();
client.on("authenticated", (session) => {
  sessionData = session;
  fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
    if (err) {
      console.error(err);
    }
  });
});
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});
client.on("ready", () => {
  console.log("Client is ready!");
});

let IT = [
  { title: "Level 1", rows: [] },

  { title: "Level 2", rows: [] },

  { title: "Level 3", rows: [] },

  { title: "Level 4", rows: [] },
];

client.on("message", async (msg) => {
  if (
    !(msg.from.startsWith("973") || msg.from.startsWith("966")) ||
    (await msg.getChat()).isGroup
  )
    return;
  if (msg.body.startsWith("#")) {
    let arr = msg.body.substring(1).split(" ");
    if (arr.length !== 3) {
      msg.reply(
        "*Sorry* 😭😭\n\n*But your format is not correct*\n\n*#ITCSxxx sec link*\n\n*make sure of the spacing*"
      );
      return;
    }
    if ((await client.getInviteInfo(arr[2].split(".com/")[1])).status !== 200) {
      msg.reply("*This link is either invalid or not working* 🤡");
      return;
    }
    addOne(arr[0], arr[1], arr[2].split(".com/")[1], msg);
  } else if (msg.type === "buttons_response") {
    createList(msg.body, msg, IT);
  } else if (msg.type === "list_response") {
    sendLinks(msg.body, msg);
  } else if (
    msg.body.toLocaleLowerCase().startsWith("IT") &&
    msg.body.length >= 7 &&
    msg.body.length <= 11
  ) {
    sendLinks(msg.body, msg);
  } else {
    let button = new Buttons(
      "Courses",
      [{ body: "CS" }, { body: "CE" }, { body: "IS" }],
      "IT College",
      "select department"
    );
    msg.reply(button);
  }
});

async function addOne(subject, sec, link, msg) {
  db.query(
    `SELECT * from gr where subject='${subject}' and sec=${sec}`,
    async (err, result) => {
      if (err) throw err;
      if (result.length !== 0 && result[0].link) {
        if (
          (await client.getInviteInfo(result[0].link.split(".com/")[1]))
            .status === 200
        ) {
          msg.reply(
            "*There is a link for the group already*\n\n*But Thank you for the effort*\n\n🤗🤗"
          );
          return;
        }
      }
      db.query(
        `UPDATE gr set link = 'https://chat.whatsapp.com/${link}' where subject LIKE '%${subject}%' and sec=${sec}`,
        async function (err, result) {
          if (err) {
            msg.reply("ERORR");
            return;
          }
          if (result.affectedRows === 0) {
            msg.reply(
              "This course does not exists for more information contact\n\nhttp://wa.me/97333959459"
            );
            return;
          }
          msg.reply(
            "*The Coures has been added* \n\n*Thanks for the help* 🥰🥰\n\n*We really appreciate it* 🌹🌹\n"
          );
        }
      );
    }
  );
}

async function createList(subject, msg, IT1) {
  db.query(
    `SELECT DISTINCT subject FROM gr where major='${subject}'`,
    async function (err, result, fields) {
      if (err) throw err;
      (IT1[0].rows = []),
        (IT1[1].rows = []),
        (IT1[2].rows = []),
        (IT1[3].rows = []);
      for (let i = 0; i < result.length; i++) {
        if (result[i].subject.substr(-3).startsWith("1"))
          IT1[0].rows.push({ title: result[i].subject });
        if (result[i].subject.substr(-3).startsWith("2"))
          IT1[1].rows.push({ title: result[i].subject });
        if (result[i].subject.substr(-3).startsWith("3"))
          IT1[2].rows.push({ title: result[i].subject });
        if (result[i].subject.substr(-3).startsWith("4"))
          IT1[3].rows.push({ title: result[i].subject });
      }
      let list = new List("select", `${subject}`, IT1, "Groups", "2021");
      await client.sendMessage(msg.from, list);
    }
  );
}

async function sendLinks(subject, msg) {
  db.query(
    `SELECT * FROM gr where subject ='${subject}'`,
    async function (err, result, fields) {
      if (err) throw err;
      let text = "*" + subject + "*\n";
      for (let i = 0; i < result.length; i++) {
        text += "sec #" + result[i].sec + "\n";
        if (!result[i].link) text += "noLink please add it\n";
        else text += "Link: " + result[i].link + "\n";
      }
      await client.sendMessage(msg.from, text);
    }
  );
}
