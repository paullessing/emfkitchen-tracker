<script lang="ts">
  import Modal from '$lib/components/Modal.svelte';
  import type { EaterType } from '$lib/EaterType.type';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    done: undefined;
  }>();

  export let type: EaterType | null;
  $: if (type) {
    openModal();
  } else {
    isModalOpen = false;
    intervalRef && clearInterval(intervalRef);
  }

  const MODAL_TIMEOUT_MS = 5000;

  let isModalOpen = false;
  let intervalRef: number | null = null;
  let timerSeconds = 0;

  function openModal() {
    isModalOpen = true;
    intervalRef && clearInterval(intervalRef);
    const reminderHideTime = Date.now() + MODAL_TIMEOUT_MS;

    intervalRef = setInterval(() => {
      timerSeconds = Math.ceil((reminderHideTime - Date.now()) / 1000);

      if (timerSeconds <= 0) {
        isModalOpen = false;
        intervalRef && clearInterval(intervalRef);
        dispatch('done');
      }
    }, 100) as unknown as number;
  }

  function handleDone() {
    dispatch('done');
  }
</script>

<Modal isOpen={isModalOpen}>
  <div class="confirmation">
    <p class="confirmation__text">Thank you!</p>
    {#if type === 'orga'}
      <p class="confirmation__text confirmation__text--important">Enjoy your meal!</p>
    {:else}
      <p class="confirmation__text confirmation__text--important">
        Please put your token into the provided container.
      </p>
    {/if}
    <p class="confirmation__actions">
      <button
        class="confirmation__action"
        on:click={handleDone}
      >Next Person
      </button>
    </p>
  </div>
  {#if timerSeconds >= 0}
    <p class="confirmation__timer">{timerSeconds}</p>
  {/if}
</Modal>

<style lang="scss">
  @import '../variables';

  .confirmation {
    font-size: 3rem;
    margin-bottom: 1rem;
    position: relative;

    &:last-child {
      margin-bottom: 0;
    }

    &__text {
      &--important {
        font-size: 4rem;
      }
    }

    &__actions {
      margin-top: 2rem;
    }

    &__action {
      border: none;
      box-shadow: 0 0 16px 4px rgba(black, 0.3);

      border-radius: 0.5rem;
      background-color: $pale-green;
      padding: 2rem 4rem;
      font-size: 2rem;
    }

    &__timer {
      font-size: 2em;
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 2rem;
      text-align: right;
    }
  }
</style>
