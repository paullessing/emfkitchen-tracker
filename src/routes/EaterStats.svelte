<script lang="ts">
  import type { EaterTotals } from '$lib/EaterTotals.type';
  import { onMount } from 'svelte';

  export let totals: EaterTotals;

  let mounted = false;
  let prevMeal = 0;
  let prevToday = 0;
  let prevAll = 0;
  let animating = false;
  let animTimer: ReturnType<typeof setTimeout> | null = null;

  onMount(() => {
    prevMeal = totals.currentMeal;
    prevToday = totals.today;
    prevAll = totals.allTime;
    mounted = true;
  });

  $: if (mounted && totals) {
    if (
      totals.currentMeal !== prevMeal ||
      totals.today !== prevToday ||
      totals.allTime !== prevAll
    ) {
      if (totals.currentMeal !== prevMeal) {
        if (animTimer) clearTimeout(animTimer);
        animating = false;
        // Let Svelte flush the class removal before re-adding
        setTimeout(() => {
          animating = true;
          animTimer = setTimeout(() => {
            animating = false;
            animTimer = null;
          }, 900);
        }, 0);
      }
      prevMeal = totals.currentMeal;
      prevToday = totals.today;
      prevAll = totals.allTime;
    }
  }
</script>

<dl class="stats">
  <dt class="stats__title">This Meal</dt>
  <dd
    class="stats__number"
    class:animating
  >
    {totals.currentMeal}
  </dd>
  <dt class="stats__title">Today</dt>
  <dd class="stats__number">{totals.today}</dd>
  <dt class="stats__title">All EMF</dt>
  <dd class="stats__number">{totals.allTime}</dd>
</dl>

<style lang="scss">
  @import '../variables';

  @keyframes bump {
    0% {
      transform: scale(1);
      color: inherit;
    }
    20% {
      transform: scale(2.4);
      color: $yellow;
    }
    60% {
      transform: scale(2);
      color: $yellow;
    }
    100% {
      transform: scale(1);
      color: inherit;
    }
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
      line-height: 1.2;
      margin: 0;

      &.animating {
        animation: bump 650ms ease-out;
      }
    }
  }
</style>
