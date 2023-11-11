
import { createSignal, onCleanup } from 'solid-js';
import { zonedTimeToUtc, utcToZonedTime, getTimezoneOffset } from "date-fns-tz";
// import { UTCDateMini } from "@date-fns/utc";
import { isBefore } from "date-fns";

type TimeToNextBusTimerProps = {
	rawStopTimes: string[];
}

export default function TimeToNextBusTimer({ rawStopTimes }: TimeToNextBusTimerProps) {
	const timeFormater = new Intl.DateTimeFormat("pl-PL", { hour: "numeric", minute: "2-digit", hour12: false })
	
	const now = new Date().getTime();
	const offset = getTimezoneOffset('Europe/Warsaw');
	const utcTimeStamp = new Date(Date.now()+(new Date().getTimezoneOffset()*60000)).getTime()
	const relativeOffset = offset - (now - utcTimeStamp);
	const adjustedDate = new Date(now + relativeOffset);

	console.log("now", now)

	const stopTimes = rawStopTimes.map((rawTime) => {
		const [hours, minutes] = rawTime.split(":").map(n => Number(n));
		const timeCopy = new Date (adjustedDate)
		timeCopy.setHours(hours, minutes, 59)
		
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
		console.log('tick', foundNextTime)
	}, 1000);
	onCleanup(() => clearInterval(interval));


	return (<>
		<span class="nextBusTimer">
			{timeFormater.format(stopTimes[nextStopTimeIndex()])}
		</span>
		<span class="subsequentBusTimer">
			{timeFormater.format(stopTimes[(nextStopTimeIndex() + 1) % stopTimes.length])}
		</span>
	</>
	);
}
