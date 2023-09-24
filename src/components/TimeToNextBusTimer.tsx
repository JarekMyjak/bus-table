
import { createSignal, onCleanup } from 'solid-js';

type TimeToNextBusTimerProps = {
	rawStopTimes: string[];
}

export default function TimeToNextBusTimer({ rawStopTimes }: TimeToNextBusTimerProps) {

	const stopTimes = rawStopTimes.map((rawTime) => {
		const [hours, minutes] = rawTime.split(":").map(n => Number(n));

		const time = new Date();
		time.setHours(hours);
		time.setMinutes(minutes);
		time.setSeconds(59);
		return time;
	});

	function findNextTimeIndex() {
		return stopTimes.findIndex((time) => time > new Date())
	}

	const [nextStopTimeIndex, setNextStopTimeIndex] = createSignal(findNextTimeIndex());

	const interval = setInterval(() => {
		const foundNextTime = findNextTimeIndex()
		setNextStopTimeIndex(foundNextTime !== -1 ? foundNextTime : 0);

	}, 1000);
	onCleanup(() => clearInterval(interval));

	const timeFormater = new Intl.DateTimeFormat("hc", { hour: "numeric", minute: "2-digit" })

	return (<>
		<span class="nextBusTimer">{timeFormater.format(stopTimes[nextStopTimeIndex()])}</span>
		<span class="subsequentBusTimer">{timeFormater.format(stopTimes[(nextStopTimeIndex() + 1) % stopTimes.length])}</span>
	</>
	);
}
