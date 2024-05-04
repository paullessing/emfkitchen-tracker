import { json } from '@sveltejs/kit';
import type { EatLog, StoreEaterRequestBody } from '$lib/log.types';
import { createServerDatabase } from '$lib/server/db.server';

class RequestValidationError extends Error {
  constructor(
    public readonly userResponse: Response,
    error?: unknown,
  ) {
    super(
      'Failed to validate request',
      // @ts-expect-error Error constructor in Node has extra parameters; it doesn't in the browser
      error
        ? {
            cause: error,
          }
        : {},
    );
  }
}

const db = createServerDatabase();

export async function POST(event: { request: Request }): Promise<Response> {
  const { request } = event;

  try {
    const logs = await validatePostBody(request);

    for (const { timestamp, type } of logs) {
      await db.addEntry(new Date(timestamp), type);
    }

    const totalsByDay = await db.getTotalsByDay();

    console.log(logs);

    return json({ success: true, totals: totalsByDay });
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
