
import { createSignal, onCleanup } from 'solid-js';
import { zonedTimeToUtc } from "date-fns-tz"
import { isBefore } from "date-fns"

type TimeToNextBusTimerProps = {
	rawStopTimes: string[];
}

export default function TimeToNextBusTimer({ rawStopTimes }: TimeToNextBusTimerProps) {
	const timeFormater = new Intl.DateTimeFormat("pl-PL", { hour: "numeric", minute: "2-digit" })

	const now = new Date();
	const stopTimes = rawStopTimes.map((rawTime) => {
		const [hours, minutes] = rawTime.split(":").map(n => Number(n));

		const timeString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate()} ${hours}:${minutes.toString().padStart(2, '0')}:59`
		const utcDate = zonedTimeToUtc(timeString, 'Europe/Warsaw')
		console.log(utcDate, timeString, hours + ":" + minutes, rawTime);
		return utcDate;
	});

	function findNextTimeIndex() {
		// return stopTimes.findIndex((time) => time > new Date())
		// console.log(isBefore(stopTimes[0], new Date()), stopTimes[0], new Date());
		return stopTimes.findIndex((time) => isBefore(time, new Date()))
	}

	const [nextStopTimeIndex, setNextStopTimeIndex] = createSignal(findNextTimeIndex());

	const interval = setInterval(() => {
		const foundNextTime = findNextTimeIndex()
		setNextStopTimeIndex(foundNextTime !== -1 ? foundNextTime : 0);

	}, 1000);
	onCleanup(() => clearInterval(interval));


	return (<>
		{now.toLocaleString()}<br/>
		{now.toLocaleString("pl-PL")}
		<span class="nextBusTimer">{timeFormater.format(stopTimes[nextStopTimeIndex()])}</span>
		<span class="subsequentBusTimer">{timeFormater.format(stopTimes[(nextStopTimeIndex() + 1) % stopTimes.length])}</span>
	</>
	);
}
