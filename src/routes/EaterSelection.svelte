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
    >Meal Token<br />
    <span class="eater-selection__subtitle">One-off Volunteers</span>
  </button>
  <button
    class="eater-selection__choice eater-selection__choice--orga"
    on:click={handleClick(EaterType.ORGA)}
    >Wristband<br />
    <span class="eater-selection__subtitle">Permanent Volunteers</span>
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
      box-shadow:
        0 6px 0 0 rgba(180, 180, 180, 0.5),
        0 8px 6px 4px rgba(0, 0, 0, 0.3);

      &:active {
        position: relative;
        top: 6px;
        box-shadow: none;
      }

      border-radius: 0.5rem;

      margin: 0 ($flex-gutter * 0.5);

      // &:not(:last-child) {
      // 	margin-right: 10vw;
      // }

      &--volunteer {
        //background: $colour-volunteer;
        background: linear-gradient(135deg, #afc944 0%, #528329 100%);
      }

      &--orga {
        //background: $colour-orga;
        background: linear-gradient(135deg, $orange 0%, $pink 100%);
      }
    }

    &__subtitle {
      font-size: 0.6em;
    }
  }
</style>
