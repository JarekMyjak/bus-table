import puppeteer from 'puppeteer'
import { writeFileSync } from 'fs'
import type { APIRoute } from "astro";

function slugify(str: string) {
    str = str.normalize('NFKD')
    str = str.replace(/^\s+|\s+$/g, ''); // trim leading/trailing white space
    str = str.toLowerCase(); // convert string to lowercase
    str = str.replaceAll('ł', 'l'); // handle special case for 'ł'
    str = str.replace(/[^a-z0-9 -]/g, '') // remove any non-alphanumeric characters
        .replace(/\s+/g, '-') // replace spaces with hyphens
        .replace(/-+/g, '-'); // remove consecutive hyphens
    return str;
}

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

const linesToScrape = [{
    number: 11,
    color: "#da9100",
}, {
    number: 14,
    color: "#76ae40",
}, {
    number: 18,
    color: "#9e173d",
}, {
    number: 19,
    color: "#6cabe1",
}, {
    number: 21,
    color: "#7e4d98",
}, {
    number: 23,
    color: "#856037",
}, {
    number: 24,
    color: "#c42d23",
}]

type stopsEntry = Record<string, { name: string, times: Array<string> }>

const stops: Record<string, { name: string }> = {}
const lines: Array<{ name: string, color: string, stops: stopsEntry }> = []

export async function GET(): Promise<Response> {
    console.log("Starting scraping process...");
    let responseMessage
    try {
        for (const line of linesToScrape) {
            console.log(`Scraping line ${line.number}...`);
            for (const direction of [0, 1]) {
                const lineStops: stopsEntry = {}
                await page.goto(`https://www.rozkladzik.pl/zakopane/rozklad_jazdy.html?l=${line.number}&d=${direction}&b=0&dt=0`);
                const stopNames = await page.evaluate(() => {
                    return [...document.querySelectorAll('.bs a')].map((element) => element.textContent ??= '')
                })
                for (const [stopIndex, stopName] of stopNames.entries()) {
                    const stopSlug = slugify(stopName)
                    stops[stopSlug] = { name: stopName }

                    await page.goto(`https://www.rozkladzik.pl/zakopane/rozklad_jazdy.html?l=${line.number}&d=${direction}&b=${stopIndex}&dt=0`);

                    const stopTimes = await page.evaluate(() => {
                        const timesArr = []
                        const rowElements = [...document
                            .querySelectorAll('#time_table tbody tr')]

                        for (const row of rowElements) {
                            const hour = row.querySelector("td.h")?.textContent as string
                            const minutes = [...row.querySelectorAll("td.m")].map((min) => min?.textContent as string)

                            for (const minuteInstance of minutes) {
                                timesArr.push(`${hour}:${minuteInstance.split(' ')[0]}`)
                            }
                        }

                        return timesArr
                    })

                    lineStops[stopSlug] = {
                        name: stopName, times: stopTimes
                    }
                }
                lines.push({
                    name: `${line.number}-${direction}`,
                    color: line.color,
                    stops: lineStops
                })
            }
        }

        const output = { stops, lines }
        const jsonOutput = JSON.stringify(output)
        writeFileSync('./src/data/busStopData.json', jsonOutput, 'utf8');
        console.log('Data successfully saved to disk');
        responseMessage = "Scraping and saving data completed successfully";
    } catch (error) {
        console.log('An error has occurred ', error);
        responseMessage = "An error occurred during scraping or saving data" + (error instanceof Error ? error.message : String(error));
    }

    await browser.close();
    return new Response(responseMessage, {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}

GET();