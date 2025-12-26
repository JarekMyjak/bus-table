// import { Effect, Console, Duration, pipe } from "effect"
// import { fetch } from 'undici';
// import { JSDOM } from 'jsdom'

// function slugify(str: string) {
//     str = str.normalize('NFKD')
//     str = str.replace(/^\s+|\s+$/g, ''); // trim leading/trailing white space
//     str = str.toLowerCase(); // convert string to lowercase
//     str = str.replaceAll('ł', 'l'); // handle special case for 'ł'
//     str = str.replace(/[^a-z0-9 -]/g, '') // remove any non-alphanumeric characters
//         .replace(/\s+/g, '-') // replace spaces with hyphens
//         .replace(/-+/g, '-'); // remove consecutive hyphens
//     return str;
// }

// const linesToScrape = [{
//     number: 11,
//     color: "#da9100",
// }, {
//     number: 14,
//     color: "#76ae40",
// }, {
//     number: 18,
//     color: "#9e173d",
// }, {
//     number: 19,
//     color: "#6cabe1",
// }, {
//     number: 21,
//     color: "#7e4d98",
// }, {
//     number: 23,
//     color: "#856037",
// }, {
//     number: 24,
//     color: "#c42d23",
// }]

// export async function GET(): Promise<Response> {

//     // const sequential = Effect.all([task1, task2], { concurrency: "unbounded" })
//     const extractStopNames = (linePage: JSDOM) => {
//         const stopNames = [...linePage.window.document.querySelectorAll('.bs a')].map((element) => element.textContent as string)
//         return Effect.succeed(stopNames)
//     };

//     const extractLineTimes = (linePage: JSDOM) => {
//         const stopSlug = slugify(stopName)
//         stops[stopSlug] = { name: stopName }

//         const stopPageHtml = await fetch(`https://www.rozkladzik.pl/zakopane/rozklad_jazdy.html?l=${line.number}&d=${direction}&b=${stopIndex}&dt=0`).then(res => res.text());
//         const stopPage = new JSDOM(stopPageHtml);

//         const stopTimes = (() => {
//             const timesArr = []
//             const rowElements = [...stopPage.window.document
//                 .querySelectorAll('#time_table tbody tr')]

//             for (const row of rowElements) {
//                 const hour = row.querySelector("td.h")?.textContent as string
//                 const minutes = [...row.querySelectorAll("td.m")].map((min) => min?.textContent as string)

//                 for (const minuteInstance of minutes) {
//                     timesArr.push(`${hour}:${minuteInstance.split(' ')[0]}`)
//                 }
//             }

//             return timesArr
//         })()

//         lineStops[stopSlug] = {
//             name: stopName, times: stopTimes
//         }
//     };

//     const parsePage = (html: string) => {
//         const page = new JSDOM(html)
//         return Effect.succeed(page)
//     };


//     let stops
//     // const output = { stops, lines, timestamp: Date.now() }

//     const fetchLine = (lineNumber: number, direction: number): Effect.Effect<string[], Error> => pipe(
//         Effect.tryPromise({
//             try: () => fetch(`https://www.rozkladzik.pl/zakopane/rozklad_jazdy.html?l=${lineNumber}&d=${direction}&b=0&dt=0`).then(res => res.text()),
//             catch: (error) => new Error(`Failed to fetch line ${lineNumber} direction ${direction}: ${String(error)}`),
//         }),
//         // Effect.tap((html) => Console.log(`Fetched line ${lineNumber} direction ${direction}`)),
//         Effect.andThen(parsePage),
//         Effect.andThen(extractStopNames),
//         Effect.tap((stopNames) => Console.log(`Extracted ${stopNames.length} stops for line ${lineNumber} direction ${direction}`)),
//         Effect.all({ concurrency: "unbounded" }),
//     );

//     const 

//     const fetchAllLines = Effect.all(
//         linesToScrape.flatMap(line =>
//             [0, 1].map(direction =>
//                 fetchLine(line.number, direction)
//             )
//         ),
//         { concurrency: "unbounded" }
//     )
//     // Effect.runFork(fetchAllLines)
//     return Effect.runPromise(fetchAllLines).then(html => {
//         return new Response("responseMessage", {
//             status: 200,
//             headers: {
//                 "Content-Type": "application/json",
//             },
//         });
//     })
// }