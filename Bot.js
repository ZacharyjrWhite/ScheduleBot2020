const {
    Client
} = require('discord.js');
const client = new Client({
    disableEveryone: false
});
const clientToken = 'NzUzOTM5MDk0ODY1ODM4MTIx.X1tefw.ttSNNrnuN_ApNGyIq-KTcyakQGQ';
const scheduleJson = require('./Schedule.json')
const quotes = require('./quotes.json')
var listOfAssignments = require('./ListOfAssignments.json');
const fs = require("fs");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const commands = ['help - displays a list of commands',
    'today - displays the schedule for the day',
    'nextclass displays the next class',
    'dayofweek day - displays the classes for the given day',
    'gif - this will return a random [safe] gif',
    'gif2 query - Returns a gif matching the query name',
    'kassy - returns a kassy meme',
    'pun - this will tell a random pun ',
    'quote - random inspirational quote',
    'dad? OR !AJ - random dad jokes',
    'ohno - The bot asks why you broke him',
    'homework add - //Assignment//Course//ddmmyyyy example: !homework add//Assignment 1//Programming//11012020',
    'homework list assignments - Lists all of the currently outstanding homework assignments.',
    'homework list completed - Lists all of the previously completed assignments.'
];
var DayInMS = (((1000 * 60) * 60));
var classDiscordChannel = '753236716038651916';
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    // var x = new Date(Date.now());
    // var hour = x.getHours();
    // var day = x.getDay();
    // console.log(day);
});

client.on('message', msg => {
    const CommandSymbol = '!';
    let args = msg.content;
    if (args.startsWith(CommandSymbol)) {
        args = args.substring(1, args.length);
        const commandText = args.split(" ")[0];

        switch (commandText.toLowerCase()) {
            case 'nextclass':
                GetNextClass(msg);
                break;
            case 'dayofweek':
                GetDayOfWeekClass(args, msg);
                break;
            case 'today':
                GetTodaysClasses(msg, 2);
                break;
            case 'pun':
                GetPuns(msg);
                break;
            case 'gif':
                GetGifs(msg);
                break;
            case 'gif2':
                GetSecondaryGif(args, msg);
                break;
            case 'quote':
                GetRandomQuote(msg)
                break;
            case 'help':
                GetHelpMessage(msg);
                break;
            case 'homework':
                addHomework(args, msg);
                break;
            case 'ohno':
                WhyDidYouBreakMe(msg);
                break;
            case 'kassy':
                kassyMeme(msg);
                break;
            case 'dad?':
            case 'aj':
                GetDadJokes(msg);
                break;
            case 'test':
                NewDailyMessage(msg, 1);
                break;
            default:
                DisplayCommandDoesNotExist(msg);
                break;
        }
    }
});

var LastDailyMessage;
setInterval(NewDailyMessage, DayInMS);

function NewDailyMessage() {
    //channelID = 753236716038651916 
    //test channelid = 680934797719371778
    var x = new Date(Date.now());
    var hour = x.getHours();
    var day = x.getDay();

    if(day != 6 && day != 0){
        if(hour === 7){
            console.log("Checking Message of the day.");
            GetTodaysClasses(null, 1);
            fs.readFile('LastDailyMessage.json', "utf8", function (err, data) {
                LastDailyMessage = JSON.parse(data).lastDailyMessage
                var currentDailyMessage = new Date(Date.now())
                currentDailyMessage = currentDailyMessage.toLocaleDateString();
                if (currentDailyMessage != LastDailyMessage) {
                    const CurrentTime = new Date(Date.now());
                    const CurrentDay = weekday[CurrentTime.getDay()];
                    const channel = client.channels.cache.get(classDiscordChannel)
                    channel.send(`@everyone, Good Morning! Happy ${CurrentDay}! Here are todays classes:`);
                    fs.writeFile('LastDailyMessage.json',
                    `{
                    "lastDailyMessage": "${currentDailyMessage}"
                    }`, () => {});
                }
            });
        }
    }
}


function kassyMeme(msg) {
    msg.channel.send(":eye::lips::eye:");
}

function WhyDidYouBreakMe(msg) {
    msg.channel.send("<@138356015618850816>.... Why did you break me?")
    msg.channel.send("Just kidding.... <@630850592058769408> sucks at coding..")
}

function GetDadJokes(msg) {
    var url = "https://icanhazdadjoke.com/slack";
    var method = "GET";
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var joke = JSON.parse(xhttp.responseText);
            msg.reply(joke.attachments[0].text)
        }
    }

    xhttp.open(method, url, true);
    xhttp.send();
}

