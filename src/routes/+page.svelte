<script lang="ts">
	import * as db from '$lib/db';

	db.setupDb();

	type ReminderType = 'none' | 'volunteer' | 'orga';
	let showReminder: ReminderType = 'none';

	const reminders: { [key in ReminderType]: string } = {
		volunteer: 'Please put your token into the provided container.',
		orga: 'Enjoy your lunch!',
		none: ''
	} as const;

	$: activeReminder = reminders[showReminder];

	const onClickType = (value: ReminderType) => async () => {
		if (value === 'none') {
			return;
		}

		showReminder = value;

		console.log('about to add', value);
		await db.addEntry(new Date(), value);
		console.log('done adding');

		setTimeout(() => {
			showReminder = 'none';
		}, 5000);
	};
</script>

<h1>EMF Volunteer Kitchen</h1>
<h2>Please select your role before taking a plate</h2>
<button on:click={onClickType('volunteer')}>Volunteer</button>
<button on:click={onClickType('orga')}>EMF Orga Member</button>

{#if activeReminder}
	<p class="reminder">Thank you!<br />{activeReminder}</p>
{/if}
