
import { createSignal, onCleanup, createEffect } from 'solid-js';
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
	const utcTimeStamp = new Date(Date.now() + (new Date().getTimezoneOffset() * 60000)).getTime()
	const relativeOffset = offset - (now - utcTimeStamp);
	const adjustedDate = new Date(now + relativeOffset);

	const stopTimes = rawStopTimes.map((rawTime) => {
		const [hours, minutes] = rawTime.split(":").map(n => Number(n));
		const timeCopy = new Date(adjustedDate)
		timeCopy.setHours(hours, minutes, 59)

		return timeCopy;
	});

	function findNextTimeIndex() {
		const newAdjustedTime = new Date(new Date().getTime() + relativeOffset);
		const foundNextTime = stopTimes.findIndex((time) => time > newAdjustedTime);
		return foundNextTime !== -1 ? foundNextTime : 0;
	}

	const initialNextStop = findNextTimeIndex()
	const [nextStopTimeIndex, setNextStopTimeIndex] = createSignal(initialNextStop);

	let timeout;
	createEffect(() => {
		console.log(stopTimes[nextStopTimeIndex()] - new Date(new Date() + relativeOffset))

		timeout = setTimeout(() => {
			setNextStopTimeIndex(current => findNextTimeIndex());
		}, stopTimes[nextStopTimeIndex()] - new Date(new Date() + relativeOffset));
	});
	onCleanup(() => clearTimeout(timeout));

	return (
		<>
			<span class="nextBusTimer">
				{timeFormater.format(stopTimes[nextStopTimeIndex()])}
			</span>
			<span class="subsequentBusTimer">
				{timeFormater.format(stopTimes[(nextStopTimeIndex() + 1) % stopTimes.length])}
			</span>
		</>
	);
}