function DisplayCommandDoesNotExist(msg) {
    msg.reply('\n' + 'This command does not exist. Use !help for a command list.');
}

function GetDayOfWeekClass(arguments, msg) {
    var command = arguments.split(" ");
    var output = ''
    if (command.length == 2) {
        weekday.forEach((day, i) => {
            if (day.toLowerCase() == command[1].toLowerCase()) {
                var todaysSchedule = scheduleJson.DayOfWeek[day];
                if (todaysSchedule) {
                    Object.keys(todaysSchedule).forEach(function (key) {
                        var value = todaysSchedule[key];
                        if (value.class == "") {
                            value.class = 'Self Study / Appointments / Office Hours'
                        }
                        output += `${key}: ${value.class} - ${value.teacher} \n\n`;
                    });
                }
            }
        });
        msg.reply(output);
    } else {
        msg.reply("The command is: !dayofweek day.")
    }
}

function GetRandomQuote(msg) {
    var randomNumber = Math.floor(Math.random() * quotes.quotes.length);
    msg.reply(quotes.quotes[randomNumber]);
}

function GetNextClass(msg) {
    var output = {}
    const CurrentTime = new Date(Date.now());
    const CurrentDay = weekday[CurrentTime.getDay()];
    var CurrentHour = CurrentTime.getHours();
    var CurrentMinute = CurrentTime.getMinutes();
    if (CurrentDay == 6 || CurrentDay == 0) {
        nextClass = `It's the weekend....`
    } else {
        const TodaysSchedule = scheduleJson.DayOfWeek[CurrentDay];
        if (TodaysSchedule) {
            var x = false;
            Object.keys(TodaysSchedule).forEach(function (key) {
                var classhour;
                if (CurrentMinute <= 30) {
                    classhour = CurrentHour;
                } else {
                    classhour = CurrentHour + 1
                }

                var value = TodaysSchedule[key];
                output = {
                    key,
                    value
                };
                if (CurrentHour > 12) {
                    CurrentHour -= 12;
                }
                if (key.split(":")[0] == (classhour)) {
                    msg.reply(`\n Your next class is at \`${output.key}\`. It is \`${output.value.class}\` with \`${output.value.teacher}\``);
                    x = true;
                }
            });
            if (!x) {
                msg.reply("There are no more classes today");
            }
        }
    }
}

function GetTodaysClasses(msg, MsgOrReply) {
    //MsgOrReply = 1 if it's a message.. 2 if it's a reply
    var output = ''
    const CurrentTime = new Date(Date.now());
    const CurrentDay = weekday[CurrentTime.getDay()];
    if (CurrentDay == 6 || CurrentDay == 0) {
        output = `It's the weekend....`
    } else {
        const TodaysSchedule = scheduleJson.DayOfWeek[CurrentDay];
        if (TodaysSchedule) {
            Object.keys(TodaysSchedule).forEach(function (key) {
                var value = TodaysSchedule[key];
                if (value.class == "") {
                    value.class = 'Self Study / Appointments / Office Hours'
                }
                output += `${key}: ${value.class} - ${value.teacher} \n\n`;
            });
        }
    }
    if (MsgOrReply === 1) {
        const ClassChannel = client.channels.cache.get(classDiscordChannel);
        ClassChannel.send('\n  \`\`\`' + output + '\`\`\`');
    } else {
        msg.reply('\n  \`\`\`' + output + '\`\`\`');
    }
}

function GetHelpMessage(msg) {
    let output = ''
    commands.forEach(command => {
        output += `Command: \`!${command}\` \n`
    })
    output += `For addition information please contact <@630850592058769408>`
    msg.reply('\n' + output);
}

function GetPuns(msg) {
    var url = "https://getpuns.herokuapp.com/api/random";
    var method = "GET";
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {

            var pun = xhttp.responseText;
            var obj = JSON.parse(pun);
            var pun = obj.Pun;
            msg.reply(pun);
        }
    }

    xhttp.open(method, url, true);
    xhttp.send();
}

function GetGifs(msg) {

    const giphy = {
        baseURL: "https://api.giphy.com/v1/gifs/",
        key: "dc6zaTOxFJmzC",
        tag: "pun",
        type: "random",
        rating: "pg-13"
    };

    var url = "https://api.giphy.com/v1/gifs/" + giphy.type + "?api_key=" + giphy.key + "&tag=" + giphy.tag + "&rating=" + giphy.rating;
    var method = "GET";
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var gif = xhttp.responseText;
            var obj = JSON.parse(gif);
            var random = Math.floor(Math.random() * 10);

            var gif = obj.data.image_url;
            msg.reply(gif);
        }
    }
    xhttp.open(method, url, true);
    xhttp.send();
};

