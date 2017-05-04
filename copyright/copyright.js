/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2017 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

const glob = require('glob')
const fs = require('fs')
const path = require('path')

const red = '\x1b[31m'
const green = '\x1b[32m'
const yellow = '\x1b[33m'
const magenta = '\x1b[35m'
const cyan = '\x1b[36m'
const blackBG = '\x1b[40m'
const defaultBG = '\x1b[49m'
const defaultFG = '\x1b[39m'

const args = process.argv.filter((arg) => {
    return !/node|copyright/.test(arg)
})

const copyright = {
    lintMode: true,
    langs: {},
    run() {
        this.buildSupportedExtensions()
        let files = []

        const processedGlobs = args.map((folder) => {
            files.push(glob.sync(folder))
        })

        // flattens array of arrays returned by glob.sync
        files = files.reduce((a, b) => a.concat(b))

        const filesContainingHeader = files.filter((file) => {
            const content = fs.readFileSync(file)
            const hasCopyrightHeader = content.includes('Copyright (c)')
            const ext = file.match(/\.[0-9a-z]+$/i)[0]

            if (hasCopyrightHeader) {
                return true
            } else {
                if (this.lintMode) {
                    console.log(`${yellow}${file} ${red}missing copyright header`)
                    return false
                } else {
                    const newData = this.getHeaderText(ext) + content
                    fs.writeFileSync(file, newData)
                    console.log(`${green}Copyright header succesfully written into ${magenta}${file}`)
                    return true
                }
            }
        })

        if (filesContainingHeader.length !== files.length) {
            console.log(`${red}${blackBG}ERROR${defaultBG} - Please run the copyright headers tool in this project`)
            process.exit(1)
        } else {
            console.log(`${cyan}Copyright headers are present in target files`)
        }
    },
    getHeaderText(ext) {
        if (!this.langs[ext]) {
            console.log(`${red}${blackBG}ERROR${defaultBG} - ${ext} is not supported (yet)`)
            process.exit(1)
        } else {
            const textPath = path.join(__dirname, `./headers/${this.langs[ext]}`)
            return fs.readFileSync(textPath).toString().replace('year', new Date().getFullYear())
        }
    },
    buildSupportedExtensions() {
        const headerDir = path.join(__dirname, './headers')
        filenames = fs.readdirSync(headerDir)
        filenames.forEach((file) => {
            const extension = file.match(/\.[0-9a-z]+$/i)[0]
            this.langs[extension] = file
        })
    }
}

if (args.length === 0 || args.indexOf('--help') >= 0) {

    console.log(`
    Usage: node copyright.js [options] glob [additional globs]

    Example:
        ${yellow}node copyright.js --fix${defaultFG} src/**/*.js

        Options:

            --fix        run in fix mode

    Visit ${cyan}https://github.com/mobify/mobify-code-style${defaultFG} to learn more.
`)

    process.exit(0)
}

// Sets fix flag if the user provides --fix command line arg
if (args.indexOf('--fix') >= 0) {
    args.splice(args.indexOf('--fix'), 1)
    copyright.lintMode = false
}

copyright.run()
