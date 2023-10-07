
import { createSignal, onCleanup } from 'solid-js';
import { zonedTimeToUtc, utcToZonedTime, getTimezoneOffset } from "date-fns-tz";
// import { UTCDateMini } from "@date-fns/utc";
import { isBefore, addMilliseconds } from "date-fns";

type TimeToNextBusTimerProps = {
	rawStopTimes: string[];
}

export default function TimeToNextBusTimer({ rawStopTimes }: TimeToNextBusTimerProps) {
	const timeFormater = new Intl.DateTimeFormat("pl-PL", { hour: "numeric", minute: "2-digit" })

	const now = new Date();
	// const nowU = new UTCDateMini();
	const zonedDate = zonedTimeToUtc(now,  "Europe/Warsaw");
	const offset = getTimezoneOffset('Europe/Warsaw');
	const utcTimeStamp = new Date(Date.now()+(new Date().getTimezoneOffset()*60000)).getTime()

	// const added = addMilliseconds(nowU, offset)
	// const utctesta = addMilliseconds(nowU, offset)

	console.log(now.getTime(), utcTimeStamp, now.getTime() - utcTimeStamp)

	const stopTimes = rawStopTimes.map((rawTime) => {
		const [hours, minutes] = rawTime.split(":").map(n => Number(n));

		const timeString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate()} ${hours}:${minutes.toString().padStart(2, '0')}:59`
		const utcDate = zonedTimeToUtc(timeString, 'Europe/Warsaw')

		// const dateTimeLocale = format(zonedDate, pattern, { timeZone: "Australia/Lord_Howe" })

		// console.log('timenow', now,'timenow warsaw', zonedDate, hours + ":" + minutes, rawTime);
		return utcDate;
	});

	function findNextTimeIndex() {
		// // return stopTimes.findIndex((time) => time > new Date())
		// stopTimes.map((time) =>
		// 	console.log(isBefore(time, new Date()), time, new Date())
		// )
		return stopTimes.findIndex((time) => isBefore(time, new Date()))
	}

	const [nextStopTimeIndex, setNextStopTimeIndex] = createSignal(findNextTimeIndex());

	const interval = setInterval(() => {
		const foundNextTime = findNextTimeIndex()
		setNextStopTimeIndex(foundNextTime !== -1 ? foundNextTime : 0);

	}, 1000);
	onCleanup(() => clearInterval(interval));


	return (<>
		noww {now.getTime()}{<br/>}
		zone  {utcTimeStamp}{<br/>}
		diff  {now.getTime() - utcTimeStamp}{<br/>}
		{/* {now.toLocaleString()}<br /> */}
		{/* {now.toLocaleString("pl-PL")} */}
		{/* <span class="nextBusTimer">{format(stopTimes[nextStopTimeIndex()], "mm:ss")}</span>
		<span class="subsequentBusTimer">{format(stopTimes[(nextStopTimeIndex() + 1) % stopTimes.length], "mm:ss")}</span> */}
	</>
	);
}