function GetSecondaryGif(args, msg) {

    const tenor = {
        baseURL: "https://api.tenor.com/v1/search?q=",
        key: "B9N4A4Z1FXD8"
    };
    if (args.trim().split(" ").length == 2) {
        var searchQuery = args.split(" ")[1]
        var url = tenor.baseURL + "" + searchQuery + "&key=" + tenor.key
        var method = "GET";
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var gif = xhttp.responseText;
                var obj = JSON.parse(gif);
                msg.channel.send(obj.results[Math.floor((Math.random() * obj.results.length))].url)
            }
        }
        xhttp.open(method, url, true);
        xhttp.send();
    } else {
        msg.reply("Please add a search parameter. !gif2 [search]");
    }
}

function addHomework(arguments, msg) {
    var whatDo = true;
    var whatList = false;
    var command = arguments.split("//");
    if (command[0].split(" ").length > 0 && command[0].split(" ")[1]) {
        if (command[0].split(" ")[1].toLowerCase() === "add" && command.length === 4) {
            var assignment = command[1];
            var course = command[2];
            var dueDate = command[3];

            let HomeworkAssignment = {
                "Assignment": assignment,
                "Course": course,
                "DueDate": dueDate
            }

            listOfAssignments.assignments.push(HomeworkAssignment);
            whatDo = false;
            whatList = false;
            fs.writeFile("./ListOfAssignments.json", JSON.stringify(listOfAssignments), (e) => {
                console.log("Homework Assignment has been added.");
            });
            msg.reply("This has been added to the homework");
        } else if (command[0].split(" ")[1].toLowerCase() === "list" && command[0].split(" ")[2]) {
            whatDo = false;
            whatList = true;
            if (command[0].split(" ")[2].toLowerCase() == "assignments") {
                var curDate = new Date(Date.now())
                var listofhomework = '\n';
                var tempArray = [];
                listOfAssignments.assignments.forEach(assignment => {
                    var dy = assignment.DueDate.substring(assignment.DueDate.split("").length - 4, assignment.DueDate.split("").length)
                    var dm = assignment.DueDate.substring(assignment.DueDate.split("").length - 6, assignment.DueDate.split("").length - 4)
                    var dd = assignment.DueDate.substring(0, assignment.DueDate.split("").length - 6)
                    var y = curDate.getFullYear();
                    var m = curDate.getMonth() + 1;
                    var d = curDate.getDate();

                    if (dy == y && dm == m && dd == d) {
                        listOfAssignments.completed.push(assignment);
                    } else {
                        tempArray.push(assignment);
                        listofhomework += `Homework Assignment: ${assignment.Assignment} -- Course: ${assignment.Course} -- Due: ${dd + "-" + dm + "-" + dy} \n`
                    }
                });
                listOfAssignments.assignments = tempArray;
                msg.reply(listofhomework);
                whatDo = false;
                whatList = false;
                tempArray = [];
                fs.writeFile("./ListOfAssignments.json", JSON.stringify(listOfAssignments), (e) => {
                    console.log("Homework Assignments have been updated");
                });
            } else if (command[0].split(" ")[2].toLowerCase() == "completed") {
                var completedoutput = '\n';
                listOfAssignments.completed.forEach(assignment => {
                    var y = assignment.DueDate.substring(assignment.DueDate.split("").length - 4, assignment.DueDate.split("").length)
                    var m = assignment.DueDate.substring(assignment.DueDate.split("").length - 6, assignment.DueDate.split("").length - 4)
                    var d = assignment.DueDate.substring(0, assignment.DueDate.split("").length - 6)
                    completedoutput += `Homework Assignment: ${assignment.Assignment} -- Course: ${assignment.Course} -- Due: ${d + "-" + m + "-" + y} \n`
                })
                whatDo = false;
                whatList = false;
                msg.reply(completedoutput);
            } else {
                whatList = true;
            }
        } else {
            whatDo = false;
            whatList = true;
        }
    }
    if (whatDo == true) {
        msg.reply("Please specify what you'd like to do with the homework command. \n !homework add//assignmentname//coursename//ddmmyyyy \n !homework list assignments \n !homework list completed")
        whatDo = false;
    }

    if (whatList == true) {
        msg.reply("What would you like me to list? \n !homework list assignments \n !homework list completed");
        whatList = false;
    }
}

client.login(clientToken);