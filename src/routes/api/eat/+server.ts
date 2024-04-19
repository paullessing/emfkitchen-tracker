import { json } from '@sveltejs/kit';
import type { EatLog, StoreEaterRequestBody } from '$lib/log.types';
import { setupDatabase } from '$lib/db';

class RequestValidationError extends Error {
  constructor(
    public readonly userResponse: Response,
    error?: unknown,
  ) {
    super(
      'Failed to validate request',
      error
        ? {
            cause: error,
          }
        : {},
    );
  }
}

const db$ = setupDatabase();

export async function POST(event: { request: Request }): Promise<Response> {
  const { request } = event;

  let logs: EatLog[];
  try {
    logs = await validatePostBody(request);

    for (const { timestamp, type } of logs) {
      await (await db$).addEntry(new Date(timestamp), type);
    }

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
  let data: StoreEaterRequestBody;
  try {
    data = await request.json();
  } catch (e) {
    throw new RequestValidationError(
      json(
        { success: false, error: 'Failed to parse JSON' },
        {
          status: 400,
          statusText: 'Bad Request',
        },
      ),
      e,
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
          error: `Malformed request, expected: { logs: { timestamp: number, type: 'orga' | 'volunteer' }[] }`,
        },
        {
          status: 400,
          statusText: 'Bad Request',
        },
      ),
    );
  }

  return data.logs;
}
