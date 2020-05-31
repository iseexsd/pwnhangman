let fs = require("fs")
let stdin = process.openStdin()

function maxCount(input) {
    const {max, ...counts} = (input || "").split("").reduce(
        (a, c) => {
            a[c] = a[c] ? a[c] + 1 : 1;
            a.max = a.max < a[c] ? a[c] : a.max;
            return a;
        },
        { max: 0 }
    );

    return Object.entries(counts).filter(([k, v]) => v === max).join("").split(',')[0];
}

let dictionary = fs.readFileSync("./words_alpha.txt").toString().split("\n")

stdin.addListener("data", (d) => {

    d = d.toString().trim()

    //Manually set program to won status
    if(d === "win") {
        console.log("gg"); fs.unlinkSync("./possibleWords.txt"); fs.unlinkSync("./bl.txt"); fs.unlinkSync("./lastguess.txt"); fs.unlinkSync("./length.txt");
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
        let length = fs.readFileSync("./length.txt").toString()

        if(d.startsWith("!no")) {
            blFile.push(d.split(" ")[1])
            fs.writeFileSync("./bl.txt", blFile.join("\n"))
            isGuess = false
        }

        //Eliminate words that don't fit requirements
        let mappedInput = ""
        if(isGuess) {mappedInput = d.split(""); fs.writeFileSync("./lastguess.txt", mappedInput.join(""))}
        else {mappedInput = fs.readFileSync("./lastguess.txt").toString().split("")}
        var hrstart = process.hrtime()
        for(let i = 0; i < possibleWords.length; i++) {
            console.log(i)
            let splitWord = possibleWords[i].split("")
            console.log(splitWord)
            let builtWord = []
            for(let j = 0; j < mappedInput.length; j++) {
                if(mappedInput[j] !== ".") blackListed.push(mappedInput[j])
                if(mappedInput[j].toLowerCase() === splitWord[j]/*.toLowerCase()*/) builtWord.push(mappedInput[j])
                else if(mappedInput[j] === ".") builtWord.push(".")
            }
            if(builtWord.length === splitWord.length) {newPossibleWords.push(possibleWords[i]); /*console.log("pushed: " + possibleWords[i])} else {console.log("refused: " + possibleWords[i])*/}
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

        console.log("Best guess: " + maxCount(noChars))

        var hrend = process.hrtime(hrstart)
        console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)

        console.log(newPossibleWords.length)
        if(newPossibleWords.length === 1) {
            console.log("The answer is: " + newPossibleWords[0])
            console.log("gg")
            fs.unlinkSync("./possibleWords.txt");
            fs.unlinkSync("./bl.txt")
            fs.unlinkSync("./lastguess.txt")
            fs.unlinkSync("./length.txt")
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
        fs.writeFileSync("./length.txt", d)
        fs.writeFileSync("./possibleWords.txt", possibleWords.join("\n"))
    }
})
