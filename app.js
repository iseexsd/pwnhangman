let fs = require("fs")
let stdin = process.openStdin()

let lowdb = require("lowdb")
let FileSync = require("lowdb/adapters/FileSync")

let adapter = new FileSync("storage.json")
let db = lowdb(adapter)

function solve(d, /*hrstart*/) {
    // if (!fs.existsSync("./bl.txt")) fs.writeFileSync("./bl.txt", "")
    // if (!fs.existsSync("./superbl.txt")) fs.writeFileSync("./superbl.txt", "")
    // if (!fs.existsSync("./lastguess.txt")) fs.writeFileSync("./lastguess.txt", "")
    // let possibleWords = fs.readFileSync("./possibleWords.txt").toString().split("\n")
    let possibleWords = db.get("possibleWords").value().storage.split("\n")
    let newPossibleWords = []
    // let blFile = fs.readFileSync("./bl.txt").toString().split("\n")
    let blFile = db.get("correctLetters").value().storage.split("\n")
    let blackListed = []
    // let superbl = fs.readFileSync("./superbl.txt").toString().split("\n")
    let superbl = db.get("incorrectLetters").value().storage.split("\n")
    let isGuess = true

    if (d.startsWith("!no")) {
        superbl.push(d.split(" ")[1])
        // fs.writeFileSync("./superbl.txt", superbl.join("\n"))
        db.get("incorrectLetters").set("storage", superbl.join("\n")).write()
        isGuess = false
    }

    //Eliminate words that don't fit requirements
    let mappedInput = ""
    if (isGuess) {
        mappedInput = d.split("")
        // fs.writeFileSync("./lastguess.txt", mappedInput.join(""))
        db.get("lastGuess").set("storage", mappedInput.join("")).write()
    } else {
        // mappedInput = fs.readFileSync("./lastguess.txt").toString().split("")
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

    // console.log("Words not allowed: " + blFile + superbl)

    console.log("Words left: " + newPossibleWords.length)

    console.log("Best guess: " + maxCount(noChars))

    // var hrend = process.hrtime(hrstart)
    // console.log(`Processing time: ${(hrend[0]*1000)+(hrend[1]/1000000)}ms`/*, hrend[0], hrend[1] / 1000000*/)
    if (newPossibleWords.length === 1) {
        console.log("The answer is: " + newPossibleWords[0])
        console.log("gg")
        // fs.unlinkSync("./possibleWords.txt")
        db.get("possibleWords").set("started", "false").write()
        db.get("possibleWords").set("storage", "").write()
        // fs.unlinkSync("./bl.txt")
        db.get("correctLetters").set("storage", "").write()
        // fs.unlinkSync("./superbl.txt")
        db.get("incorrectLetters").set("storage", "").write()
        // fs.unlinkSync("./lastGuess.txt")
        db.get("lastGuess").set("storage", "").write()
        return
    }

    // fs.writeFileSync("./bl.txt", blFile.join("\n"))
    db.get("correctWords").set("storage", blFile.join("\n"))
    // fs.writeFileSync("./possibleWords.txt", newPossibleWords.join("\n"))
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

//modified version of http://www.mieliestronk.com/corncob_lowercase.txt
let dictionary = fs.readFileSync("./good_dictionary.txt").toString().split("\n")

stdin.addListener("data", (d) => {

    var hrstart = process.hrtime()

    d = d.toString().trim()

    //Manually set program to won status
    if (d === "win") {
        console.log("gg")
        // fs.unlinkSync("./possibleWords.txt")
        db.get("possibleWords").set("started", "false").write()
        db.get("possibleWords").set("storage", "").write()
        // fs.unlinkSync("./bl.txt")
        db.get("correctLetters").set("storage", "").write()
        // fs.unlinkSync("./superbl.txt")
        db.get("incorrectLetters").set("storage", "").write()
        // fs.unlinkSync("./lastGuess.txt")
        db.get("lastGuess").set("storage", "").write()
        return
    }

    // if (fs.existsSync("./possibleWords.txt")) {
    if(db.get("possibleWords").value().started === "true") {
        solve(d/*, hrstart*/)
    } else {
        let possibleWords = []

        console.log("Generating words with: " + d + " letter(s)")

        for (let i = 0; i < dictionary.length; i++) {
            if (dictionary[i].length === Number(d)) possibleWords.push(dictionary[i])
        }
        // fs.writeFileSync("./possibleWords.txt", possibleWords.join("\n"))
        db.get("possibleWords").set("started", "true").write()
        db.get("possibleWords").set("storage", possibleWords.join("\n")).write()

        let start = ""
        for (let i = 0; i < Number(d); i++) {
            start = start + "."
        }
        solve(start/*, hrstart*/)
    }
})