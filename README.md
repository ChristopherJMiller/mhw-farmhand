# MHW Farmhand

![deploy](https://github.com/ChristopherJMiller/mhw-farmhand/workflows/deploy/badge.svg?branch=mainline)

A utility to help map resource gathering steps for [Monster Hunter World](https://monsterhunterworld.wiki.fextralife.com/Monster+Hunter+World+Wiki).

## How to Use

1. Use the [search page](http://chrismiller.xyz/mhw-farmhand) to build a list of equipment you want to build.
2. Press 'Build' to get step-by-step instructions of what you should gather and build to complete your list.

The instructions prioritize reducing the number of trips you need to make for a given material (e.g. if multiple pieces of equipment need Medium Bones, it will combine all Medium Bone gathering into the earliest sensible step).

## Why are some equipment missing/Why do some appear on the instructions with no materials to gather?

This tool uses [MHW DB](https://docs.mhw-db.com/) to access information on crafting materials and equipment trees. However, this API is currently incomplete, therefore any aid to improve this DB will then improve the effectiveness of Farmhand.