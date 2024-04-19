<script lang="ts">
  import {browser} from '$app/environment';
  import {setupDatabase} from '$lib/db';

  const db = setupDatabase();

  if (browser) {
    window.addDbEntry = (...args) => db.addEntry(...args);
    window.getDbTotals = (...args) => db.getTotals(...args);
  }

  type ReminderType = 'none' | 'volunteer' | 'orga';
  let showReminder: ReminderType = 'none';

  const reminders: { [key in ReminderType]: string } = {
    volunteer: 'Please put your token into the provided container.',
    orga: 'Enjoy your lunch!',
    none: ''
  } as const;

  $: activeReminder = reminders[showReminder];

  let now = new Date();
  setInterval(() => {
    now = new Date();
  }, 60 * 1000);

  $: totals = db.getTotals(now);

  const onClickType = (value: ReminderType) => async () => {
    showReminder = value;

    if (value === 'none') {
      return;
    }

    // console.log('about to add', value);
    await db.addEntry(new Date(), value);
    // console.log('done adding');
    totals = db.getTotals(new Date());

    setTimeout(() => {
      showReminder = 'none';
    }, 5000);
  };
</script>

<p>EMF Volunteer Kitchen</p>
<h1>Eater Counter</h1>
<p>Please select your role before taking a plate</p>
<div class="eater-selection">
    <button
            class="eater-selection__choice eater-selection__choice--volunteer"
            on:click={onClickType('volunteer')}>Vo&shy;lun&shy;teer
    </button
    >
    <button
            class="eater-selection__choice eater-selection__choice--orga"
            on:click={onClickType('orga')}>EMF Orga Member
    </button
    >
</div>
{#await totals}
    Loading totals...
{:then results}
    <p>Meal no. #{results.currentMeal + 1}</p>
    <p>Total meals served today: {results.today}</p>
    <p>Total meals served this EMF: {results.allTime}</p>
{/await}

{#if activeReminder}
    <p class="reminder">Thank you!<br/>{activeReminder}</p>
    <p>
        <button on:click={onClickType('none')}>Next Person</button>
    </p>
{/if}

<style lang="scss">
  .eater-selection {
    display: flex;

    $flex-gutter: 5vw;
    padding: 0 ($flex-gutter * 0.5);

    &__choice {
      flex: 100% 1 1;
      height: 70vh;
      font-size: 10vh;
      text-wrap: wrap;
      word-wrap: break-word;
      padding: 2rem;

      border: 0;
      box-shadow: 0 0 16px 4px rgba(0, 0, 0, 0.3);

      border-radius: 20px;

      margin: 0 ($flex-gutter * 0.5);

      // &:not(:last-child) {
      // 	margin-right: 10vw;
      // }

      &--volunteer {
        background: #ffff93;
      }

      &--orga {
        background: #9891ff;
      }
    }
  }
</style>
