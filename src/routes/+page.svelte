<script lang="ts">
  import eaterService from '$lib/eaterService';
  import { EaterType } from '$lib/EaterType.type';
  import EaterSelection from './EaterSelection.svelte';
  import EaterStats from './EaterStats.svelte';
  import { browser } from '$app/environment';
  import { fly } from 'svelte/transition';
  import { bounceOut, backIn, elasticIn, backOut } from 'svelte/easing';
  import type { Readable } from 'svelte/store';
  import type { EaterTotals } from '$lib/EaterTotals.type';

  let totals: Readable<EaterTotals> = eaterService.eaterTotals;
  if (browser) {
    eaterService.getTotals();
  }

  let showTokenReminder = false;
  let tokenReminderKey = 0;
  let tokenReminderTimer: ReturnType<typeof setTimeout> | null = null;

  const TOAST_DURATION_MS = 4000;

  const onChooseEaterType = async ({ detail: type }: CustomEvent<EaterType>) => {
    await eaterService.logEater(type);

    if (type === EaterType.VOLUNTEER) {
      if (tokenReminderTimer) clearTimeout(tokenReminderTimer);
      showTokenReminder = true;
      tokenReminderKey++;
      tokenReminderTimer = setTimeout(() => {
        showTokenReminder = false;
        tokenReminderTimer = null;
      }, TOAST_DURATION_MS);
    }
  };

  let fullscreenTimeoutTimer: Timeout | null = null;
  const clearTimer = () => {
    if (fullscreenTimeoutTimer) {
      clearTimeout(fullscreenTimeoutTimer);
      fullscreenTimeoutTimer = null;
    }
  };
  let fullscreenTapCount = 0;
  const toggleFullscreen = () => {
    fullscreenTapCount++;
    console.log('click', fullscreenTapCount);
    clearTimer();

    if (fullscreenTapCount >= 5) {
      fullscreenTapCount = 0;

      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.getElementById('content')?.requestFullscreen();
      }
    } else {
      fullscreenTimeoutTimer = setTimeout(() => {
        console.log('reset');
        fullscreenTapCount = 0;
        clearTimer();
      }, 500);
    }
  };
</script>

<div id="content">
  <!-- svelte-ignore a11y-invalid-attribute -->
  <a
    on:click={toggleFullscreen}
    role="button"
    tabindex="0"
    href="javascript:void(0);"
  >
    <img
      class="logo"
      src="/logo-outline.svg"
      alt="EMF Volunteer Kitchen"
    />
  </a>

  <h1 class="title">Volunteer Kitchen Meal Log</h1>

  <p class="cta-header">
    Please log your token type<br />before taking a plate:
  </p>

  <EaterSelection on:chooseType={onChooseEaterType} />

  <h2 class="people-served">People Served</h2>

  <EaterStats totals={$totals} />
</div>

{#if showTokenReminder}
  <div
    class="token-reminder"
    in:fly={{ y: -120, duration: 400, easing: backOut }}
    out:fly={{ y: -120, duration: 400, easing: backIn }}
  >
    Please put your <strong>TOKEN</strong> into the <strong>BOX</strong>.
    {#key tokenReminderKey}
      <div class="token-reminder__bar"></div>
    {/key}
  </div>
{/if}

<style lang="scss">
  @import '../variables';

  .logo {
    position: absolute;
    left: 3rem;
    top: 2rem;
    height: 15rem;
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

  .cta-header {
    text-align: center;
    font-size: 2.7rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
  }

  .token-reminder {
    position: fixed;
    top: 2rem;
    left: 0;
    right: 0;
    width: fit-content;
    margin: 0 auto;
    background: $green;
    color: black;
    font-size: 3rem;
    font-weight: bold;
    padding: 1.5rem 3rem 1.8rem;
    border-radius: 0.5rem;
    text-align: center;
    pointer-events: none;
    z-index: 100;
    box-shadow: 0 0 2rem rgba(0, 0, 0, 0.5);
    white-space: nowrap;
    overflow: hidden;

    &__bar {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 6px;
      width: 100%;
      background: rgba(0, 0, 0, 0.35);
      animation: shrink 4s linear forwards;
    }
  }

  @keyframes shrink {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
</style>
