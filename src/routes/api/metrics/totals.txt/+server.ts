import db from '$lib/server/db.server';

export async function GET(event: { request: Request }): Promise<Response> {
  // console.log(event);
  const totals = await db.getTotals(new Date());

  return new Response(
    `# HELP current_meal_count The current number of meals served.
# TYPE current_meal_count counter
current_meal_count ${totals.currentMeal}

# HELP today_count The number of meals served today.
# TYPE today_count counter
today_count ${totals.today}

# HELP total_count The total number of meals served this festival.
# TYPE total_count counter
total_count ${totals.allTime}
`,
    {
      headers: {
        'Content-Type': 'text/plain',
      },
    },
  );
}
