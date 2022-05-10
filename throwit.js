#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwIt = void 0;
/**
 * Throwit - fork from PagerMaid plugin throwit
 * https://gitlab.com/Xtao-Labs/PagerMaid_Plugins/-/blob/721cb749fd322e789d0e9a5fe9a6f1c03ae42569/throwit.py
 *
 * @author sunafterrainwm
 * @license MIT
 */
const canvas_1 = require("canvas");
const commander_1 = require("commander");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const util = require("util");
async function throwIt(source) {
    const canvas = (0, canvas_1.createCanvas)(512, 512);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(await (0, canvas_1.loadImage)(path.join(__dirname, 'throw.png')), 0, 0, 512, 512);
    const width = 136, r = width / 2, circleShape = Buffer.from(`<svg><circle cx="${r}" cy="${r}" r="${r}" /></svg>`);
    const circledImage = await sharp(fs.readFileSync(path.join(process.cwd(), source)))
        .resize(width, width)
        .composite([{
            input: circleShape,
            blend: 'dest-in'
        }])
        .png()
        .toBuffer();
    ctx.drawImage(await (0, canvas_1.loadImage)(circledImage), 19, 181, width, width);
    let dataUrl = canvas.toDataURL();
    dataUrl = dataUrl.slice(dataUrl.indexOf('base64') + 7);
    return Buffer.from(dataUrl, 'base64');
}
exports.throwIt = throwIt;
if (process.argv[1] === __filename) {
    const program = (0, commander_1.createCommand)('throwit');
    program
        .command('throw <from> [to]')
        .description(`read image from <from> and print it to [to] (or result.png in this dir, aka '${path.join(process.cwd(), 'result.png')}' )`)
        .action(async function (from, to) {
        to = to || 'result.png';
        process.stdout.write('\x1b[33mStart process......\x1b[0m\n');
        try {
            const buf = await throwIt(from);
            fs.writeFileSync(path.join(process.cwd(), to), buf);
            process.stdout.write('\x1b[32mdone!\x1b[0m\n');
        }
        catch (e) {
            process.stderr.write('\x1b[31merror:\x1b[0m ' + util.inspect(e) + '\n');
        }
    });
    program.parse(process.argv);
}
