<script lang="ts">
  import { createBrowserDatabase } from '$lib/db.browser';
  import type { StoreEaterRequestBody } from '$lib/log.types';

  const db = createBrowserDatabase();

  // if (browser) {
  //   window.addDbEntry = (...args) => db.addEntry(...args);
  //   window.getDbTotals = (...args) => db.getTotals(...args);
  // }

  type ReminderType = 'none' | 'volunteer' | 'orga';
  let showReminder: ReminderType = 'none';
  let reminder: { time: number; interval: number | null; timeout: number | null } = {
    time: 0,
    interval: null,
    timeout: null,
  };

  const reminders: { [key in ReminderType]: string } = {
    volunteer: 'Please put your token into the provided container.',
    orga: 'Enjoy your meal!',
    none: '',
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

    const now = new Date();

    // console.log('about to add', value);
    await db.addEntry(now, value);

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
    }).then(
      async (res) => {
        const { success, totals: remoteTotals } = (await res.json()) as {
          success: boolean;
          totals: Record<string, number>;
        };

        if (!success) {
          console.error('No success');
          return;
        }

        const localTotals = await db.getTotalsByDay();

        const localDays = new Set(Object.keys(localTotals));
        console.log(localTotals, remoteTotals);
        for (let [day, remoteCount] of Object.entries(remoteTotals)) {
          // console.log(`Day ${day}, Count: ${remoteCount}, Remote data: ${remoteTotals[day]}`);
          if (localDays.has(day) && remoteCount >= localTotals[day]) {
            localDays.delete(day);
          }
        }
        // localDays contains list of days we need to synchronise
        if (localDays.size > 0) {
          const dataToSync = await db.getAllLogsForDays(Array.from(localDays.values()));
          console.log('days', [...localDays.values()], dataToSync);
          await fetch('/api/eat', {
            method: 'POST',
            body: JSON.stringify({ logs: dataToSync } as StoreEaterRequestBody),
          });
        }
      },
      (error) => {
        console.warn('Failed to submit data to backend:', error);
      },
    );

    // console.log('done adding');
    totals = db.getTotals(now);

    clearInterval(reminder.interval);
    clearTimeout(reminder.timeout);
    const REMINDER_DURATION_MS = 5000;
    const reminderHideTime = Date.now() + REMINDER_DURATION_MS;
    reminder.interval = setInterval(() => {
      reminder.time = Math.ceil((reminderHideTime - Date.now()) / 1000);
    }, 100);
    reminder.timeout = setTimeout(() => {
      showReminder = 'none';
      clearInterval(reminder.interval);
    }, REMINDER_DURATION_MS);
  };
</script>

<img class="logo" src="/logo-outline.svg" alt="EMF Volunteer Kitchen" width="150" />

<h1 class="title">Volunteer Kitchen Counter</h1>

<p class="cta-header">Please count your meal below<br />before taking a plate:</p>
<div class="eater-selection">
  <button
    class="eater-selection__choice eater-selection__choice--volunteer"
    on:click={onClickType('volunteer')}
    ><span style="font-size:2em">+1</span><br />Vo&shy;lun&shy;teer
  </button>
  <button
    class="eater-selection__choice eater-selection__choice--orga"
    on:click={onClickType('orga')}
    ><span style="font-size:2em">+1</span><br />EMF Orga
  </button>
</div>

<h2 class="people-served">People Served</h2>

{#await totals}
  Loading totals...
{:then results}
  <dl class="stats">
    <dt class="stats__title">This Meal</dt>
    <dd class="stats__number">{results.currentMeal}</dd>
    <dt class="stats__title">Today</dt>
    <dd class="stats__number">{results.today}</dd>
    <dt class="stats__title">All EMF</dt>
    <dd class="stats__number">{results.allTime}</dd>
  </dl>
{/await}

{#if activeReminder}
  <div class="modal">
    <p class="reminder">Thank you!</p>
    <p class="reminder reminder--important">{activeReminder}</p>
    <p class="reminder reminder--end">
      <button on:click={onClickType('none')}>Next Person</button>
    </p>
    <p class="reminder__timer">{reminder.time}s</p>
  </div>
{/if}

<style lang="scss">
  @import '../variables';

  .logo {
    position: absolute;
    left: -1rem;
    top: 1rem;
  }

  .title {
    text-align: center;
    font-size: 4rem;
  }

  .people-served {
    text-align: center;
    font-size: 3rem;
    margin-top: 3rem;
  }

  .eater-selection {
    display: flex;

    $flex-gutter: 5vw;
    padding: 0 (-$flex-gutter * 0.5);
    margin: 0 auto;
    max-width: 800px;

    &__choice {
      flex: 100% 1 1;
      height: 30vh;
      font-size: 5vh;
      word-wrap: break-word;
      padding: 2rem;

      border: 0;
      box-shadow: 0 0 16px 4px rgba(0, 0, 0, 0.3);

      border-radius: 0.5rem;

      margin: 0 ($flex-gutter * 0.5);

      // &:not(:last-child) {
      // 	margin-right: 10vw;
      // }

      &--volunteer {
        background: $pale-green;
      }

      &--orga {
        background: $blue;
      }
    }
  }

  .cta-header {
    text-align: center;
    font-size: 3rem;
    margin-top: 3rem;
    margin-bottom: 2rem;
  }

  .stats {
    display: grid;
    grid-template-rows: auto auto;
    grid-column-gap: 4px;
    grid-row-gap: 5px;
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);

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
    top: 50%;
    transform: translateY(-50%);
    background: $dark-green;
    box-shadow: 0 0 16px 4px rgba(white, 0.3);
    padding: 8rem;
    text-align: center;
    border-radius: 0.5rem;

    display: flex;
    flex-direction: column;
  }

  .reminder {
    font-size: 3rem;
    margin-bottom: 1rem;
    position: relative;

    &:last-child {
      margin-bottom: 0;
    }

    &--important {
      font-size: 4rem;
    }

    button {
      border: none;
      box-shadow: 0 0 16px 4px rgba(black, 0.3);

      border-radius: 0.5rem;
      background-color: $pale-green;
      padding: 2rem 4rem;
      font-size: 2rem;
    }

    &--end {
      margin-top: 2rem;
    }

    &__timer {
      position: absolute;
      bottom: 1rem;
      left: calc(100% - 2em);
    }
  }
</style>
