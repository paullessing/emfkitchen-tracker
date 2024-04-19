<script lang="ts">
  import { browser } from '$app/environment';
  import { setupDatabase } from '$lib/db';
  import type { StoreEaterRequestBody } from '$lib/log.types';

  const db = setupDatabase();

  // if (browser) {
  //   window.addDbEntry = (...args) => db.addEntry(...args);
  //   window.getDbTotals = (...args) => db.getTotals(...args);
  // }

  type ReminderType = 'none' | 'volunteer' | 'orga';
  let showReminder: ReminderType = 'none';

  const reminders: { [key in ReminderType]: string } = {
    volunteer: 'Please put your token into the provided container.',
    orga: 'Enjoy your lunch!',
    none: '',
  } as const;

  $: activeReminder = reminders[showReminder];

  let now = new Date();
  setInterval(() => {
    now = new Date();
  }, 60 * 1000);

  $: totals = db.then((_db) => _db.getTotals(now));

  const onClickType = (value: ReminderType) => async () => {
    showReminder = value;

    if (value === 'none') {
      return;
    }

    const now = new Date();

    // console.log('about to add', value);
    await (await db).addEntry(now, value);

    const body: StoreEaterRequestBody = {
      logs: [
        {
          type: value,
          timestamp: now.getTime(),
        },
      ],
    };

    fetch('/api/eat', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    // console.log('done adding');
    totals = (await db).getTotals(now);

    setTimeout(() => {
      showReminder = 'none';
    }, 5000);
  };
</script>

<p>EMF Volunteer Kitchen</p>
<h1>Eater Counter</h1>

{#await totals}
  Loading totals...
{:then results}
  <dl class="stats">
    <dt class="stats__title">This Meal</dt>
    <dd class="stats__number">{results.currentMeal + 1}</dd>
    <dt class="stats__title">Today</dt>
    <dd class="stats__number">{results.today + 1}</dd>
    <dt class="stats__title">All EMF</dt>
    <dd class="stats__number">{results.allTime + 1}</dd>
  </dl>
{/await}

<p class="button-label">Please select your role before taking a plate:</p>
<div class="eater-selection">
  <button
    class="eater-selection__choice eater-selection__choice--volunteer"
    on:click={onClickType('volunteer')}
    >Vo&shy;lun&shy;teer
  </button>
  <button
    class="eater-selection__choice eater-selection__choice--orga"
    on:click={onClickType('orga')}
    >EMF Orga Member
  </button>
</div>

{#if activeReminder}
  <div class="modal">
    <p class="reminder">Thank you!<br />{activeReminder}</p>
    <p class="reminder">
      <button on:click={onClickType('none')}>Next Person</button>
    </p>
  </div>
{/if}

<style lang="scss">
  .eater-selection {
    display: flex;

    $flex-gutter: 5vw;
    padding: 0 (-$flex-gutter * 0.5);
    margin: 0 auto;
    max-width: 1000px;

    &__choice {
      flex: 100% 1 1;
      height: 30vh;
      font-size: 5vh;
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

  .button-label {
    text-align: center;
    font-size: 2rem;
    margin-top: 3rem;
  }

  .stats {
    display: grid;
    grid-template-rows: auto auto;
    grid-column-gap: 4px;
    grid-row-gap: 5px;
    grid-auto-flow: column;

    text-align: center;

    max-width: 1000px;
    margin: 0 auto;

    &__title {
      font-size: 2rem;
      margin: 0;
    }

    &__number {
      font-size: 5rem;
      margin: 0;
    }
  }

  .modal {
    position: fixed;
    left: 10vh;
    right: 10vh;
    top: 10vw;
    bottom: 10vw;
    background: white;
    box-shadow: 0 0 16px 4px rgba(0, 0, 0, 0.3);
    padding: 8rem;
    text-align: center;
  }

  .reminder {
    font-size: 2rem;

    button {
      border: none;
      box-shadow: 0 0 16px 4px rgba(0, 0, 0, 0.3);

      border-radius: 1rem;
      background-color: aquamarine;
      padding: 1rem;
      font-size: 2rem;
    }
  }
</style>
