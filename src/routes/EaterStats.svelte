<script lang="ts">

  import type { EaterTotals } from '$lib/EaterTotals.type';

  export let totals: EaterTotals;
</script>

<dl class="stats">
  <dt class="stats__title">This Meal</dt>
  <dd class="stats__number">{totals.currentMeal}</dd>
  <dt class="stats__title">Today</dt>
  <dd class="stats__number">{totals.today}</dd>
  <dt class="stats__title">All EMF</dt>
  <dd class="stats__number">{totals.allTime}</dd>
</dl>

<style lang="scss">
  @import '../variables';

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
</style>
