import { json } from '@sveltejs/kit';

interface EatLog {
	timestamp: number;
	type: 'volunteer' | 'orga';
}

export async function POST(event: { request: Request }) {
	const { request } = event;
	let data: { logs: EatLog[] };
	try {
		data = await request.json();
	} catch (e) {
		return json(
			{ success: false, error: 'Failed to parse JSON' },
			{
				status: 400,
				statusText: 'Bad Request'
			}
		);
	}

	function isValidLogEntry(log: any): log is EatLog {
		return typeof log.timestamp === 'number' && ['orga', 'volunteer'].includes(log.type);
	}

	if (!('logs' in data) || !Array.isArray(data.logs) || !data.logs.every(isValidLogEntry)) {
		return json(
			{
				success: false,
				error: `Malformed request, expected: { logs: { timestamp: number, type: 'orga' | 'volunteer' }[] }`
			},
			{
				status: 400,
				statusText: 'Bad Request'
			}
		);
	}

	console.log(data);

	// it's common to return JSON, so SvelteKit has a helper
	return json({ success: true });
}
