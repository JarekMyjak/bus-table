
import { createSignal, onCleanup, createEffect } from 'solid-js';
import { getTimezoneOffset } from "date-fns-tz";

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

	const stopTimes = rawStopTimes.filter(rawTime => rawTime !== "").map((rawTime) => {
		const [hours, minutes] = rawTime.split(":").map(n => Number(n));
		const timeCopy = new Date(adjustedDate)
		timeCopy.setHours(hours ?? 0, minutes, 59)

		return timeCopy;
	});

	function findNextTimeIndex() {
		const newAdjustedTime = new Date(new Date().getTime() + relativeOffset);
		const foundNextTime = stopTimes.findIndex((time) => time > newAdjustedTime);
		const returnTime = foundNextTime !== -1 ? foundNextTime : 0;
		return returnTime;
	}

	const [nextStopTimeIndex, setNextStopTimeIndex] = createSignal(findNextTimeIndex());

	let timeout: NodeJS.Timeout | undefined;
	createEffect(() => {
		timeout = setTimeout(() => {
			setNextStopTimeIndex(current => findNextTimeIndex());
		}, Number(stopTimes[nextStopTimeIndex()]) - Number(new Date(Number(new Date()) + relativeOffset)));
	});
	onCleanup(() => clearTimeout(timeout));

	const higlightedTime = stopTimes[nextStopTimeIndex()];
	const remainingTimes = [
		...stopTimes.slice((nextStopTimeIndex() + 1)),
		...stopTimes.slice(0, (nextStopTimeIndex()))
	];

	return (
		<>
			<span class="font-bold text-5xl">
				{timeFormater.format(higlightedTime)}
			</span>
			{remainingTimes.map(
				(time) => <span class="font-bold text-4xl text-gray-400">
					{timeFormater.format(time)}
				</span>
			)}
		</>
	);
}
