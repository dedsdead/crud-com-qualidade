console.log("[CRUD]");

const fs = require("fs");

const DB_FILEPATH = "./db";

function createTweet(content) {
    fs.writeFileSync(DB_FILEPATH, content);
    return content;
}

// [SIMULATION]

console.log(createTweet("Bora crudar com qualidade!"));