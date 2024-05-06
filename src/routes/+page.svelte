<script lang="ts">
  import eaterService from '$lib/eaterService';
  import CounterConfirmationModal from './CounterConfirmationModal.svelte';
  import { EaterType } from '$lib/EaterType.type';
  import EaterSelection from './EaterSelection.svelte';
  import EaterStats from './EaterStats.svelte';
  import db from '$lib/db.browser';
  import type { EaterTotals } from '$lib/db.class';

  export let data: {
    totals: EaterTotals;
  };

  let chosenEaterType: EaterType | null = null;

  let totals: EaterTotals = data.totals;

  const onChooseEaterType = async ({ detail: type }: CustomEvent<EaterType>) => {
    chosenEaterType = type;

    await eaterService.logEater(type);

    totals = await db.getTotals();
  };
</script>

<img
  class="logo"
  src="/logo-outline.svg"
  alt="EMF Volunteer Kitchen"
  width="150"
/>

<h1 class="title">Volunteer Kitchen Counter</h1>

<p class="cta-header">
  Please click the counter matching your wristband<br />before taking a plate:
</p>

<EaterSelection on:chooseType={onChooseEaterType} />

<h2 class="people-served">People Served</h2>

<EaterStats {totals} />

<CounterConfirmationModal
  type={chosenEaterType}
  on:done={() => (chosenEaterType = null)}
></CounterConfirmationModal>

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

  .cta-header {
    text-align: center;
    font-size: 3rem;
    margin-top: 3rem;
    margin-bottom: 2rem;
  }
</style>
