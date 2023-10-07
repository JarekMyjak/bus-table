
import { createSignal, onCleanup } from 'solid-js';
import { zonedTimeToUtc, utcToZonedTime, getTimezoneOffset } from "date-fns-tz";
// import { UTCDateMini } from "@date-fns/utc";
import { isBefore } from "date-fns";

type TimeToNextBusTimerProps = {
	rawStopTimes: string[];
}

export default function TimeToNextBusTimer({ rawStopTimes }: TimeToNextBusTimerProps) {
	const timeFormater = new Intl.DateTimeFormat("pl-PL", { hour: "numeric", minute: "2-digit" })
	const [test, setTest] = createSignal<string[]>([]);
	const [test2, setTest2] = createSignal<number>(0);
	
	const now = new Date().getTime();
	const offset = getTimezoneOffset('Europe/Warsaw');
	const utcTimeStamp = new Date(Date.now()+(new Date().getTimezoneOffset()*60000)).getTime()
	const relativeOffset = offset - (now - utcTimeStamp);
	const adjustedDate = new Date(now + relativeOffset);

	// console.log(now.getTime(), utcTimeStamp, now.getTime() - utcTimeStamp, offset)

	const stopTimes = rawStopTimes.map((rawTime) => {
		const [hours, minutes] = rawTime.split(":").map(n => Number(n));
		const timeCopy = new Date (adjustedDate)
		timeCopy.setHours(hours, minutes)
		
		// const timeString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate()} ${hours}:${minutes.toString().padStart(2, '0')}:59`
		
		// const dateTimeLocale = format(zonedDate, pattern, { timeZone: "Australia/Lord_Howe" })

		// console.log(adjustedDate.getHours(), adjustedDate.getMinutes(), hours + ":" + minutes, rawTime);
		const log = `${timeCopy.getHours()}:${timeCopy.getMinutes()} ${hours}:${minutes}`;
		setTest(t => [...t, log])
		return timeCopy;
	});

	function findNextTimeIndex() {
		const newAdjustedTime = new Date(new Date().getTime() + relativeOffset);
		return stopTimes.findIndex((time) => time > newAdjustedTime)
	}

	const [nextStopTimeIndex, setNextStopTimeIndex] = createSignal(findNextTimeIndex());

	const interval = setInterval(() => {
		const foundNextTime = findNextTimeIndex()
		setNextStopTimeIndex(current => foundNextTime !== -1 ? foundNextTime : 0);
		// console.log(now.getTime(), utcTimeStamp, now.getTime() - utcTimeStamp)
		console.log("tick", foundNextTime);
		setTest2(current => current + 1)

	}, 10000);
	onCleanup(() => clearInterval(interval));


	return (<>
		{/* {now.getTime()}{<br/>} */}
		{utcTimeStamp}{<br/>}
		{/* {now.getTime() - utcTimeStamp}{<br/>} */}
		{relativeOffset}{<br/>}
		{test().map((t)=>{return <>{t}<br/></>})}
		{/* {now.toLocaleString()}<br /> */}
		{/* {now.toLocaleString("pl-PL")} */}
		<>{test2()}</>
		<span class="nextBusTimer">{timeFormater.format(stopTimes[nextStopTimeIndex()])}</span>
		<span class="subsequentBusTimer">{timeFormater.format(stopTimes[(nextStopTimeIndex() + 1) % stopTimes.length])}</span>
	</>
	);
}
