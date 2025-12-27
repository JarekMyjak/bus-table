import { JSDOM } from 'jsdom'
import { fetch } from 'undici';
import { writeFileSync } from 'fs'

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
            for (const direction of [0, 1]) {
                console.log(`Scraping line ${line.number}-${direction}...`);
                const lineStops: stopsEntry = {}
                const linePageHtml = await fetch(`https://www.rozkladzik.pl/zakopane/rozklad_jazdy.html?l=${line.number}&d=${direction}&b=0&dt=0`).then(res => res.text());
                const linePage = new JSDOM(linePageHtml);
                const stopNames = [...linePage.window.document.querySelectorAll('.bs a')].map((element) => element.textContent ??= '')

                for (const [stopIndex, stopName] of stopNames.entries()) {
                    const stopSlug = slugify(stopName)
                    stops[stopSlug] = { name: stopName }

                    const stopPageHtml = await fetch(`https://www.rozkladzik.pl/zakopane/rozklad_jazdy.html?l=${line.number}&d=${direction}&b=${stopIndex}&dt=0`).then(res => res.text());
                    const stopPage = new JSDOM(stopPageHtml);

                    const stopTimes = (() => {
                        const timesArr = []
                        const rowElements = [...stopPage.window.document
                            .querySelectorAll('#time_table tbody tr')]

                        for (const row of rowElements) {
                            const hour = row.querySelector("td.h")?.textContent as string
                            const minutes = [...row.querySelectorAll("td.m")].map((min) => min?.textContent as string)

                            for (const minuteInstance of minutes) {
                                timesArr.push(`${hour}:${minuteInstance.split(' ')[0]}`)
                            }
                        }

                        return timesArr
                    })()

                    lineStops[stopSlug] = {
                        name: stopName, times: stopTimes
                    }
                    console.log(`Scraped stop ${stopName} stops ${stopTimes}`);
                }
                lines.push({
                    name: `${line.number}-${direction}`,
                    color: line.color,
                    stops: lineStops
                })
            }
        }

        const output = { stops, lines, timestamp: Date.now() }
        const jsonOutput = JSON.stringify(output)
        writeFileSync('./src/data/busStopData.json', jsonOutput, 'utf8');
        console.log('Data successfully saved to disk');
        responseMessage = "Scraping and saving data completed successfully";
    } catch (error) {
        console.log('An error has occurred ', error);
        responseMessage = "An error occurred during scraping or saving data" + (error instanceof Error ? error.message : String(error));
    }

    return new Response(responseMessage, {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}

GET();