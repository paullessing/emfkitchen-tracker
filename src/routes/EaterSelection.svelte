<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { EaterType } from '$lib/EaterType.type';

  const dispatch = createEventDispatcher<{ chooseType: EaterType }>();

  const handleClick = (type: EaterType) => () => dispatch('chooseType', type);
</script>

<div class="eater-selection">
  <button
    class="eater-selection__choice eater-selection__choice--volunteer"
    on:click={handleClick(EaterType.VOLUNTEER)}
    >Physical Token
  </button>
  <button
    class="eater-selection__choice eater-selection__choice--orga"
    on:click={handleClick(EaterType.ORGA)}
    >Wristband
  </button>
</div>

<style lang="scss">
  @import '../variables';

  .eater-selection {
    display: flex;

    $flex-gutter: 5rem;
    margin: 0 auto;
    max-width: 800px;

    &__choice {
      flex: 100% 1 1;
      height: 30vh;
      font-size: 4rem;
      line-height: 1.2;
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
        background: $colour-volunteer;
      }

      &--orga {
        background: $colour-orga;
      }
    }
  }
</style>
