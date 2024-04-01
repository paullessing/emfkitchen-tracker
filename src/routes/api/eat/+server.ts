import { json } from '@sveltejs/kit';

interface EatLog {
	timestamp: number;
	type: 'volunteer' | 'orga';
}

class RequestValidationError extends Error {
	constructor(
		public readonly userResponse: Response,
		error?: any
	) {
		super(
			'Failed to validate request',
			error
				? {
						cause: error
					}
				: {}
		);
	}
}

export async function POST(event: { request: Request }): Promise<Response> {
	const { request } = event;

	let logs: EatLog[];
	try {
		logs = await validatePostBody(request);

		console.log(logs);

		return json({ success: true });
	} catch (e) {
		if (e instanceof RequestValidationError) {
			return e.userResponse;
		} else {
			throw e;
		}
	}
}

async function validatePostBody(request: Request): Promise<EatLog[]> {
	let data: { logs: EatLog[] };
	try {
		data = await request.json();
	} catch (e) {
		throw new RequestValidationError(
			json(
				{ success: false, error: 'Failed to parse JSON' },
				{
					status: 400,
					statusText: 'Bad Request'
				}
			),
			e
		);
	}

	function isValidLogEntry(log: any): log is EatLog {
		return typeof log.timestamp === 'number' && ['orga', 'volunteer'].includes(log.type);
	}

	if (!('logs' in data) || !Array.isArray(data.logs) || !data.logs.every(isValidLogEntry)) {
		throw new RequestValidationError(
			json(
				{
					success: false,
					error: `Malformed request, expected: { logs: { timestamp: number, type: 'orga' | 'volunteer' }[] }`
				},
				{
					status: 400,
					statusText: 'Bad Request'
				}
			)
		);
	}

	return data.logs;
}
