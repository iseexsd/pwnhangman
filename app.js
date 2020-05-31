let fs = require("fs")
let stdin = process.openStdin()

var getMostChars = function (str) {
    var max = 0,
        maxChar = '';
    str.split('').forEach(function(char){
        if(str.split(char).length > max) {
            max = str.split(char).length;
            maxChar = char;
        }
    });
    return maxChar;
};


let dictionary = fs.readFileSync("./dictionary.txt").toString().split("\n")

stdin.addListener("data", (d) => {

    d = d.toString().trim()

    //Manually set program to won status
    if(d === "win") {
        console.log("gg"); fs.unlinkSync("./possibleWords.txt"); fs.unlinkSync("./bl.txt"); fs.unlinkSync("./lastguess.txt");
        return
    }

    if(fs.existsSync("./possibleWords.txt")) {
        if(!fs.existsSync("./bl.txt")) fs.writeFileSync("./bl.txt", "")
        if(!fs.existsSync("./lastguess.txt")) fs.writeFileSync("./lastguess.txt", "")
        let possibleWords = fs.readFileSync("./possibleWords.txt").toString().split("\n")
        let newPossibleWords = []
        let blFile = fs.readFileSync("./bl.txt").toString().split("\n")
        let blackListed = []
        let isGuess = true

        if(d.startsWith("!no")) {blFile.push(d.split(" ")[1]); fs.writeFileSync("./bl.txt", blFile.join("\n")); isGuess = false}

        //Eliminate words that don't fit requirements
        let mappedInput = ""
        if(isGuess) {mappedInput = d.split(""); fs.writeFileSync("./lastguess.txt", mappedInput.join(""))}
        else mappedInput = fs.readFileSync("./lastguess.txt").toString().split("")
        for(let i = 0; i < possibleWords.length; i++) {
            let splitWord = possibleWords[i].split("")
            let builtWord = []
            for(let j = 0; j < mappedInput.length; j++) {
                if(mappedInput[j] !== ".") blackListed.push(mappedInput[j])
                if(mappedInput[j].toLowerCase() === splitWord[j].toLowerCase()) builtWord.push(mappedInput[j])
                else if(mappedInput[j] === ".") builtWord.push(".")
            }
            if(builtWord.length === splitWord.length) {newPossibleWords.push(possibleWords[i]); console.log("pushed: " + possibleWords[i])} else {console.log("refused: " + possibleWords[i])}
        }

        let noChars = newPossibleWords.join("").toLowerCase()

        for(let i = 0; i < blackListed.length; i++) {
            blackListed[i] = blackListed[i].toLowerCase()
        }

        blackListed = blackListed.reduce(function(a,b){if(a.indexOf(b)<0)a.push(b);return a;},[])

        for(let i = 0; i < blackListed.length; i++) {
            if(!blFile.join("").includes(blackListed[i])) blFile.push(blackListed[i])
        }

        for(let i = 0; i < blFile.length; i++) {
            noChars = noChars.split(blFile[i]).join("")
        }

        console.log("blFile: " + blFile)

        console.log("noChars: " + noChars)

        console.log("Best guess: " + getMostChars(noChars))

        console.log(newPossibleWords.length)
        if(newPossibleWords.length === 1) {
            console.log("The answer is: " + newPossibleWords[0])
            console.log("gg")
            fs.unlinkSync("./possibleWords.txt");
            fs.unlinkSync("./bl.txt")
            fs.unlinkSync("./lastguess.txt")
            return
        }

        fs.writeFileSync("./bl.txt", blFile.join("\n"))
        fs.writeFileSync("./possibleWords.txt", newPossibleWords.join("\n"))
    } else {
        let possibleWords = []

        console.log("Generating words with: " + d + " letter(s)")

        for(let i = 0; i < dictionary.length; i++) {
            if(dictionary[i].length === Number(d)) possibleWords.push(dictionary[i])
        }
        fs.writeFileSync("./possibleWords.txt", possibleWords.join("\n"))
    }
})