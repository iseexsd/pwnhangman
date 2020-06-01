let fs = require("fs")
let stdin = process.openStdin()

let lowdb = require("lowdb")
let FileSync = require("lowdb/adapters/FileSync")

let adapter = new FileSync("storage.json")
let db = lowdb(adapter)

let dictionary = fs.readFileSync("./words_alpha.txt").toString().split("\n")

function solve(d) {
    let possibleWords = db.get("possibleWords").value().storage.split("\n")
    let newPossibleWords = []
    let blFile = db.get("correctLetters").value().storage.split("\n")
    let blackListed = []
    let superbl = db.get("incorrectLetters").value().storage.split("\n")
    let isGuess = true

    if (d.startsWith("!no")) {
        superbl.push(d.split(" ")[1])
        db.get("incorrectLetters").set("storage", superbl.join("\n")).write()
        isGuess = false
    }

    //Eliminate words that don't fit requirements
    let mappedInput = ""
    if (isGuess) {
        mappedInput = d.split("")
        db.get("lastGuess").set("storage", mappedInput.join("")).write()
    } else {
        mappedInput = db.get("lastGuess").value().storage.split("")
    }

    for (let i = 0; i < possibleWords.length; i++) {
        superbl.forEach((bl) => {
            if (bl.length > 0) {
                if (possibleWords[i].includes(bl)) {
                    possibleWords[i] = ""
                }
            }
        })
    }

    for (let i = 0; i < possibleWords.length; i++) {
        let splitWord = possibleWords[i].split("")
        let builtWord = []
        for (let j = 0; j < mappedInput.length; j++) {
            if (mappedInput[j] !== ".") blackListed.push(mappedInput[j])
            if (mappedInput[j].toLowerCase() === splitWord[j]) builtWord.push(mappedInput[j])
            else if (mappedInput[j] === ".") builtWord.push(".")
        }
        if (builtWord.length === splitWord.length) {
            newPossibleWords.push(possibleWords[i])
        }
    }

    let noChars = newPossibleWords.join("").toLowerCase()

    for (let i = 0; i < blackListed.length; i++) {
        blackListed[i] = blackListed[i].toLowerCase()
    }

    blackListed = blackListed.reduce(function(a, b) {
        if (a.indexOf(b) < 0) a.push(b)
        return a
    }, [])

    for (let i = 0; i < blackListed.length; i++) {
        if (!blFile.join("").includes(blackListed[i])) blFile.push(blackListed[i])
    }

    for (let i = 0; i < blFile.length; i++) {
        noChars = noChars.split(blFile[i]).join("")
    }

    console.log("Words left: " + newPossibleWords.length)

    console.log("Best guess: " + maxCount(noChars))
    if (newPossibleWords.length === 1) {
        console.log("The answer is: " + newPossibleWords[0])
        console.log("gg")
        db.get("possibleWords").set("started", "false").write()
        db.get("possibleWords").set("storage", "").write()
        db.get("correctLetters").set("storage", "").write()
        db.get("incorrectLetters").set("storage", "").write()
        db.get("lastGuess").set("storage", "").write()
        return
    }

    db.get("correctWords").set("storage", blFile.join("\n"))
    db.get("possibleWords").set("storage", newPossibleWords.join("\n"))
}

//https://stackoverflow.com/a/22590126
function maxCount(input) {
    const {
        max,
        ...counts
    } = (input || "").split("").reduce(
        (a, c) => {
            a[c] = a[c] ? a[c] + 1 : 1
            a.max = a.max < a[c] ? a[c] : a.max
            return a
        }, {
            max: 0
        }
    )

    return Object.entries(counts).filter(([k, v]) => v === max).join("").split(',')[0]
}

stdin.addListener("data", (d) => {

    d = d.toString().trim()

    //Manually set program to won status
    if (d === "win") {
        console.log("gg")
        db.get("possibleWords").set("started", "false").write()
        db.get("possibleWords").set("storage", "").write()
        db.get("correctLetters").set("storage", "").write()
        db.get("incorrectLetters").set("storage", "").write()
        db.get("lastGuess").set("storage", "").write()
        return
    }

    if(db.get("possibleWords").value().started === "true") {
        solve(d)
    } else {
        let possibleWords = []

        console.log("Generating words with: " + d + " letter(s)")

        for (let i = 0; i < dictionary.length; i++) {
            if (dictionary[i].includes("\r"))
            {if (dictionary[i].length === Number(d)+1) {possibleWords.push(dictionary[i].replace("\r", ""))}}
            else if (dictionary[i].length === Number(d)) {possibleWords.push(dictionary[i])}
        }
        db.get("possibleWords").set("started", "true").write()
        db.get("possibleWords").set("storage", possibleWords.join("\n")).write()

        let start = ""
        for (let i = 0; i < Number(d); i++) {
            start = start + "."
        }
        solve(start)
    }
})