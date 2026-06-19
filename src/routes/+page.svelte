<script lang="ts">
  import eaterService from '$lib/eaterService';
  import CounterConfirmationModal from './CounterConfirmationModal.svelte';
  import { EaterType } from '$lib/EaterType.type';
  import EaterSelection from './EaterSelection.svelte';
  import EaterStats from './EaterStats.svelte';
  import { browser } from '$app/environment';
  import type { Readable } from 'svelte/store';
  import type { EaterTotals } from '$lib/EaterTotals.type';

  let chosenEaterType: EaterType | null = null;

  let totals: Readable<EaterTotals> = eaterService.eaterTotals;
  if (browser) {
    eaterService.getTotals();
  }

  const onChooseEaterType = async ({ detail: type }: CustomEvent<EaterType>) => {
    chosenEaterType = type;

    await eaterService.logEater(type);
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

  <CounterConfirmationModal
    type={chosenEaterType}
    on:done={() => (chosenEaterType = null)}
  ></CounterConfirmationModal>
</div>

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
</style>
